import { create } from 'zustand';
import type { ChatMessage, ToolToggleState } from '../types/index.ts';

interface StudioState {
  // Chat state
  messages: ChatMessage[];
  currentModel: string | null;
  temperature: number;
  topP: number;
  tools: ToolToggleState;
  isGenerating: boolean;
  tokenCount: {
    prompt: number;
    completion: number;
    total: number;
    contextLength: number;
  };
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  updateLastMessage: (content: string, error?: boolean) => void;
  setCurrentModel: (model: string | null) => void;
  setTemperature: (temperature: number) => void;
  setTopP: (topP: number) => void;
  toggleTool: (toolName: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setTokenCount: (tokenCount: { prompt: number; completion: number; total: number; contextLength?: number }) => void;
  clearMessages: () => void;
  setTools: (tools: ToolToggleState) => void;
  setContextLength: (contextLength: number) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  // Initial state
  messages: [],
  currentModel: null,
  temperature: 1,
  topP: 0.95,
  tools: {
    'url-context': false,
    'grounding-google-search': false,
    'function-calling': false,
    'code-execution': false,
    vision: false,
  },
  isGenerating: false,
  tokenCount: {
    prompt: 0,
    completion: 0,
    total: 0,
    contextLength: 1048576,
  },

  // Actions
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  updateLastMessage: (content, error) => {
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
          ...(error !== undefined ? { error } : {}),
        } as typeof messages[number];
      }
      return { messages };
    });
  },

  setCurrentModel: (model) => set({ currentModel: model }),
  
  setTemperature: (temperature) => set({ temperature }),
  
  setTopP: (topP) => set({ topP }),
  
  toggleTool: (toolName) => set((state) => ({
    tools: {
      ...state.tools,
      [toolName]: !state.tools[toolName],
    },
  })),

  setTools: (tools) => set({ tools }),

  setContextLength: (contextLength) => set((state) => ({
    tokenCount: {
      ...state.tokenCount,
      contextLength,
    },
  })),

  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  setTokenCount: (tokenCount) => set((state) => ({ tokenCount: { ...state.tokenCount, ...tokenCount } })),
  
  clearMessages: () => set((state) => ({ 
    messages: [],
    tokenCount: { prompt: 0, completion: 0, total: 0, contextLength: state.tokenCount.contextLength },
  })),
})); 