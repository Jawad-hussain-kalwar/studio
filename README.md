# Studio Monorepo

A full-stack playground consisting of a Vite + React front-end and a (to-be-implemented) back-end.  
This README explains how to set up the local environment, run the app in development, and build for production.

---

## Prerequisites

* **Node.js ≥ 22.x** (tested on 22.14.0)
* **npm ≥ 10.x** (tested on 10.9.2)
* Git

> Tip – use  `nvm` / `fnm` to manage Node versions.

---

## Project Structure

```text
studio/
├── studio-frontend/   # React 18 + Vite + TypeScript web client
├── studio-backend/    # API / server code (coming soon)
├── plans/             # High-level planning docs
└── README.md          # ← you are here
```

### Front-end Tech Stack

| Area               | Library / Tool |
|--------------------|----------------|
| Build              | Vite 5 (React-TS template) |
| UI                 | React 18, MUI 5, Emotion |
| Data-fetch / Cache | @tanstack/react-query |
| Routing            | react-router-dom v6 |
| Forms              | react-hook-form + zod |
| State Mgmt         | Zustand |
| Linting            | ESLint + @typescript-eslint |
| Testing            | Vitest + React Testing Library |

---

## Quick Start

```bash
# 1. Clone and enter the repo
$ git clone <repo-url> studio && cd studio

# 2. Install dependencies for the front-end
$ cd studio-frontend
$ npm install

# 3. Start the dev server (http://localhost:5173)
$ npm run dev
```

**Available npm scripts (inside `studio-frontend`)**

* `npm run dev`        – hot-reload dev server
* `npm run build`      – production build (outputs to `dist/`)
* `npm run preview`    – serve the production build locally
* `npm run lint`       – run ESLint over `src/`
* `npm run test`       – run unit / component tests with Vitest

---

## .gitignore Highlights

The root `.gitignore` has been extended to exclude:

* `node_modules` and Vite cache (`.vite/`)
* build output (`dist/`)
* editor / OS cruft (`.DS_Store`, `.idea/`, `.vscode/`)
* local env files (`studio-frontend/.env*`)

---

## Back-end

`studio-backend/` is currently empty – plans live in `plans/`.  Once the API skeleton is chosen we'll update this README with setup instructions.

---

## Contributing

1. Fork / clone the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Follow the existing code style (`npm run lint` passes)
4. Commit, push, and open a PR

---

## License

MIT © 2025 Studio Project