# Frontend Implementation

## Current Status

React 19 frontend with TypeScript, MUI components, and Zustand state management. Features functional chat playground, analytics dashboard, and Google OAuth authentication.

## Tech Stack

- **React**: 19.1.0 with modern hooks
- **TypeScript**: 5.8.3 with strict config
- **Material UI**: 7.1.2 for components
- **Zustand**: 5.0.5 for client state
- **React Query**: 5.81.2 for server state
- **React Router**: 7.6.2 for routing
- **Vite**: 7.0.0 for build tooling

## Implemented Features

### Authentication
- Google OAuth flow with JWT tokens
- Protected routes with automatic redirects
- Token storage in localStorage
- User profile in TopBar

### Chat Playground
- **Components**:
  - `ChatPlaygroundPage`: Main container
  - `ChatMessageList`: Message display
  - `ChatInputDock`: Auto-resize input
  - `RunSettingsPanel`: Model and parameters
  - `PromptCardGrid`: Quick start prompts
- **Features**:
  - Streaming responses via SSE
  - Model selection from API
  - Temperature/Top-P controls
  - Token counting display
  - Tool toggles (UI only)
  - Auto-scroll on new messages

### Dashboard Analytics
- **Components**:
  - `DashboardPage`: Main container
  - `DashboardGrid`: Chart layout
  - `TimeRangeTabs`: Period selection
  - Multiple chart components (MUI X Charts)
- **Features**:
  - Real-time data from backend
  - 30-second auto-refresh
  - Time range filtering
  - Responsive chart grid

### Image Generation (UI Only)
- **Components**:
  - `GenerateImagePage`: Main container
  - `ImageRunSettingsPanel`: Parameters
  - `ImageCanvas`: Placeholder display
- **Features**:
  - Complete UI with all controls
  - No backend integration
  - Static placeholder image

### Theme System
- Dark/Light/System modes
- Glassmorphic design
- Teal (#009688) and Lime-Yellow (#CDDC39)
- Persistent theme preference

## Page Structure

### Public Routes
- `/` - Landing page
- `/signin` - Sign in with OAuth
- `/signup` - Sign up with OAuth

### Protected Routes
- `/app` → redirects to `/app/studio/chat`
- `/app/studio/chat` - Chat playground
- `/app/studio/generate/image` - Image generation UI
- `/app/dashboard` - Analytics dashboard
- `/app/api-keys` - API keys page (minimal)

### Coming Soon Pages
- `/app/home` - Home page
- `/app/studio/stream` - Stream playground
- `/app/studio/generate/speech` - Speech generation
- `/app/studio/generate/media` - Media generation
- `/app/studio/build` - Build playground
- `/app/studio/history` - Chat history

## State Management

### Zustand Store (studioStore)
```typescript
interface StudioStore {
  messages: Message[];
  model: string;
  temperature: number;
  topP: number;
  // ... other chat state
}
```

### React Query
- Models list caching
- Dashboard data fetching
- 30-second refresh intervals

## API Integration

### HTTP Client (axios)
- Base URL configuration
- Bearer token interceptor
- 401 redirect handling
- 30-second timeout

### Endpoints Used
- `/api/auth/oauth/google/`
- `/v1/chat/completions`
- `/v1/models`
- `/api/dashboard/`

## Not Implemented

1. **Chat History**: No persistence
2. **Tool Calling**: UI toggles only
3. **Image Generation**: No API calls
4. **API Key Modal**: Button exists, no modal
5. **User Settings**: No preferences page
6. **Team/Workspace**: No multi-user features

## Component Architecture

### Layout Components
- `AppLayout`: Main authenticated layout
- `SideNav`: Navigation sidebar
- `TopBar`: Header with user menu
- `ProtectedRoute`: Auth wrapper

### Reusable Components
- `ThemeToggle`: Theme switcher
- `ComingSoon`: Placeholder pages
- `OAuthCallback`: OAuth handler

## Development Setup

```bash
cd studio-frontend
npm install
npm run dev
```

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run format` - Prettier format
- `npm run type-check` - TypeScript check
