# 📝 Chat Playground Planning Document

## 1. Purpose & Scope
The Chat Playground replicates Google AI Studio's chat experience but with AI STUDIO branding and our design tokens. It enables authenticated users to converse with selected foundation models, tweak generation parameters, and view prompt/response history.

This document defines:
- Page layout & route
- Reusable UI components
- State management contracts
- API interactions
- Styling guidelines (teal & lime-yellow theme)
- Accessibility & responsiveness requirements
- Future enhancement hooks

---

## 2. Route & Access
| Path | Access | Redirects |
|------|--------|-----------|
| `/app/studio/chat` | Authenticated users | — |
| `/chat` | Authenticated users | → `/app/studio/chat` (handled by router) |

Both paths resolve to **`ChatPlaygroundPage`** and render inside `AppLayout` with the **Studio** side-nav variant active.

---

## 3. High-Level Layout
```
<AppLayout>
  ├─ <SideNav variant="studio" />          // global navigation
  ├─ <TopBar>
  │    ├─ Breadcrumb: Studio / Chat
  │    ├─ SearchBar (future)
  │    ├─ GetAPIKeyButton
  │    └─ ProfileMenu
  └─ <ChatPlaygroundPage>
        ├─ <PromptCardGrid />              // "What's new" cards when chat buffer empty
        ├─ <ChatMessageList />             // scrollable, fills remaining height
        └─ <ChatInputDock />               // sticky bottom input + send button

        + floating <RunSettingsDrawer />   // right-side slide-over
```

Visual reference is identical to the provided screenshot, substituting **AI STUDIO** logo/text and using theme colors.

---

## 4. Component Inventory
1. **ChatPlaygroundPage** (page container)
2. **PromptCard** (reusable marketing/preset card)
3. **ChatMessageList**
   - **ChatMessageItem** (assistant | user | system variants)
4. **ChatInputDock**
   - Multi-line `<TextareaAutosize>`
   - **SendButton** (teal bg, lime hover)
   - Model "thinking" spinner overlay
5. **RunSettingsDrawer**
   - Temperature slider
   - Top-p slider (hidden until advanced toggle)
   - Tool toggles (checkbox list)
   - Safety settings accordion
6. **ModelSelector** (drop-down in drawer header)
7. **TokenCountMeter** (shows request + response tokens in real time)
8. **SideNav** *(existing)* – ensure **Chat** item active
9. **TopBar** *(existing)*
10. **Toast** *(existing)* – error/success messages
11. **LoadingOverlay** – covers message list during initial load
12. **ConfirmationDialog** – clear history action

All new components live in `studio-frontend/src/components/studio/`.

---

## 5. State Management
`studioStore` (Zustand) additions:
- `messages: ChatMessage[]`
- `currentModel: string`
- `temperature: number`
- `tools: ToolToggleState`
- `sendMessage(text: string)` (optimistic append → API call)
- `clearChat()`

React-Query hooks:
- `useChatCompletion` (POST `/v1/chat/completions`)
- `useModels` (GET `/v1/models` for selector)

Side effects: Scroll to bottom on new message, focus input.

---

## 6. Styling & Theming
Color tokens (from `styles.md`):
- **Primary (teal)**: `#009688`
- **Accent (lime-yellow)**: `#CDDC39`
- **Surface**: matches dark/light modes established in auth pages

Guidelines:
- Buttons: teal background, lime focus ring
- Links & interactive icons: teal default, lime on hover/active
- Message bubbles: user → surface-3, assistant → surface-1 with teal left border
- Card hover shadow tinted teal
- Drawer scrollbar styled in surface-variant

Typography & spacing follow global `themeHelpers` scale.

---

## 7. Accessibility
- Ensure color contrast ≥ 4.5:1
- Keyboard navigable: Tab order `TopBar → SideNav → MessageList → Input → SettingsDrawer`
- `aria-live="polite"` on new assistant messages
- Provide `aria-label` for Send button

---

## 8. Responsiveness
- ≥ 1024 px: two-panel (chat + RunSettingsDrawer pinned open)
- 768–1024 px: drawer collapses to icon button (top-right)
- ≤ 768 px: full-width chat; settings drawer slides over

ChatInputDock always sticky bottom with safe-area insets for mobile.

---

## 9. Future Enhancements
- System / developer message roles
- Regenerate / edit message actions
- Prompt snippets sidebar
- Share / export conversation
- Voice input & TTS playback

---

## 10. Open Questions
1. Do we cache chat history per user or per session only?
2. How are stop sequences exposed in the UI?
3. Should we support function calling v1 in MVP?

Add answers or notes to **`TASK.md ▸ Discovered During Work`** when clarified.

## 11. Additional Implementation Considerations

> The items below have been added after a second-pass review to avoid surprises during implementation.  When any of these bullets are answered or delivered, update the relevant planning doc and/or `TASK.md`.

### 11.1 Routing & Auth Guards
- Wrap `/app/**` routes in a **`<ProtectedRoute>`** (or `AuthGate`) component that redirects unauthenticated users to `/signin`.
- Centralise 404 and logout redirects in `App.tsx` for consistency.

### 11.2 Data Contracts
- **`ChatMessage` type**: `{ id: string; role: "user" | "assistant" | "system"; content: string; createdAt: string; error?: boolean; functionCall?: {...} }`.
- Draft the full request / response JSON schema for `POST /v1/chat/completions` including **streaming** and **non-streaming** variants.
- Define standard error payloads (rate-limit, quota-exceeded, model-unavailable) so the Toast service can map them to friendly copy.

### 11.3 Streaming Strategy
- Use **`fetch` + ReadableStream** for token streaming (fallback to single-shot if browser lacks support).
- Maintain a reference to the current `AbortController` so users can press *Stop Generating*.
- Incrementally patch the last assistant message in `studioStore.messages` as chunks arrive.

### 11.4 Performance & Virtualisation
- Introduce **virtualised rendering** (e.g. `react-window`) for `ChatMessageList` once message count > 50.
- Memoise Markdown rendering / syntax highlighting to prevent reflows.

### 11.5 Persistence & Caching
- Decide between **IndexedDB** (via `idb-keyval`) or server-side history for resilience across tabs.
- Maximum stored conversations per user (configurable, default = 20).

### 11.6 Global UI Services
- Place an **`ErrorBoundary`** around `ChatPlaygroundPage` to capture render failures.
- Re-use existing **Toast** and **ConfirmationDialog** providers; list new events:
  1. Network / API failure
  2. Clear-history confirmation
  3. Model quota exceeded

### 11.7 Keyboard Shortcuts & A11y Details
- `Ctrl + Enter` → Send message
- `Esc` → Close RunSettingsDrawer
- `Alt + /` → Focus ChatInput
- Ensure correct `aria-live` regions update only when new content is appended.

### 11.8 Testing & QA
- **Unit**: Zustand store actions, utility formatters.
- **Component**: ChatInputDock, RunSettingsDrawer interactions.
- **E2E (Playwright)**: mock signin → send prompt → receive streamed response → assert token meter updates.

### 11.9 Feature Flags & Environment Variables
- `VITE_CHAT_STREAMING_ENABLED` (bool)
- `VITE_OPENAI_ENDPOINT`, `VITE_DEFAULT_MODEL`
- Provide `.env.example` with sane defaults/mocks.

### 11.10 Internationalisation & Copy Management
- Centralise UI strings in `locales/en.json` via a lightweight i18n util—even if English-only for MVP.

### 11.11 Documentation & DevOps Hooks
- Update **README.md** with new env vars & mock backend instructions.
- Make sure **`TASK.md`** is amended when these considerations transition to tasks.
- Add a CI check for missing env vars in Pull Requests.

--- 