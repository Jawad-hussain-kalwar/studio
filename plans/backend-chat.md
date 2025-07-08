# 🧩 Chat System Backend Plan

## Purpose
Provide a scalable, streaming AI chat backend using Django and the official Ollama Python client, exposing OpenAI-compatible endpoints for chat completions and model management.

---

## Endpoints
- `POST /v1/chat/completions`
  - Accepts: model, messages, temperature, topP, tools, stream (bool)
  - Returns: streaming or non-streaming OpenAI-compatible response
- `GET /v1/models`
  - Returns: list of available models with metadata

---

## Core Logic
- Uses the official Ollama Python client for chat completions and model listing.
- Streams responses as Server-Sent Events (SSE) in OpenAI-compatible format:
  ```
  data: {"choices":[{"delta":{"content":"Hello"}}]}
  data: {"choices":[{"delta":{"content":" there"}}]}
  data: [DONE]
  ```
- Returns usage and finish reason in camelCase.
- Stateless by default; chat session persistence is planned for future releases.
- Rate limiting and usage tracking are planned for future analytics and billing.

---

## Extensibility
- Future endpoints for chat session persistence:
  - `/api/chat/sessions/` (CRUD for chat sessions and messages)
- Usage analytics and rate limiting via Redis or database.

---

## Data Contracts

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

## Implementation Priorities
1. Chat completions proxy (stateless, streaming, OpenAI-compatible)
2. Model listing endpoint
3. Session persistence and history (future)
4. Usage tracking and analytics (future)

---

## Future Enhancements
- Persistent chat history and multi-session support
- Advanced tool calling and function execution
- Usage analytics and billing integration
- Team/workspace support

---

**This plan is the single source of truth for the backend chat system. All implementation and documentation should align with this architecture.** 