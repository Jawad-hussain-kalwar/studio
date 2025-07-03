# 🎨 Image Generation Requirements

## Purpose
Handle image generation requests and storage for the frontend image playground.

## Frontend Reality Check
- **GenerateImagePage**: Basic image generation with canvas display
- **ImageRunSettingsPanel**: Diffusion parameters (model, prompt, negative prompt, steps, CFG, etc.)
- **ImageCanvas**: Shows generated image with PLACEHOLDER initially - no persistence!
- **NO HISTORY UI**: No galleries, no image management UI exists
- **NO API CALLS**: Frontend doesn't make any image generation API calls yet
- **Local state only**: All image settings stored in component state

## CRITICAL FINDINGS:
1. **No image generation API calls** - frontend is UI only
2. **No image history** - no UI for viewing past images
3. **Simple canvas display** - just shows placeholder image
4. **No persistence expected** - frontend has no image loading/saving

## API Endpoints (FUTURE IMPLEMENTATION)
```
POST /v1/images/generations           # Generate image (NOT USED YET)
GET  /api/images/history/             # User's generated images (NO UI EXISTS)
GET  /api/images/{id}/                # Get specific image (NO UI EXISTS)
DELETE /api/images/{id}/              # Delete image (NO UI EXISTS)
```

## Database Model (Future - Not Needed Initially)
```python
class GeneratedImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prompt = models.TextField()
    negative_prompt = models.TextField(blank=True)
    model_used = models.CharField(max_length=100)  # e.g., 'sdxl'
    
    # Generation parameters (stored as JSON)
    parameters = models.JSONField(default=dict)  # steps, cfg_scale, sampler, etc.
    
    # File storage
    image_file = models.ImageField(upload_to='generated_images/%Y/%m/')
    thumbnail = models.ImageField(upload_to='thumbnails/%Y/%m/', blank=True)
    
    # Metadata
    width = models.IntegerField()
    height = models.IntegerField() 
    file_size = models.IntegerField()  # bytes
    generation_time = models.FloatField()  # seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
```

## Image Generation Request (MATCH FRONTEND SETTINGS)
```python
# Expected frontend request format (based on ImageRunSettingsPanel state)
{
    "prompt": "A beautiful sunset over mountains",
    "negative_prompt": "blurry, low quality",  # negativePrompt in frontend
    "model": "sdxl",
    "width": 1024,   # calculated from aspectRatio
    "height": 1024,  # calculated from aspectRatio
    "steps": 30,     # steps slider
    "cfg_scale": 7.5,  # cfgScale slider (Guidance scale)
    "sampler": "Euler",
    "seed": -1,      # -1 for random
    "num_images": 1  # always 1 for now
}

# Response format (camelCase for frontend)
{
    "id": "img-uuid-123",
    "prompt": "A beautiful sunset over mountains",
    "imageUrl": "/media/generated_images/2025/01/img-uuid-123.png",  # camelCase!
    "thumbnailUrl": "/media/thumbnails/2025/01/img-uuid-123.png",   # camelCase!
    "width": 1024,
    "height": 1024,
    "parameters": {
        "steps": 30,
        "cfgScale": 7.5,    # camelCase!
        "sampler": "Euler",
        "seed": 12345
    },
    "generationTime": 8.5,     # camelCase!
    "createdAt": "2025-01-27T10:00:00Z"  # camelCase!
}
```

## Frontend Image Settings (FROM ImageRunSettingsPanel.tsx)
```typescript
// Current frontend state (all local, no API calls)
const [model, setModel] = useState<string>('sdxl');
const [negativePrompt, setNegativePrompt] = useState<string>('');
const [aspectRatio, setAspectRatio] = useState<string>('1:1');
const [steps, setSteps] = useState<number>(30);
const [cfgScale, setCfgScale] = useState<number>(7.5);
const [sampler, setSampler] = useState<string>('Euler');
const [seed, setSeed] = useState<number>(-1);
const [hiresFix, setHiresFix] = useState<boolean>(false);
```

## Image History Response (NO UI FOR THIS YET)
```python
# GET /api/images/history/ (when history UI gets implemented)
{
    "images": [
        {
            "id": "img-uuid-123",
            "prompt": "A beautiful sunset over mountains",
            "imageUrl": "/media/generated_images/2025/01/img-uuid-123.png",     # camelCase!
            "thumbnailUrl": "/media/thumbnails/2025/01/img-uuid-123.png",      # camelCase!
            "modelUsed": "sdxl",                                               # camelCase!
            "createdAt": "2025-01-27T10:00:00Z"                               # camelCase!
        }
    ],
    "total": 25,
    "page": 1,
    "perPage": 20  # camelCase!
}
```

## File Storage Configuration
```python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Image processing
THUMBNAIL_SIZE = (256, 256)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_FORMATS = ['PNG', 'JPEG', 'WEBP']
```

## Image Processing
```python
from PIL import Image

def create_thumbnail(image_path, thumbnail_path):
    """Create thumbnail for generated image"""
    with Image.open(image_path) as img:
        img.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
        img.save(thumbnail_path, optimize=True, quality=85)

def process_generated_image(image_data, prompt, parameters):
    """Save and process generated image"""
    # Save original image
    image_path = save_image_file(image_data)
    
    # Create thumbnail
    thumbnail_path = create_thumbnail_path(image_path)
    create_thumbnail(image_path, thumbnail_path)
    
    # Save to database
    generated_image = GeneratedImage.objects.create(
        user=request.user,
        prompt=prompt,
        image_file=image_path,
        thumbnail=thumbnail_path,
        parameters=parameters,
        **extract_image_metadata(image_path)
    )
    
    return generated_image
```

## Inference Service Proxy
```python
async def generate_image(request_data):
    """Proxy image generation to inference service"""
    
    # Forward request to inference service
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{INFERENCE_SERVICE_URL}/inference/images/generations",
            json=request_data,
            timeout=120  # Image generation can take time
        )
    
    if response.status_code == 200:
        image_data = response.content
        return process_generated_image(image_data, request_data['prompt'], request_data)
    else:
        raise Exception(f"Image generation failed: {response.text}")
```

## Rate Limiting
```python
# Simple rate limiting for image generation
IMAGE_RATE_LIMITS = {
    'requests_per_hour': 50,  # Reasonable limit for image generation
    'concurrent_requests': 2,  # Prevent server overload
}
```

## Storage Cleanup (Future)
```python
# Periodic cleanup of old images
def cleanup_old_images():
    """Delete images older than 30 days to save storage"""
    cutoff_date = timezone.now() - timedelta(days=30)
    old_images = GeneratedImage.objects.filter(created_at__lt=cutoff_date)
    
    for image in old_images:
        # Delete files from storage
        if image.image_file:
            image.image_file.delete()
        if image.thumbnail:
            image.thumbnail.delete()
        # Delete database record
        image.delete()
```

## Environment Variables
```env
# Image storage
MEDIA_ROOT=/path/to/media/storage
MAX_IMAGE_FILE_SIZE=10485760  # 10MB

# Inference service
INFERENCE_SERVICE_URL=http://localhost:8001
INFERENCE_SERVICE_API_KEY=your-inference-api-key
```

## Implementation Priority
1. **Skip initially** - frontend has no image generation API calls
2. **Basic generation endpoint** - when frontend adds image generation button
3. **File storage** - when persistence is needed
4. **History API** - when frontend adds image gallery UI

## Implementation Notes
- **No immediate implementation needed** - frontend is UI-only currently
- **Image canvas is placeholder** - no actual image generation yet
- **Match frontend camelCase format** when API gets implemented
- **Simple storage solution** - local file storage initially
- **Frontend needs work** - add image generation API calls and result display
- **History UI missing** - no interface for viewing past generations
- Start with basic generation, add persistence later when needed 