# 🔑 API Key Management Requirements

## Purpose
Generate simple API keys for users to access the AI Studio API programmatically.

## Frontend Reality Check
- **TopBar**: Has simple "Get API key" button - just a button, no modal or complex UI
- **No management interface**: No listing, editing, or permissions in frontend
- **No API key UI**: Button exists but no implementation for showing generated keys
- **Simple use case**: Generate key for API access, basic authentication

## CRITICAL FINDINGS:
1. **No API key modal or display** - frontend button has no implementation
2. **No key management UI** - no interface for listing or revoking keys
3. **Simple button only** - just basic "Get API key" button in TopBar

## API Endpoints
```
POST /api/keys/                       # Generate new API key
GET  /api/keys/                       # List user's API keys (basic)
DELETE /api/keys/{id}/                # Revoke API key
```

## Database Model
```python
import secrets
import hashlib

class ApiKey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default="Default Key")
    key_hash = models.CharField(max_length=64, unique=True)  # SHA-256 hash
    prefix = models.CharField(max_length=8)  # First 8 chars for identification
    last_used = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.name} ({self.prefix}...)"
    
    @classmethod
    def generate_key(cls, user, name="Default Key"):
        """Generate new API key"""
        # Generate random key: sk-<random_string>
        key = f"sk-{secrets.token_urlsafe(32)}"
        
        # Hash for storage
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        prefix = key[:8]
        
        api_key = cls.objects.create(
            user=user,
            name=name,
            key_hash=key_hash,
            prefix=prefix
        )
        
        # Return the plain key only once
        return api_key, key
    
    @classmethod
    def authenticate(cls, key):
        """Authenticate API key and return user"""
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        try:
            api_key = cls.objects.get(key_hash=key_hash, is_active=True)
            api_key.last_used = timezone.now()
            api_key.save(update_fields=['last_used'])
            return api_key.user
        except cls.DoesNotExist:
            return None
```

## API Key Generation (camelCase Response)
```python
# POST /api/keys/
{
    "name": "My API Key"  # Optional
}

# Response (key shown only once!) - camelCase for frontend
{
    "id": "uuid-123",
    "name": "My API Key", 
    "key": "sk-AbCdEf123456789...",  # Full key - save this!
    "prefix": "sk-AbCdE",
    "createdAt": "2025-01-27T10:00:00Z",  # camelCase!
    "warning": "This key will only be shown once. Save it securely."
}
```

## API Key Listing (camelCase Response)
```python
# GET /api/keys/
{
    "keys": [
        {
            "id": "uuid-123",
            "name": "My API Key",
            "prefix": "sk-AbCdE",  # Only show prefix for security
            "lastUsed": "2025-01-27T09:30:00Z",  # camelCase!
            "isActive": true,                    # camelCase!
            "createdAt": "2025-01-27T10:00:00Z"  # camelCase!
        }
    ]
}
```

## Authentication Middleware
```python
class ApiKeyAuthentication:
    """Custom authentication for API key access"""
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
            
        key = auth_header[7:]  # Remove 'Bearer '
        user = ApiKey.authenticate(key)
        
        if user:
            return user, None
        return None
```

## Usage Example
```bash
# Using the API key
curl -H "Authorization: Bearer sk-AbCdEf123456789..." \
     -H "Content-Type: application/json" \
     -X POST http://localhost:8000/v1/chat/completions \
     -d '{"model": "gemini-1.5-flash", "messages": [{"role": "user", "content": "Hello"}]}'
```

## Rate Limiting
```python
# Simple rate limiting per API key
API_KEY_RATE_LIMITS = {
    'requests_per_minute': 100,
    'requests_per_hour': 1000,
}
```

## Security Features
```python
# Key validation
def validate_api_key(key):
    """Validate API key format"""
    if not key.startswith('sk-'):
        return False
    if len(key) < 20:
        return False
    return True

# Automatic cleanup
def cleanup_unused_keys():
    """Deactivate keys not used in 90 days"""
    cutoff = timezone.now() - timedelta(days=90)
    ApiKey.objects.filter(
        last_used__lt=cutoff,
        is_active=True
    ).update(is_active=False)
```

## Frontend Integration (NEEDS IMPLEMENTATION)
```typescript
// Expected response from "Get API key" button click
interface ApiKeyResponse {
  id: string;
  name: string;
  key: string;  // Only returned once!
  prefix: string;
  createdAt: string;  // camelCase!
  warning: string;
}

// Frontend needs to implement:
// 1. Modal to show generated API key
// 2. Copy to clipboard functionality
// 3. Warning about saving the key securely
```

## Environment Variables
```env
# API key settings
API_KEY_EXPIRY_DAYS=90  # Auto-deactivate after 90 days of no use
MAX_KEYS_PER_USER=5     # Limit number of keys per user
```

## Implementation Priority
1. **Backend API only initially** - frontend has no UI for this yet
2. **Basic generation endpoint** - for when frontend adds modal
3. **Key listing** - when frontend adds key management UI
4. **Authentication middleware** - for API access

## Implementation Notes
- API keys start with `sk-` prefix (OpenAI style)
- Store only hashed versions, never plaintext
- Show full key only once during generation
- Support both JWT and API key authentication
- Simple rate limiting to prevent abuse
- No complex permissions initially (all keys have same access)
- **Frontend needs modal implementation** to show generated keys
- **Button exists but no functionality** - needs UI development 