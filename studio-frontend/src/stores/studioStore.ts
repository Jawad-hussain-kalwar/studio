import { create } from 'zustand';
import type { ChatMessage, ToolToggleState } from '../types/index.ts';

interface StudioState {
  // Chat state
  messages: ChatMessage[];
  currentModel: string;
  temperature: number;
  topP: number;
  tools: ToolToggleState;
  isGenerating: boolean;
  tokenCount: {
    prompt: number;
    completion: number;
    total: number;
  };
  
  // UI state
  isSettingsDrawerOpen: boolean;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  updateLastMessage: (content: string) => void;
  setCurrentModel: (model: string) => void;
  setTemperature: (temperature: number) => void;
  setTopP: (topP: number) => void;
  toggleTool: (toolName: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setTokenCount: (tokenCount: { prompt: number; completion: number; total: number }) => void;
  clearMessages: () => void;
  setSettingsDrawerOpen: (open: boolean) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  // Initial state
  messages: [],
  currentModel: 'gemini-2.5-flash-preview-04-17',
  temperature: 1,
  topP: 0.95,
  tools: {
    'url-context': false,
    'speech-generation': false,
    'audio-dialog': false,
    'image-generation': false,
    'grounding-google-search': false,
    'function-calling': false,
    'code-execution': false,
  },
  isGenerating: false,
  tokenCount: {
    prompt: 0,
    completion: 0,
    total: 0,
  },
  isSettingsDrawerOpen: false,

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

  updateLastMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
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
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  setTokenCount: (tokenCount) => set({ tokenCount }),
  
  clearMessages: () => set({ 
    messages: [],
    tokenCount: { prompt: 0, completion: 0, total: 0 },
  }),
  
  setSettingsDrawerOpen: (open) => set({ isSettingsDrawerOpen: open }),
})); 