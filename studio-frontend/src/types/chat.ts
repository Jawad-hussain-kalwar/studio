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
  description?: string;
  /** Raw parameter size (e.g. "1.7B" or number of parameters) */
  parameterSize?: string | number;
  /** Backend metadata blob returned by /v1/models – architecture-specific */
  metadata?: Record<string, unknown>;
  /** Computed: maximum context length (tokens) supported by the model */
  contextLength?: number;
  /** Computed: array of capability strings such as "vision", "tools" */
  capabilities?: string[];
  /** Computed: human-friendly label for dropdowns like "llama GGUF 1.7B Q8_0" */
  displayLabel?: string;
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