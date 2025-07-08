import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from '../api/http';
import type { ChatCompletionRequest, ChatCompletionResponse, ModelInfo } from '../types/index.ts';

// Get available models
export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await http.get('/v1/models/');
      return response.data;
    },
    /* Transform raw backend data into rich ModelInfo objects with derived UI helpers. */
    select: (data: ModelInfo[]): ModelInfo[] => {
      return data.map((model) => {
        const metadata: any = (model as any).metadata ?? {};

        // --- Compute contextLength ---
        let contextLength: number | undefined = undefined;
        if (metadata?.details?.context_length && typeof metadata.details.context_length === 'number') {
          contextLength = metadata.details.context_length;
        } else if (metadata?.model_info) {
          for (const [key, value] of Object.entries(metadata.model_info)) {
            if (key.endsWith('.context_length') && typeof value === 'number') {
              contextLength = value as number;
              break;
            }
          }
        }

        // --- Compute capabilities array ---
        const capabilities: string[] = Array.isArray(metadata.capabilities)
          ? (metadata.capabilities as unknown[]).map(String)
          : [];

        // --- Compute displayLabel ---
        const details = metadata?.details ?? {};
        const displayLabelParts: string[] = [];
        if (details.family) displayLabelParts.push(String(details.family));
        if (details.format) displayLabelParts.push(String(details.format).toUpperCase());
        if (details.parameter_size) displayLabelParts.push(String(details.parameter_size));
        if (details.quantization_level) displayLabelParts.push(String(details.quantization_level));
        const displayLabel = displayLabelParts.join(' ');

        return {
          ...model,
          metadata,
          parameterSize: (model as any).parameterSize ?? details.parameter_size,
          contextLength: contextLength ?? model.contextLength,
          capabilities,
          displayLabel,
        } as ModelInfo;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Only fetch on mount
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchInterval: false, // Disable automatic refetching
    retry: 1, // Only retry once on failure
  });
};

// Chat completion mutation
export const useChatCompletion = () => {
  return useMutation({
    mutationFn: async (request: ChatCompletionRequest): Promise<ChatCompletionResponse> => {
      const response = await http.post('/v1/chat/completions/', request);
      return response.data;
    },
  });
};

// Streaming chat completion
export const useStreamingChat = () => {
  return useMutation({
    mutationFn: async (request: ChatCompletionRequest & { onChunk: (chunk: string) => void }): Promise<{ promptTokens?: number; completionTokens?: number; totalTokens?: number }> => {
      const { onChunk, ...requestData } = request;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/v1/chat/completions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          ...requestData,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let usageTokens: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Reached stream end
              break;
            }
            try {
              const parsed = JSON.parse(data);

              // Capture incremental content chunks
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }

              // Capture final usage tokens if present in this chunk
              if (parsed.usage) {
                usageTokens = parsed.usage;
              }
            } catch (_e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }

      // Return the usage tokens to caller (may be undefined if not provided)
      return usageTokens || {};
    },
  });
}; 