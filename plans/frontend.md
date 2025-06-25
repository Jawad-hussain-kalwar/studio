## 🗺️ Front-end Page & Route Plan (Definitive)

This document captures the **final set** of pages, routes, and core UI pieces for the AI Studio clone.

---

### 1. Public Routes (no authentication)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `LandingPage` | Marketing splash with CTA → Sign Up / Sign In |
| `/pricing` | `PricingPage` | Optional tier breakdown |
| `/legal/terms` | `TermsPage` | Terms of Service |
| `/legal/privacy` | `PrivacyPage` | Privacy Policy |
| `/legal/billing-support` | `BillingSupportPage` | Help & billing FAQs |
| `/feedback` | `FeedbackPage` | Send feedback form |
| `/auth/sign-in` | `SignInPage` | Login (email / OAuth) |
| `/auth/sign-up` | `SignUpPage` | Register new account |
| `/auth/forgot-password` | `ForgotPasswordPage` | Password reset request |
| `/auth/reset-password/:token` | `ResetPasswordPage` | Enter new password |

**Layout:** `PublicLayout` (minimal header + footer)

---

### 2. Authenticated Application Shell

All private routes live under `/app/*` and share `AppLayout`:
```
<AppLayout>
  ├── <SideNav />      // contextual (Studio vs Dashboard)
  ├── <TopBar />       // breadcrumb, search, Get API Key btn, profile menu
  └── <Outlet />       // route content
</AppLayout>
```
Top-bar nav pills: **Studio**, **Dashboard**.  Gear icon opens the Settings dropdown (links to legal/help pages above).

---

### 3. Private Route Map

#### 3.1 Home
| Path | Component | Description |
|------|-----------|-------------|
| `/app` → redirects to `/app/home` | — | — |
| `/app/home` | `HomePage` | Overview cards: recent prompts, quick links |

#### 3.2 Studio (Playgrounds)
| Path | Component | Notes |
|------|-----------|-------|
| `/app/studio/chat` | `ChatPlaygroundPage` | Text chat + model selector |
| `/app/studio/stream` | `StreamPlaygroundPage` | Real-time streaming dialogue |
| `/app/studio/generate/image` | `ImageGenerationPage` | Text → Image |
| `/app/studio/generate/speech` | `SpeechGenerationPage` | Text → Audio |
| `/app/studio/generate/media` | `MediaGenerationPage` | Multimodal generation |
| `/app/studio/build` | `BuildPlaygroundPage` | Visual builder for workflow/apps |
| `/app/studio/history` | `PromptHistoryPage` | Saved prompts & runs |

#### 3.3 Dashboard (Admin)
| Path | Component | |
|------|-----------|---|
| `/app/dashboard` → redirects to `/app/dashboard/api-keys` | — | — |
| `/app/dashboard/api-keys` | `ApiKeysPage` | Create / revoke API keys |
| `/app/dashboard/usage-billing` | `UsageBillingPage` | Tabs: Usage (charts), Billing (invoices) |
| `/app/dashboard/changelog` | `ChangelogPage` | Release notes |

#### 3.4 Apps
| Path | Component | Description |
|------|-----------|-------------|
| `/app/apps` | `AppsListPage` | List of user-created apps |
| `/app/apps/new` | `AppBuilderPage` | Create new app wizard |
| `/app/apps/:appId` | `AppDetailPage` | Chat & settings for a specific app |

---

### 4. Shared UI Components

* `SideNav` – collapsible drawer; variant differs between Studio & Dashboard.
* `TopBar` – route name, breadcrumbs, search, notifications, profile menu.
* `RunSettingsDrawer` – model selector, temperature, tool toggles, safety settings.
* `ChatMessageList`, `ChatInput`, `ModelSelector`, `PromptSettingsPanel`.
* `PromptCard` – reusable card ("What's new" grid).
* Charts: `TokenCountChart`, `RequestCountChart`.
* `ApiKeyCard`, `ConfirmationDialog`, `Toast`, `LoadingOverlay`.
* `EnableSavingSwitch` – pinned bottom-left toggle.

---

### 5. State Management

Zustand stores (UI-only state) + React Query for server data.

| Store | Responsibilities |
|-------|------------------|
| `authStore` | auth info, JWT, login/logout |
| `uiStore` | sidebar state, theme, toasts |
| `studioStore` | current model, temperature, chat buffer |
| `appsStore` | user apps list, drafts |

---

### 6. API Layer

`axios` instance with auth interceptor in `src/api/http.ts`.

Feature hooks: `useChatCompletion`, `useGenerateImage`, `useUsageStats`, etc.

Global `ErrorBoundary` + toast error reporting.

---

### 7. Folder Skeleton (`studio-frontend/src`)
```
api/
components/
  common/
  studio/
  dashboard/
  apps/
  charts/
hooks/
pages/
  Public/
    LandingPage.tsx
    SignInPage.tsx
    ...
  App/
    HomePage.tsx
    Studio/
      ChatPlaygroundPage.tsx
      StreamPlaygroundPage.tsx
      ImageGenerationPage.tsx
      SpeechGenerationPage.tsx
      MediaGenerationPage.tsx
      BuildPlaygroundPage.tsx
      PromptHistoryPage.tsx
    Dashboard/
      ApiKeysPage.tsx
      UsageBillingPage.tsx
      ChangelogPage.tsx
    Apps/
      AppsListPage.tsx
      AppBuilderPage.tsx
      AppDetailPage.tsx
  Legal/
    TermsPage.tsx
    PrivacyPage.tsx
    BillingSupportPage.tsx
  FeedbackPage.tsx
stores/
styles/
```

---

### 8. Milestones

1. Scaffold routing & layouts (AppLayout, PublicLayout).
2. Implement auth (Sign In/Up) and protected routes.
3. Ship Chat playground MVP.
4. Add Stream, Image, Speech, Media playgrounds.
5. Dashboard (API Keys, Usage & Billing, Changelog).
6. Apps builder CRUD.

Each milestone ends with a deployable preview.

---

### 9. Open Questions

* Organisation / team workspaces?
* Billing provider (Stripe?) – affects Usage & Billing.
* Real-time SSE or WebSocket for Stream playground.
* Feature-flag solution for beta features.

Add discoveries to `TASK.md` under **Discovered During Work**.
