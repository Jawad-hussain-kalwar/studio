## 🚀 Studio Frontend _(React + Vite)_

> **NOTE** This document covers only the **frontend** that lives in `studio-frontend/`. See the root-level `README.md` for backend plans and monorepo conventions.

---

### 📦 Product

`Studio` – a Google AI Studio-like web interface for experimenting with and deploying custom AI/LLM prompts & workflows.

---

### ✨ Tech Stack (pinned to currently installed versions)

| Purpose                | Library / Tool                                  | Version |
| ---------------------- | ----------------------------------------------- | ------- |
| Core UI                | **React**                                       | 19.1.x  |
| Language               | **TypeScript**                                  | 5.x     |
| Build Tool             | **Vite**                                        | 7.x     |
| Component Library      | **Material UI (MUI)**                           | 7.1.x   |
| Routing                | **React Router DOM**                            | 7.6.x   |
| Global State           | **Zustand**                                     | 5.0.x   |
| Server State / Caching | **@tanstack/react-query**                       | 5.81.x  |
| Forms & Validation     | **react-hook-form** + **zod**                   | latest  |
| HTTP Client            | **Axios**                                       | 1.10.x  |
| Styling (runtime)      | **@emotion/react & @emotion/styled** (MUI deps) | 11.14.x |
| Linting                | **ESLint** (+ @typescript-eslint)               | 9.x     |
| Testing                | **Vitest** + **@testing-library/react**         | 3.x     |

---

### 🛠️ Local Development

1. **Install dependencies**
   ```bash
   cd studio-frontend
   npm install
   ```
2. **Environment variables** – copy `.env.example` ➜ `.env.local` (file will be ignored by Git):

   ```env
   # REST / GraphQL API endpoint
   VITE_API_BASE_URL=http://localhost:8000

   # Optional 3rd-party keys
   VITE_SENTRY_DSN=
   ```

3. **Run dev server**
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

> **Want multiple envs?** Create `.env.staging`, `.env.production`, etc. Vite automatically picks the right one during build.

---

### 📂 Suggested Folder Layout

```text
src/
  api/            # Axios instance + React Query hooks
  components/     # Re-usable UI widgets
  hooks/          # Custom hooks (useAuth, useCopyToClipboard)
  pages/          # Route-level components
  stores/         # Zustand stores (authStore, uiStore)
  styles/         # MUI theme + global styles
  types/          # Shared TS types
  utils/          # Generic helpers
```

---

### 📜 NPM Scripts

| Script    | Description                            |
| --------- | -------------------------------------- |
| `dev`     | Start Vite dev server with HMR         |
| `build`   | Generate production build in `dist/`   |
| `preview` | Preview the production build locally   |
| `lint`    | Run ESLint (auto-fix with `--fix`)     |
| `test`    | Run unit / component tests with Vitest |

---

### 🚀 Deployment

The frontend can be deployed to **Vercel**, **Netlify**, or any static host.

Example Vercel steps:

1. Import the GitHub repo.
2. Set **Root Directory** → `studio-frontend`.
3. Define env vars in **Project → Settings → Environment Variables**.
4. Every push to `main` triggers a production deploy, PR branches get preview URLs.

---

### 🤝 Contributing

- Code must pass `npm run lint` & `npm run test`.
- Keep files ≤ 300 lines where possible – extract helpers.
- Use inline `// Reason:` comments to explain non-obvious logic.
- Record new tasks or discoveries in `TASK.md` under "Discovered During Work".

---

### 📄 License

NONE © 2025 Studio Project

---
