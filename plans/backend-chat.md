# 💬 Chat System Requirements

## Purpose
Handle chat persistence and proxy chat completions to inference service.

## Frontend Reality Check
- **ChatPlaygroundPage**: Full chat UI with streaming support
- **studioStore**: Manages chat state (messages, model, temperature, tools) - LOCAL ONLY
- **Chat history**: Frontend has History navigation but shows "Coming Soon" page!
- **Token counting**: Shows prompt/completion/total tokens using simple estimation
- **No billing integration**: Just displays counts, no payment system
- **No session persistence**: Messages only exist in studioStore (local state)

## CRITICAL FINDINGS:
1. **History feature is NOT implemented** - navigation exists but shows placeholder
2. **No session management** - frontend only has local message state
3. **Response format mismatch** - frontend expects camelCase, plan shows snake_case

## API Endpoints
```
# Chat completions (proxy to inference)
POST /v1/chat/completions              # Streaming & non-streaming chat

# Chat persistence (FUTURE - not currently used by frontend)
GET  /api/chat/sessions/               # List user's chat sessions
POST /api/chat/sessions/               # Create new session
GET  /api/chat/sessions/{id}/          # Get session with messages
PUT  /api/chat/sessions/{id}/          # Update session (title)
DELETE /api/chat/sessions/{id}/        # Delete session
```

## Database Models (Future Implementation)
```python
class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)  # Auto-generated from first message
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=[
        ('user', 'User'),
        ('assistant', 'Assistant'), 
        ('system', 'System'),
    ])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
```

## Chat Completion Proxy (CRITICAL: Match Frontend Format)
```python
# Expected frontend request format (from useChatApi.ts)
{
    "model": "gemini-2.5-flash-preview-04-17",
    "messages": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ],
    "temperature": 1.0,
    "topP": 0.95,
    "tools": ["url-context", "image-generation"],
    "stream": true
}

# Response format (MUST match frontend ChatCompletionResponse type)
{
    "id": "chatcmpl-123",
    "choices": [{
        "message": {
            "role": "assistant", 
            "content": "Hello! How can I help you today?"
        },
        "finishReason": "stop"  # camelCase!
    }],
    "usage": {
        "promptTokens": 10,     # camelCase!
        "completionTokens": 15, # camelCase!
        "totalTokens": 25       # camelCase!
    }
}
```

## Streaming Support (CRITICAL: Match Frontend Parsing)
```python
# Server-Sent Events format expected by frontend useChatApi.ts
data: {"choices":[{"delta":{"content":"Hello"}}]}

data: {"choices":[{"delta":{"content":" there"}}]}

data: [DONE]
```

## Chat Session Management (NOT IMPLEMENTED YET)
```python
# List sessions response (for when History page gets implemented)
{
    "sessions": [
        {
            "id": "uuid-123",
            "title": "How to use Python decorators?", 
            "createdAt": "2025-01-27T10:00:00Z",  # camelCase!
            "updatedAt": "2025-01-27T10:05:00Z",  # camelCase!
            "messageCount": 6                     # camelCase!
        }
    ]
}

# Session detail response  
{
    "id": "uuid-123",
    "title": "How to use Python decorators?",
    "createdAt": "2025-01-27T10:00:00Z",   # camelCase!
    "updatedAt": "2025-01-27T10:05:00Z",   # camelCase!
    "messages": [
        {
            "id": "msg-uuid-1",
            "role": "user",
            "content": "How do I use Python decorators?",
            "createdAt": "2025-01-27T10:00:00Z"  # camelCase!
        },
        {
            "id": "msg-uuid-2", 
            "role": "assistant",
            "content": "Python decorators are...",
            "createdAt": "2025-01-27T10:00:05Z"  # camelCase!
        }
    ]
}
```

## Title Generation
```python
def generate_session_title(first_user_message):
    """Auto-generate title from first user message (max 5 words)"""
    words = first_user_message.split()[:5]
    title = ' '.join(words)
    if len(first_user_message.split()) > 5:
        title += '...'
    return title
```

## Token Counting (Match Frontend Simple Display)
```python
# Simple token estimation for display (matches frontend)
def estimate_tokens(text):
    """Rough token estimation: ~4 characters per token"""
    return len(text) // 4

# Track in database for basic analytics (no billing)
class UsageRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, null=True)
    prompt_tokens = models.IntegerField()
    completion_tokens = models.IntegerField()
    total_tokens = models.IntegerField()
    model_used = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
```

## Inference Service Integration
```python
# Proxy settings
INFERENCE_SERVICE_URL = env('INFERENCE_SERVICE_URL', 'http://localhost:8001')
INFERENCE_SERVICE_TIMEOUT = 30  # seconds

# Expected inference service endpoints
POST /inference/chat/completions      # Chat completion
GET  /inference/models               # Available models
```

## Rate Limiting
```python
# Simple rate limiting per user
CHAT_RATE_LIMITS = {
    'requests_per_minute': 20,
    'concurrent_requests': 3,
}
```

## Environment Variables
```env
# Inference service
INFERENCE_SERVICE_URL=http://localhost:8001
INFERENCE_SERVICE_API_KEY=your-inference-api-key

# Optional: Redis for rate limiting
REDIS_URL=redis://localhost:6379/0
```

## Implementation Priority
1. **Chat completions proxy** (core functionality - works with local studioStore)
2. **Models endpoint** (required for model dropdown)
3. **Session persistence** (when History page gets implemented)
4. **Usage tracking** (basic token counting for dashboard)

## Implementation Notes
- **Start with stateless chat proxy** - frontend uses local state only
- Use standard HTTP streaming with Server-Sent Events (no WebSockets needed)
- **Don't implement session persistence initially** - History page is placeholder
- **Match frontend camelCase response format** exactly
- Frontend handles optimistic UI updates during streaming
- Auto-save sessions only when History feature gets implemented 