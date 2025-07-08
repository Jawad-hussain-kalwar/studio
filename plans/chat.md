# 🧩 Chat System Plan (Single Source of Truth)

## 1. Purpose
Provide a modern, streaming AI chat experience using foundation models, with a scalable backend and a responsive, accessible frontend.

---

## 2. Backend (Django + Ollama)

### Endpoints
- `POST /v1/chat/completions`  
  - Accepts: model, messages, temperature, topP, tools, stream (bool)
  - Returns: streaming or non-streaming OpenAI-compatible response
- `GET /v1/models`  
  - Returns: list of available models with metadata

### Core Logic
- Uses the official Ollama Python client to handle chat completions and model listing.
- Streams responses as Server-Sent Events (SSE) in OpenAI-compatible format:
  ```
  data: {"choices":[{"delta":{"content":"Hello"}}]}
  data: {"choices":[{"delta":{"content":" there"}}]}
  data: [DONE]
  ```
- Returns usage and finish reason in camelCase.
- Stateless by default; chat session persistence is planned for future releases.
- Rate limiting and usage tracking are planned for future analytics and billing.

### Extensibility
- Future endpoints for chat session persistence:
  - `/api/chat/sessions/` (CRUD for chat sessions and messages)
- Usage analytics and rate limiting via Redis or database.

---

## 3. Frontend (React 19 + Vercel AI SDK)

### Core Components
- `ChatPlaygroundPage`: Main chat UI
- `useChat` (from `@ai-sdk/react`): Handles message state, streaming, abort, and UI updates
- `RunSettingsPanel`: Model selector, temperature, tool toggles
- `TokenCountMeter`: Displays prompt/completion/total tokens

### State Management
- Local state: Zustand for UI state (messages, model, temperature, etc.)
- Server state: React Query for models and chat completions

### API Integration
- Uses `/v1/chat/completions` for chat (streaming and non-streaming)
- Uses `/v1/models` for model listing

### Streaming
- Uses `useChat` to handle streaming responses from the backend.
- UI updates incrementally as tokens arrive.
- Supports abort/stop generation via AbortController.

### UI/UX
- Responsive, accessible design with theming (teal and lime-yellow)
- Keyboard shortcuts and ARIA support
- Error boundaries and toast notifications for error handling

### Extensibility
- Planned: persistent chat history, multi-session support, advanced tools (function calling, image generation)
- Easy integration of new models via `/v1/models`

---

## 4. Data Contracts

### Chat Completion Request
```json
{
  "model": "llama3",
  "messages": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
  ],
  "temperature": 1.0,
  "topP": 0.95,
  "tools": [],
  "stream": true
}
```

### Streaming Response
```json
// Each chunk:
data: {"choices":[{"delta":{"content":"Hello"}}]}
// ...
data: [DONE]
```

### Final Response (non-streaming or last chunk)
```json
{
  "id": "chatcmpl-123",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finishReason": "stop"
  }],
  "usage": {
    "promptTokens": 10,
    "completionTokens": 15,
    "totalTokens": 25
  }
}
```

---

## 5. Implementation Priorities

1. Chat completions proxy (stateless, streaming, OpenAI-compatible)
2. Model listing endpoint
3. Frontend streaming chat UI with Vercel AI SDK
4. Session persistence and history (future)
5. Usage tracking and analytics (future)

---

## 6. Future Enhancements

- Persistent chat history and multi-session support
- Advanced tool calling and function execution
- Image, audio, and multimodal generation
- Usage analytics and billing integration
- Team/workspace support

---

**This plan is the single source of truth for the chat system. All implementation and documentation should align with this architecture.** 