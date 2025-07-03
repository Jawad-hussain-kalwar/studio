# 🤖 Model Management Requirements

## Purpose
Provide model information to frontend and proxy model requests to inference service.

## Frontend Reality Check
- **RunSettingsPanel**: Shows model dropdown with name/description
- **HARDCODED MODELS**: Frontend has static `availableModels` array, doesn't call API!
- **Model switching**: Changes model for chat/image generation via studioStore
- **No complex features**: No model training, fine-tuning, or management
- **ModelInfo interface**: Expects `id`, `name`, `description`, `contextLength` (camelCase)

## CRITICAL FINDINGS:
1. **Frontend uses hardcoded models** - doesn't call `/v1/models` endpoint yet
2. **Response format mismatch** - frontend expects camelCase `contextLength`
3. **Models are static** - no dynamic loading from inference service

## API Endpoints
```
GET /v1/models                        # List available models (NOT USED YET)
GET /v1/models/{model_id}             # Get model details (optional)
```

## Model Information Response (MUST MATCH FRONTEND)
```python
# Expected frontend format (matches TypeScript ModelInfo interface)
[
    {
        "id": "gemini-2.5-flash-preview-04-17",
        "name": "Gemini 2.5 Flash Preview 04-17", 
        "description": "Latest preview model with enhanced capabilities",
        "contextLength": 1048576  # camelCase! Frontend expects this exactly
    },
    {
        "id": "gemini-1.5-pro",
        "name": "Gemini 1.5 Pro",
        "description": "Advanced reasoning and long context",
        "contextLength": 2097152  # camelCase!
    },
    {
        "id": "gemini-1.5-flash",
        "name": "Gemini 1.5 Flash", 
        "description": "Fast and efficient for most tasks",
        "contextLength": 1048576  # camelCase!
    }
]
```

## Current Frontend Hardcoded Models (FROM RunSettingsPanel.tsx)
```typescript
const availableModels = [
  {
    id: 'gemini-2.5-flash-preview-04-17',
    name: 'Gemini 2.5 Flash Preview 04-17',
    description: 'Latest preview model with enhanced capabilities',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Advanced reasoning and long context',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient for most tasks',
  },
];
```

## Database Model (Optional - Start with Static)
```python
class Model(models.Model):
    """Store model metadata for frontend display"""
    id = models.CharField(max_length=100, primary_key=True)  # e.g., 'gemini-1.5-pro'
    name = models.CharField(max_length=255)  # Display name
    description = models.TextField()  # User-friendly description
    context_length = models.IntegerField()  # Max context tokens
    model_type = models.CharField(max_length=50, choices=[
        ('chat', 'Chat Completion'),
        ('image', 'Image Generation'),
        ('speech', 'Speech Generation'),
    ])
    is_active = models.BooleanField(default=True)
    provider = models.CharField(max_length=100)  # e.g., 'google', 'openai'
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
```

## Image Generation Models (MATCH FRONTEND)
```python
# For ImageRunSettingsPanel (current frontend hardcoded models)
[
    {
        "id": "sdxl",
        "name": "Stable Diffusion XL",
        "description": "High-quality image generation",
        "provider": "StabilityAI"
    },
    {
        "id": "sdxl-lightning", 
        "name": "SDXL-Lightning",
        "description": "Fast SDXL variant",
        "provider": "StabilityAI"
    },
    {
        "id": "flux-schnell",
        "name": "Flux Schnell", 
        "description": "Fast image generation",
        "provider": "Flux"
    },
    {
        "id": "flux-pro",
        "name": "Flux Pro",
        "description": "High-quality image generation", 
        "provider": "Flux"
    }
]
```

## Static Model Configuration (INITIAL IMPLEMENTATION)
```python
# Option 1: Static configuration (matches frontend exactly)
AVAILABLE_MODELS = {
    'chat': [
        {
            'id': 'gemini-2.5-flash-preview-04-17',
            'name': 'Gemini 2.5 Flash Preview 04-17',
            'description': 'Latest preview model with enhanced capabilities',
            'contextLength': 1048576,  # camelCase for frontend
        },
        {
            'id': 'gemini-1.5-pro',
            'name': 'Gemini 1.5 Pro',
            'description': 'Advanced reasoning and long context',
            'contextLength': 2097152,
        },
        {
            'id': 'gemini-1.5-flash',
            'name': 'Gemini 1.5 Flash',
            'description': 'Fast and efficient for most tasks',
            'contextLength': 1048576,
        },
    ],
    'image': [
        {
            'id': 'sdxl',
            'name': 'Stable Diffusion XL', 
            'description': 'High-quality image generation',
            'provider': 'StabilityAI',
        },
        {
            'id': 'sdxl-lightning',
            'name': 'SDXL-Lightning',
            'description': 'Fast SDXL variant', 
            'provider': 'StabilityAI',
        },
        {
            'id': 'flux-schnell',
            'name': 'Flux Schnell',
            'description': 'Fast image generation',
            'provider': 'Flux',
        },
        {
            'id': 'flux-pro',
            'name': 'Flux Pro',
            'description': 'High-quality image generation',
            'provider': 'Flux',
        },
    ]
}

# Option 2: Fetch from inference service (future)
def get_models_from_inference():
    """Fetch available models from inference service"""
    response = requests.get(f"{INFERENCE_SERVICE_URL}/models")
    models = response.json()
    # Convert to frontend format with camelCase
    return [{
        'id': model['id'],
        'name': model['name'],
        'description': model['description'],
        'contextLength': model.get('context_length', 1048576)
    } for model in models]
```

## Model Categories
```python
# Frontend expects different models for different tasks
GET /v1/models?type=chat              # Chat completion models
GET /v1/models?type=image             # Image generation models  
GET /v1/models?type=speech            # Speech generation models
```

## Caching Strategy
```python
# Cache model list for performance
@cache_for(minutes=30)
def get_available_models():
    """Cache model list to avoid repeated inference service calls"""
    return fetch_models_from_inference_service()
```

## Configuration
```env
# Model service settings
INFERENCE_SERVICE_URL=http://localhost:8001
MODEL_CACHE_TIMEOUT=1800  # 30 minutes
DEFAULT_CHAT_MODEL=gemini-1.5-flash
DEFAULT_IMAGE_MODEL=sdxl
```

## Implementation Priority
1. **Start with static configuration** - matches current frontend exactly
2. **Add /v1/models endpoint** - for when frontend removes hardcoded models
3. **Database storage** - later for admin management
4. **Dynamic loading** - when inference service integration needed

## Implementation Notes
- **Start with static model configuration** - frontend is hardcoded anyway
- **Match frontend camelCase format** for `contextLength`
- Frontend expects immediate response (< 200ms)
- Models are selected per-request, not per-user
- No model training or fine-tuning features needed
- **Frontend needs updating** to call `/v1/models` instead of hardcoded array
- Inference service handles actual model loading/management 