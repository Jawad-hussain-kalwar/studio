## 🚀 Studio-Frontend README

> **NOTE**: This README only covers the **frontend** codebase that lives in the `studio-frontend/` folder. See the root project README for company-wide conventions, backend details, and infrastructure notes.

---

### 📦 Project Name
`<REPLACE_WITH_PRODUCT_NAME>` – a React-powered interface for interacting with our AI model APIs.

### ✨ Tech Stack
| Purpose | Library / Tool | Version |
|---------|----------------|---------|
| Core UI | **React** | 19.x |
| Language | **TypeScript** | 5.x |
| Build Tool | **Vite** | 5.x |
| Component Library | **Material UI (MUI)** | 6.x |
| Routing | **React Router** | 6.x |
| Global State | **Zustand** | 4.x |
| Server State / Caching | **@tanstack/react-query** | 5.x |
| Forms & Validation | **react-hook-form** + **zod** | latest |
| HTTP Client | **Axios** | latest |
| Styling (runtime) | **@emotion/react & @emotion/styled** (MUI deps) | latest |
| Linting & Formatting | **ESLint** + **Prettier** | latest |
| Testing | **Vitest** + **@testing-library/react** | latest |

---

### 🛠️ Local Development
1. **Install deps**
   ```bash
   pnpm install   # or yarn / npm
   ```
2. **Environment variables** – create `.env.local` at the repo root:
   ```env
   # Where the Django/LLM API lives
   VITE_API_BASE_URL=<https://api.example.com>

   # OAuth client IDs (frontend-only checks)
   VITE_GOOGLE_CLIENT_ID=<GOOGLE_OAUTH_CLIENT_ID>
   VITE_MICROSOFT_CLIENT_ID=<MS_OAUTH_CLIENT_ID>

   # Optional
   VITE_SENTRY_DSN=<YOUR_SENTRY_DSN>
   ```
3. **Run dev server**
   ```bash
   pnpm dev
   ```
4. Visit `http://localhost:5173` (default Vite port).

> **Need a different API URL per environment?** Add `.env.staging`, `.env.production`, etc. Vercel picks the correct file based on your deploy target.

---

### 📂 Recommended Folder Layout
```
src/
  api/            # Axios instance + React Query hooks
  components/     # Re-usable UI widgets (Button, Modal, etc.)
  hooks/          # Custom hooks (useAuth, useTheme)
  pages/          # Route-level components
  stores/         # Zustand stores (authStore, uiStore)
  styles/         # Global theme overrides (MUI)
  types/          # Shared TS types & interfaces
  utils/          # Helpers (formatDate, downloadFile)
```
_(Feel free to adjust as the project grows.)_

---

### 📜 NPM Scripts
| Script | Description |
|--------|-------------|
| `dev` | Start Vite in dev mode with hot reload |
| `build` | Production build (outputs to `dist/`) |
| `preview` | Locally preview the production build |
| `lint` | Run ESLint & Prettier checks |
| `test` | Run unit tests via Vitest |

---

### 🚀 Deployment
The frontend is deployed to **Vercel**.
1. Connect this repo / folder in the Vercel dashboard.
2. Set **Root Directory** to `studio-frontend`.
3. Define the same environment variables in Vercel Project Settings.
4. Every push to `main` triggers a production deploy; PRs get preview URLs.

_**TODO:** Add CI badge & link once GitHub Actions workflow is in place._

---

### 🤝 Contributing Guidelines
* Follow the code style enforced by ESLint/Prettier.
* Keep components ≤ 300 lines; refactor to smaller modules when needed.
* Document complex logic with inline comments: `// Reason: …`.
* See `PLANNING.md` for architecture decisions.

---

### 📄 License
`<CHOOSE_A_LICENSE>` – replace with actual license once decided.

---

### 🗒️ Changelog
* **YYYY-MM-DD** – Initial README created with stack details.

---

Happy coding! 🎉
