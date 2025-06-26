// Chat Types for AI Studio
// This file contains all TypeScript interfaces for the chat functionality

export declare interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  error?: boolean;
  functionCall?: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export declare interface ModelInfo {
  id: string;
  name: string;
  description: string;
  contextLength: number;
}

export declare interface ToolToggleState {
  [toolName: string]: boolean;
}

export declare interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  topP?: number;
  tools?: string[];
  stream?: boolean;
}

export declare interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finishReason: string;
  }[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export declare interface PromptCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  isNew?: boolean;
} 