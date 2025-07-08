import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from '../api/http';
import type { ChatCompletionRequest, ChatCompletionResponse, ModelInfo } from '../types/index.ts';

// Get available models
export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const cacheKey = 'models_cache_v1';
      try {
        const response = await http.get('/v1/models/');
        const models: ModelInfo[] = response.data;
        // Save to localStorage with timestamp
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: models }));
        return models;
      } catch (err) {
        // On network failure, attempt to use cache if valid
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const age = Date.now() - parsed.ts;
            if (age < 10 * 60 * 1000) {
              return parsed.data as ModelInfo[];
            }
          } catch (_) {
            /* fallthrough */
          }
        }
        throw err; // rethrow if no valid cache
      }
    },
    /* Transform raw backend data into rich ModelInfo objects with derived UI helpers. */
    select: (data: ModelInfo[]): ModelInfo[] => {
      return data.map((model) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metadata: Record<string, unknown> = (model as any).metadata ?? {};

        // --- Compute contextLength ---
        let contextLength: number | undefined = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metaAny = metadata as any;
        if (metaAny?.details?.context_length && typeof metaAny.details.context_length === 'number') {
          contextLength = metaAny.details.context_length;
        } else if (metaAny?.model_info) {
          for (const [key, value] of Object.entries(metaAny.model_info)) {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const details = (metaAny?.details ?? {}) as any;
        const displayLabelParts: string[] = [];
        if (details.family) displayLabelParts.push(String(details.family));
        if (details.format) displayLabelParts.push(String(details.format).toUpperCase());
        if (details.parameter_size) displayLabelParts.push(String(details.parameter_size));
        if (details.quantization_level) displayLabelParts.push(String(details.quantization_level));
        const displayLabel = displayLabelParts.join(' ');

        return {
          ...model,
          metadata,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parameterSize: (model as any).parameterSize ?? (details as any).parameter_size,
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
      const requestId = Math.random().toString(36).slice(2, 10); // short random id for tracing
      console.debug(`[stream:${requestId}] starting streaming request`, requestData);
      
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
        console.debug(`[stream:${requestId}] HTTP error`, response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.debug(`[stream:${requestId}] Response body is not readable`);
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let usageTokens: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.debug(`[stream:${requestId}] DONE`);
          break;
        }

        const decoded = decoder.decode(value, { stream: true });
        console.debug(`[stream:${requestId}] raw chunk`, decoded);
        buffer += decoded;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.debug(`[stream:${requestId}] got [DONE]`);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
              if (parsed.usage) {
                usageTokens = parsed.usage;
              }
            } catch (_e) {
              console.warn(`[stream:${requestId}] Failed to parse SSE data:`, data);
            }
          }
        }
      }

      return usageTokens || {};
    },
  });
}; 