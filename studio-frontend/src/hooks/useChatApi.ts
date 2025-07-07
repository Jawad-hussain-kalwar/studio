import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from '../api/http';
import type { ChatCompletionRequest, ChatCompletionResponse, ModelInfo } from '../types/index.ts';

// Get available models
export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await http.get('/v1/models');
      return response.data;
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
      const response = await http.post('/v1/chat/completions', request);
      return response.data;
    },
  });
};

// Streaming chat completion
export const useStreamingChat = () => {
  return useMutation({
    mutationFn: async (request: ChatCompletionRequest & { onChunk: (chunk: string) => void }) => {
      const { onChunk, ...requestData } = request;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/v1/chat/completions`, {
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
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (_e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    },
  });
}; 