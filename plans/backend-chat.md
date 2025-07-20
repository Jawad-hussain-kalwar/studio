# Chat System Implementation

## Current Status

Django chat_models app implements OpenAI-compatible chat completions API with Ollama backend integration. Supports streaming responses via Server-Sent Events.

## Implemented Features

### 1. Chat Completions
- Proxies requests to local Ollama instance
- Streaming and non-streaming responses
- OpenAI-compatible format
- Request validation and error handling
- camelCase response formatting

### 2. Model Management
- Dynamic model listing from Ollama
- Model metadata with capabilities
- Context length information

### 3. Health Check
- Ollama connectivity verification

## API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `POST` | `/v1/chat/completions` | Chat completions | AllowAny |
| `GET` | `/v1/models` | List available models | AllowAny |
| `GET` | `/v1/health` | Health check | AllowAny |

## Request Format

### Chat Completion Request
```json
{
  "model": "llama3.2",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1000
}
```

## Response Format

### Streaming Response (SSE)
```
data: {"id":"chat-123","object":"chat.completion.chunk","created":1642678400,"model":"llama3.2","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chat-123","object":"chat.completion.chunk","created":1642678401,"model":"llama3.2","choices":[{"delta":{"content":" there"}}]}

data: [DONE]
```

### Non-Streaming Response
```json
{
  "id": "chat-123",
  "object": "chat.completion",
  "created": 1642678400,
  "model": "llama3.2",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you?"
    },
    "finishReason": "stop",
    "index": 0
  }],
  "usage": {
    "promptTokens": 10,
    "completionTokens": 15,
    "totalTokens": 25
  }
}
```

### Models Response
```json
{
  "object": "list",
  "data": [
    {
      "id": "llama3.2",
      "object": "model",
      "displayLabel": "llama GGUF 3.2B Q4_0",
      "contextLength": 131072,
      "capabilities": ["tools", "vision"],
      "metadata": {
        "family": "llama",
        "format": "GGUF",
        "parameterSize": "3.2B",
        "quantizationLevel": "Q4_0"
      }
    }
  ]
}
```

## Implementation Details

### OllamaClient Class
- Wraps official ollama Python library
- Handles model listing and metadata extraction
- Formats responses for OpenAI compatibility
- Error handling for connection issues

### ChatRequestValidator
- Validates request structure
- Sanitizes input content
- Enforces parameter limits
- Security checks

### Streaming Implementation
- Uses Django StreamingHttpResponse
- Server-Sent Events format
- Chunk processing with proper formatting
- Error handling during streaming

## Configuration

### Environment Variables
```bash
OLLAMA_BASE_URL=http://localhost:11434
```

### Dependencies
```python
ollama==0.3.3
httpx==0.27.0
```

## Security Features

1. **Input Validation**: All requests validated
2. **Content Sanitization**: Basic security checks
3. **Error Handling**: Graceful failure modes
4. **CORS**: Configured for frontend

## Not Implemented

1. **Authentication**: Currently AllowAny permission
2. **Chat History**: No session persistence
3. **Rate Limiting**: No implementation
4. **Usage Tracking**: No token counting storage
5. **Tool Calling**: Not implemented
6. **Vision Support**: Model capability flagged but not used

## Frontend Integration

Frontend uses React Query hooks:
- `useChatApi` for chat completions
- Streaming handled via fetch API
- Model list cached in localStorage
- Token counting on frontend only 