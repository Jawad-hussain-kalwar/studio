# AI Studio

A full-stack AI experimentation platform with React frontend and Django backend. Features a fully functional chat playground with streaming responses, comprehensive analytics dashboard, and Google OAuth authentication.

## Tech Stack

### Frontend
| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.1.0 | UI framework with modern hooks |
| **TypeScript** | 5.8.3 | Type safety with strict configuration |
| **Vite** | 7.0.0 | Fast build tool with HMR |
| **MUI** | 7.1.2 | Material UI components |
| **React Router** | 7.6.2 | Client-side routing |
| **Zustand** | 5.0.5 | Client state management |
| **React Query** | 5.81.2 | Server state management |
| **React Hook Form** | 7.58.1 | Form handling |
| **Zod** | 3.25.67 | Schema validation |
| **Axios** | 1.10.0 | HTTP client with interceptors |

### Backend
| Component | Version | Purpose |
|-----------|---------|---------|
| **Django** | 5.1.2 | Web framework |
| **Django REST Framework** | 3.15.2 | REST API |
| **SQLite** | Built-in | Development database |
| **django-cors-headers** | 4.5.0 | CORS handling |
| **djangorestframework-simplejwt** | 5.3.0 | JWT authentication |
| **google-auth** | 2.25.2 | Google OAuth |
| **ollama** | 0.3.3 | AI model integration |

### Development Tools
- **ESLint** - TypeScript linting with strict rules
- **Prettier** - Code formatting
- **Husky** + **lint-staged** - Pre-commit hooks
- **Vitest** - Testing framework (configured, no tests written)

## Implemented Features

### Authentication System
- ✅ **Google OAuth 2.0** - Complete flow with JWT tokens
- ✅ **JWT Token Management** - Stored in localStorage, automatic Bearer headers
- ✅ **Protected Routes** - Automatic redirect to /signin on 401
- ✅ **User Profiles** - Django User + UserProfile with OAuth data
- ❌ **Email/Password Login** - Endpoints exist but no implementation
- ❌ **Apple OAuth** - Not implemented

### Chat System
- ✅ **Streaming Chat** - Real-time responses via Server-Sent Events
- ✅ **Ollama Integration** - Backend proxies to local Ollama instance
- ✅ **Model Selection** - Dynamic model list from `/v1/models`
- ✅ **Temperature & Top-P Controls** - Adjustable generation parameters
- ✅ **Token Counting** - Display with model-aware context limits
- ✅ **Chat UI** - Message list, auto-resize input, prompt cards
- ❌ **Chat History** - No persistence implemented

### Dashboard Analytics
- ✅ **Real-time Metrics** - 30-second auto-refresh
- ✅ **Request Tracking** - Automatic middleware logging all API calls
- ✅ **5-Table Schema** - RequestLog, UserSession, FeedbackLog, ThreatLog, ModelUsageStats
- ✅ **Time Range Filtering** - 24h, 7d, 1m, 3m, custom ranges
- ✅ **Comprehensive Analytics**:
  - Request volume (success/error)
  - Model usage statistics
  - Cost tracking per request/model
  - Geographic analytics
  - Latency monitoring
  - User activity metrics
  - Security threat detection
  - Feedback ratings
- ✅ **Django Admin** - Full interface for data management
- ✅ **Mock Data Generator** - Management command for testing

### UI/UX
- ✅ **Dark/Light/System Themes** - Persistent theme switching
- ✅ **Glassmorphic Design** - Blur effects, translucency
- ✅ **Responsive Layout** - Mobile-friendly with proper breakpoints
- ✅ **Navigation** - SideNav + TopBar for authenticated routes
- ✅ **Theme Colors** - Teal (#009688) and Lime-Yellow (#CDDC39)

### Placeholder Features (UI Only)
- 🎨 **Image Generation** - Complete UI with diffusion parameters, no backend
- 📄 **Coming Soon Pages** - Stream, Speech, Media, Build, History, Home
- 🔑 **API Keys** - Basic page exists, no functionality

## Project Structure

```
studio/
├── studio-frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── dashboard/    # Analytics charts and cards
│   │   │   ├── studio/       # Chat and image generation UI
│   │   │   └── *.tsx         # Layout and common components
│   │   ├── pages/            # Route components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── stores/           # Zustand state stores
│   │   ├── types/            # TypeScript interfaces
│   │   └── api/              # HTTP client configuration
│   └── public/assets/        # Images, fonts, static files
├── studio-backend/           # Django REST API
│   ├── authentication/       # Google OAuth, JWT, User profiles
│   ├── chat_models/          # Ollama proxy, streaming chat
│   ├── dashboard/            # Analytics models and API
│   ├── api_keys/            # Placeholder app (migrations only)
│   └── studio_backend/       # Django settings and URLs
└── plans/                    # Documentation (being updated)
```

## API Endpoints

### Authentication
- `GET /api/auth/oauth/google/` - Initiate Google OAuth
- `GET /api/auth/oauth/google/callback/` - OAuth callback (internal)
- `GET /api/auth/health/` - Health check

### Chat
- `POST /v1/chat/completions` - Streaming chat (Ollama proxy)
- `GET /v1/models` - Available models list
- `GET /v1/health` - Ollama connectivity check

### Dashboard
- `GET /api/dashboard/` - Analytics data with time range filtering
- `GET /api/dashboard/health/` - Dashboard system health

### Admin
- `/admin/` - Django admin interface (requires superuser)

## Development Setup

### Prerequisites
- Node.js ≥ 22.x
- Python ≥ 3.8
- Ollama running locally (for chat functionality)

### Environment Variables
Create `.env` file in `studio-backend/`:
```bash
SECRET_KEY=your-django-secret-key
DEBUG=True
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
OLLAMA_BASE_URL=http://localhost:11434
```

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd studio

# Backend setup (Terminal 1)
cd studio-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Create admin user
python manage.py runserver localhost:8000

# Frontend setup (Terminal 2)
cd studio-frontend
npm install
npm run dev

# Generate test data (Optional - Terminal 3)
cd studio-backend
python manage.py populate_dashboard_data --days=14 --users=3
```

### Available Scripts

Frontend:
```bash
npm run dev          # Development server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run type-check   # TypeScript validation
```

Backend:
```bash
python manage.py runserver       # Development server
python manage.py migrate         # Apply database migrations
python manage.py createsuperuser # Create admin user
python manage.py populate_dashboard_data  # Generate test data
```

## Current Limitations

1. **Authentication**: Only Google OAuth works. Email/password endpoints exist but are not functional.
2. **Chat History**: Messages are not persisted between sessions.
3. **Image Generation**: UI is complete but no backend implementation.
4. **API Keys**: Page exists but no functionality implemented.
5. **Ollama Dependency**: Chat requires Ollama running locally.
6. **Development Only**: Uses SQLite, not production-ready.

## License

Private project - All rights reserved.