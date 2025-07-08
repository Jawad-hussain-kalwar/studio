# AI Studio

A private AI experimentation platform with a modern React frontend. Currently features a fully functional chat playground with streaming responses, glassmorphic authentication UI, and image generation interface (UI-only). Backend implementation is planned but not yet built.

---

## Current Status

### ✅ **Implemented Features**
- **Landing Page** - Simple splash with gradient "AI STUDIO" title and Get Started CTA
- **Authentication UI** - Glassmorphic SignIn/SignUp pages with Google/Apple social buttons and email forms (UI-only, no backend)
- **Chat Playground** - Fully functional streaming chat with:
  - Model selection (gemini-2.5-flash-preview, claude-3-5-sonnet, gpt-4, etc.)
  - Temperature and Top-P controls
  - Tool toggles (URL context, image generation, function calling, etc.)
  - Prompt card grid for quick starts
  - Real-time streaming responses (mocked - no backend)
  - Token counting display
- **Image Generation UI** - Complete interface with diffusion model parameters (aspect ratio, CFG scale, sampler, steps, etc.) but no actual generation
- **Modern UI System** - Dark/light/system theme support with glassmorphic design
- **App Layout** - SideNav and TopBar for authenticated routes

### 🚧 **Placeholder/Coming Soon**
- **Dashboard** - Shows "Welcome to your dashboard! Stay tuned." message
- **Stream Playground** - Navigation exists but shows "Coming Soon"
- **Speech Generation** - Navigation exists but shows "Coming Soon" 
- **Media Generation** - Navigation exists but shows "Coming Soon"
- **Build Playground** - Navigation exists but shows "Coming Soon"
- **History** - Navigation exists but shows "Coming Soon"

### ❌ **Not Implemented**
- **Backend** - `studio-backend/` folder is empty, no API server
- **Real Authentication** - Social login buttons are UI-only
- **Actual AI Integration** - Chat streaming is mocked, image generation has no backend
- **Data Persistence** - No database, sessions, or user data storage
- **API Key Management** - Planned but no UI implemented

---

## Tech Stack

### Frontend (Implemented)
| Component | Version | Notes |
|-----------|---------|-------|
| **React** | 19.1.0 | Latest with new JSX transform |
| **TypeScript** | 5.8.3 | Strict configuration |
| **Vite** | 7.0.0 | Build tool with HMR |
| **MUI** | 7.1.2 | Component library with Emotion |
| **React Router** | 7.6.2 | Client-side routing |
| **Zustand** | 5.0.5 | State management |
| **TanStack Query** | 5.81.2 | Server state (ready for backend) |
| **React Hook Form** | 7.58.1 | Form handling |
| **Zod** | 3.25.67 | Schema validation |
| **Axios** | 1.10.0 | HTTP client |

### Development Tools
- **ESLint** + **TypeScript ESLint** - Strict linting rules
- **Prettier** - Code formatting
- **Husky** + **lint-staged** - Pre-commit hooks
- **Vitest** - Testing framework

### Backend (Planned)
- **Django** REST API with PostgreSQL
- **JWT Authentication** with social OAuth
- **Separate inference service** for AI models
- **Redis** for caching and sessions

---

## Project Structure

```
studio/
├── studio-frontend/          # React application (31+ TypeScript files)
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── studio/       # Chat & image generation components
│   │   │   ├── AppLayout.tsx # Main authenticated layout
│   │   │   ├── SideNav.tsx   # Navigation sidebar
│   │   │   └── TopBar.tsx    # Header with theme toggle
│   │   ├── pages/
│   │   │   ├── Landing.tsx   # Public landing page
│   │   │   ├── Public/       # SignIn, SignUp pages
│   │   │   └── App/          # Authenticated routes
│   │   │       ├── DashboardPage.tsx    # Placeholder dashboard
│   │   │       └── Studio/              # Playground pages
│   │   │           ├── ChatPlaygroundPage.tsx     # ✅ Functional
│   │   │           └── GenerateImagePage.tsx      # 🎨 UI-only
│   │   ├── stores/           # Zustand state management
│   │   ├── hooks/            # React Query API hooks
│   │   ├── types/            # TypeScript interfaces
│   │   └── api/              # HTTP client setup
│   └── public/assets/        # Static images and fonts
├── studio-backend/           # ❌ Empty folder
├── plans/                    # Comprehensive planning docs
│   ├── frontend.md           # Complete UI/UX specifications
│   ├── backend-*.md          # Backend implementation plans
│   └── auth-security-assessment.md
└── TASK.md                   # Development progress tracking
```

---

## Development Setup

### Prerequisites
- **Node.js ≥ 22.x** (tested on 22.14.0)  
- **npm ≥ 10.x** (tested on 10.9.2)

### Quick Start
```bash
# Clone and navigate
git clone <repository> studio && cd studio

# Install frontend dependencies  
cd studio-frontend && npm install

# Start development server (http://localhost:5173)
npm run dev
```

### Available Scripts
```bash
npm run dev          # Development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run type-check   # TypeScript validation
npm test            # Run Vitest tests
```

---

## Routes & Navigation

### Public Routes
- `/` - Landing page with "Get Started" CTA
- `/signin` - Glassmorphic login form with social buttons
- `/signup` - User registration form

### Authenticated Routes (AppLayout)
- `/app` → redirects to `/app/studio/chat`
- `/app/studio/chat` - **✅ Chat Playground** (fully functional)
- `/app/studio/generate/image` - **🎨 Image Generation** (UI-only)
- `/app/studio/stream` - **⏳ Stream Playground** (Coming Soon)
- `/app/studio/generate/speech` - **⏳ Speech Generation** (Coming Soon)
- `/app/studio/generate/media` - **⏳ Media Generation** (Coming Soon)
- `/app/studio/build` - **⏳ Build Playground** (Coming Soon)
- `/app/studio/history` - **⏳ History** (Coming Soon)
- `/app/dashboard` - **⏳ Dashboard** (placeholder)
- `/chat` → alias redirect to chat playground

---

## Current Limitations

⚠️ **This is a frontend-only implementation**
- Authentication is UI-only (social buttons don't work)
- Chat responses are mocked/streamed but no real AI backend
- Image generation shows parameters but can't generate images
- No data persistence or user sessions
- Dashboard and most features are placeholders

---

## Next Steps

1. **Backend Implementation** - Django API with authentication
2. **AI Integration** - Connect to LLM and image generation services  
3. **Real Authentication** - Google/Apple OAuth + JWT
4. **Data Persistence** - User sessions, chat history, generated content
5. **Feature Completion** - Implement remaining playground UIs

---

## Development Guidelines

- Read `TASK.md` before starting work
- Follow patterns in `plans/frontend.md` 
- Keep files under 300 lines
- Use existing design system and theme
- Add TypeScript types for new features
- Test components before marking complete

---

## License

This is a private project - All rights reserved.

## Chat Model Selection & Run Settings (Updated)

The **Run Settings** panel is now *model-aware*:

1. The model list is fetched from `/v1/models` and cached in **localStorage** for 10 minutes to reduce network overhead between reloads.
2. Each entry surfaces the following computed fields:
   - **displayLabel** – "<family> <FORMAT> <parameter_size> <quant_level>" (e.g. `llama GGUF 1.7B Q8_0`).
   - **contextLength** – maximum tokens supported (taken from architecture-specific metadata).
   - **capabilities** – array such as `["tools", "vision"]`.
3. The **token counter** now shows `used / contextLength` rather than a hard-coded ceiling.
4. Tool switches are capability-driven:
   - Core tools (URL context, Google grounding, Function calling, Code execution) require the `tools` capability and are disabled otherwise.
   - The **Vision** switch appears only for models with the `vision` capability.
5. When the current model changes the store automatically:
   - Resets enabled tools to the allowed set.
   - Updates `tokenCount.contextLength` for future validation.

> Technical Note: All capability checks are performed client-side via the `metadata.capabilities` array returned by the backend. Adding new capabilities server-side will automatically surface in the UI as long as the frontend defines a corresponding switch or feature.