# 📊 Dashboard Requirements

## Purpose
Provide basic user dashboard data for the frontend dashboard page.

## Frontend Reality Check
- **DashboardPage**: Shows only "Welcome to your dashboard! This area will soon show metrics and quick links. Stay tuned."
- **NO FUNCTIONALITY**: Complete placeholder - no metrics, no charts, no data display
- **NO API CALLS**: Frontend doesn't fetch any dashboard data
- **Coming soon**: Dashboard is completely unimplemented

## CRITICAL FINDINGS:
1. **Dashboard is just placeholder text** - no actual functionality
2. **No API calls** - frontend doesn't request any dashboard data
3. **No data display** - no charts, stats, or user information shown
4. **Backend endpoints not needed initially** - nothing to serve

## Current Dashboard State
The frontend dashboard is essentially empty - just a placeholder message that says features are coming soon. No backend implementation needed until frontend gets actual dashboard features.

## Future API Endpoints (NOT NEEDED YET)
```
GET /api/dashboard/overview/          # Basic user statistics (NO UI)
GET /api/dashboard/recent-activity/   # Recent chats/images (NO UI)
```

## Minimal Data Structure (FUTURE ONLY)
```python
# GET /api/dashboard/overview/ (when dashboard gets implemented)
{
    "user": {
        "name": "John Doe",
        "email": "john@example.com", 
        "joined": "2025-01-15T10:00:00Z"
    },
    "stats": {
        "totalChats": 25,               # camelCase!
        "totalImages": 12,              # camelCase!
        "totalTokensUsed": 15420,       # camelCase!
        "accountCreated": "2 weeks ago" # camelCase!
    }
}

# GET /api/dashboard/recent-activity/ (when dashboard gets implemented)
{
    "recentChats": [                    # camelCase!
        {
            "id": "chat-uuid-1",
            "title": "Python decorators help",
            "createdAt": "2025-01-27T09:30:00Z"  # camelCase!
        }
    ],
    "recentImages": [                   # camelCase!
        {
            "id": "img-uuid-1", 
            "prompt": "Beautiful sunset",
            "thumbnailUrl": "/media/thumbnails/img.png",  # camelCase!
            "createdAt": "2025-01-27T08:15:00Z"          # camelCase!
        }
    ]
}
```

## Simple Statistics Model (FUTURE IMPLEMENTATION)
```python
class UserStats(models.Model):
    """Basic user statistics for dashboard"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_chats = models.IntegerField(default=0)
    total_images = models.IntegerField(default=0) 
    total_tokens_used = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    
    def update_chat_count(self):
        self.total_chats = ChatSession.objects.filter(user=self.user).count()
        self.save(update_fields=['total_chats'])
    
    def update_image_count(self):
        self.total_images = GeneratedImage.objects.filter(user=self.user).count()
        self.save(update_fields=['total_images'])
    
    def add_tokens(self, token_count):
        self.total_tokens_used += token_count
        self.save(update_fields=['total_tokens_used'])
```

## Dashboard View (FUTURE - NOT NEEDED NOW)
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def dashboard_overview(request):
    """Basic dashboard overview"""
    user = request.user
    
    # Get or create user stats
    stats, created = UserStats.objects.get_or_create(
        user=user,
        defaults={
            'total_chats': ChatSession.objects.filter(user=user).count(),
            'total_images': GeneratedImage.objects.filter(user=user).count(),
        }
    )
    
    return Response({
        'user': {
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'joined': user.date_joined.isoformat(),
        },
        'stats': {
            'totalChats': stats.total_chats,          # camelCase!
            'totalImages': stats.total_images,        # camelCase!
            'totalTokensUsed': stats.total_tokens_used, # camelCase!
            'accountCreated': format_time_ago(user.date_joined), # camelCase!
        }
    })

@api_view(['GET'])
def recent_activity(request):
    """Recent user activity"""
    user = request.user
    
    # Get 5 most recent chats and images
    recent_chats = ChatSession.objects.filter(user=user)[:5]
    recent_images = GeneratedImage.objects.filter(user=user)[:5]
    
    return Response({
        'recentChats': [              # camelCase!
            {
                'id': str(chat.id),
                'title': chat.title,
                'createdAt': chat.created_at.isoformat(),  # camelCase!
            } for chat in recent_chats
        ],
        'recentImages': [             # camelCase!
            {
                'id': str(img.id),
                'prompt': img.prompt[:50] + '...' if len(img.prompt) > 50 else img.prompt,
                'thumbnailUrl': img.thumbnail.url if img.thumbnail else None,  # camelCase!
                'createdAt': img.created_at.isoformat(),                       # camelCase!
            } for img in recent_images
        ]
    })
```

## Utility Functions (FUTURE)
```python
from datetime import timezone, timedelta

def format_time_ago(dt):
    """Format datetime as 'X days ago' for dashboard"""
    now = timezone.now()
    diff = now - dt
    
    if diff.days > 0:
        return f"{diff.days} days ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hours ago"
    else:
        minutes = diff.seconds // 60
        return f"{minutes} minutes ago"
```

## Performance Considerations (FUTURE)
```python
# Cache dashboard data for 5 minutes
from django.core.cache import cache

def get_cached_dashboard_data(user):
    cache_key = f"dashboard_overview_{user.id}"
    data = cache.get(cache_key)
    
    if data is None:
        data = generate_dashboard_data(user)
        cache.set(cache_key, data, 300)  # Cache for 5 minutes
    
    return data
```

## Future Expansion Areas
When the frontend dashboard gets actual features, we can add:

- **Usage charts**: Token usage over time
- **Model usage breakdown**: Which models used most
- **Activity timeline**: Detailed activity feed
- **Quick actions**: Links to start new chat/image generation

## Implementation Priority
1. **Skip entirely** - dashboard is placeholder only
2. **User stats tracking** - when dashboard features get built
3. **Basic overview endpoint** - when frontend requests data
4. **Activity feeds** - when frontend shows recent activity

## Implementation Notes
- **No implementation needed initially** - frontend is pure placeholder
- **Dashboard is "Coming Soon"** - no actual functionality exists
- Focus on other features first since dashboard provides no value yet
- Design for future expansion without over-engineering now
- **Match frontend camelCase format** when API gets implemented
- Statistics update asynchronously to avoid blocking user actions 