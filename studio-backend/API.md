# AI Studio Backend API Documentation

## Base URL
- **Development**: `http://localhost:8000`
- **Frontend**: `http://localhost:5173`

## Authentication

All API endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

Tokens are obtained through the Google OAuth flow and stored in localStorage.

---

## Authentication Endpoints

### Google OAuth Initiation
```http
GET /api/auth/oauth/google/
```

**Purpose**: Initiate Google OAuth flow  
**Response**: Redirects to Google OAuth consent screen

### OAuth Callback (Internal)
```http
GET /api/auth/oauth/google/callback/
```

**Purpose**: Handle Google OAuth callback  
**Parameters**: 
- `code`: OAuth authorization code
- `state`: CSRF protection state

**Response**: Redirects to frontend with token and user data

### Health Check
```http
GET /api/auth/health/
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-20T22:30:00Z"
}
```

---

## Chat Endpoints

### Chat Completions (Streaming)
```http
POST /v1/chat/completions
```

**Purpose**: Stream chat responses from Ollama models  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "model": "llama3.2",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response**: Server-Sent Events stream
```
data: {"id":"chat-123","object":"chat.completion.chunk","created":1642678400,"model":"llama3.2","choices":[{"delta":{"content":"Hello!"}}]}

data: {"id":"chat-123","object":"chat.completion.chunk","created":1642678401,"model":"llama3.2","choices":[{"delta":{"content":" How"}}]}

data: [DONE]
```

**Response Fields (camelCase)**:
- `id`: Unique completion ID
- `object`: Response type
- `created`: Unix timestamp
- `model`: Model name used
- `choices[].delta.content`: Incremental content
- `choices[].finishReason`: Completion reason
- `usage.promptTokens`: Input tokens
- `usage.completionTokens`: Generated tokens
- `usage.totalTokens`: Sum of tokens

### Available Models
```http
GET /v1/models
```

**Purpose**: List available AI models  

**Response**:
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

---

## Dashboard Endpoints

### Dashboard Analytics
```http
GET /api/dashboard/
```

**Purpose**: Retrieve dashboard analytics data  

**Parameters**:
- `range`: Time range (`24h`, `7d`, `1m`, `3m`, `custom`)
- `start`: ISO date string (required for `custom` range)
- `end`: ISO date string (required for `custom` range)

**Example**:
```http
GET /api/dashboard/?range=7d
GET /api/dashboard/?range=custom&start=2025-07-01T00:00:00Z&end=2025-07-15T23:59:59Z
```

**Response**:
```json
{
  "range": "7d",
  "generatedAt": "2025-07-20T22:30:00Z",
  "requests": [
    {
      "timestamp": "2025-07-14T00:00:00Z",
      "success": 1450,
      "error": 23
    }
  ],
  "errorsBreakdown": [
    {"label": "400", "value": 120},
    {"label": "401", "value": 45},
    {"label": "500", "value": 32}
  ],
  "topModels": [
    {"name": "llama3.2", "requests": 240000},
    {"name": "gpt-4o-mini", "requests": 180000}
  ],
  "costs": [
    {
      "timestamp": "2025-07-14T00:00:00Z",
      "cost": 245.67
    }
  ],
  "topCountries": [
    {"name": "United States (US)", "requests": 4389},
    {"name": "Indonesia (ID)", "requests": 2948}
  ],
  "latency": [
    {
      "timestamp": "2025-07-14T00:00:00Z",
      "latency": 2.45
    }
  ],
  "summary": {
    "totalRequests": 12450,
    "successfulRequests": 11967,
    "avgLatencyMs": 2450.5,
    "totalCost": 1234.56,
    "totalTokens": 2450000,
    "avgTokensPerRequest": 196.77,
    "avgCostPerRequest": 0.099
  },
  "users": {
    "activeUsers": 125,
    "totalSessions": 450,
    "avgSessionCost": 2.45,
    "avgSessionRequests": 12.5
  },
  "feedback": {
    "totalFeedback": 234,
    "avgRating": 4.2,
    "ratingDistribution": {
      "5": 120,
      "4": 80,
      "3": 25,
      "2": 7,
      "1": 2
    }
  },
  "threats": {
    "totalThreats": 45,
    "unresolvedThreats": 12,
    "criticalThreats": 2,
    "highThreats": 8,
    "topThreatTypes": [
      {"type": "rate_limit", "count": 20},
      {"type": "suspicious_content", "count": 15}
    ]
  }
}
```

### Dashboard Health
```http
GET /api/dashboard/health/
```

**Purpose**: Check dashboard system health  

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-20T22:30:00Z",
  "database": {
    "connected": true,
    "totalLogs": 125000,
    "recentLogs": 1450
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error type",
  "message": "Detailed error description",
  "timestamp": "2025-07-20T22:30:00Z"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid JWT token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

### Authentication Errors
```json
{
  "error": "Authentication failed",
  "message": "JWT token is invalid or expired"
}
```

### Validation Errors
```json
{
  "error": "Validation error",
  "message": "Invalid time range parameter"
}
```

---

## Rate Limiting

- **Chat Completions**: 60 requests per minute per user
- **Dashboard API**: 120 requests per minute per user
- **Models API**: 30 requests per minute per user

Rate limit headers included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642678500
```

---

## Request/Response Headers

### Standard Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>
User-Agent: AI-Studio-Frontend/1.0
```

### CORS Headers
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Automatic Request Logging

All API requests are automatically logged with:
- Request timing and latency
- User authentication status
- Geographic data (if available)
- Model usage and token consumption
- Cost calculations
- Error tracking

This data powers the dashboard analytics without requiring manual instrumentation.

---

## Development Tools

### Django Admin
- **URL**: `http://localhost:8000/admin/`
- **Purpose**: Manage users, view logs, resolve threats
- **Access**: Requires superuser account

### Management Commands
```bash
# Populate test data
python manage.py populate_dashboard_data --days=14 --users=3

# Clear dashboard data
python manage.py populate_dashboard_data --clear

# Create admin user
python manage.py createsuperuser
```

---

## Integration Examples

### Frontend React Query
```typescript
// Chat completion
const { data, error } = useMutation({
  mutationFn: (params) => http.post('/v1/chat/completions', params),
});

// Dashboard data
const { data, isLoading } = useQuery({
  queryKey: ['dashboard', '7d'],
  queryFn: () => http.get('/api/dashboard/?range=7d'),
  refetchInterval: 30000,
});
```

### cURL Examples
```bash
# Get dashboard data
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "http://localhost:8000/api/dashboard/?range=7d"

# Chat completion
curl -X POST \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama3.2","messages":[{"role":"user","content":"Hello"}]}' \
     "http://localhost:8000/v1/chat/completions"
```

---

## Security Notes

- All endpoints require HTTPS in production
- JWT tokens should be stored securely
- Rate limiting prevents abuse
- Request logging captures security events
- CORS configured for frontend domain only
- Input validation on all endpoints
- SQL injection protection via Django ORM 