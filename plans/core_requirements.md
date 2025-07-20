# LLM‑as‑a‑Service (LLMaaS) — Core Requirements

> **Scope** — Technical backbone only.  No stakeholder, glossary, or bureaucratic sections.  Focus on what we must build and how, not why.

---

## 1 · High‑Level Architecture

```
Users ─▶ Frontend (React + Vite) ─▶ Django API ─▶ LiteLLM Proxy ─▶ Inference Runtime(s) ▶ LLM
                     ▲                    │
                     └─ Postgres ◀────────┘

Aux Services: Redis (cache/rate‑limit), RabbitMQ/Kafka (async), Nginx (edge/TLS), Prometheus + Grafana (metrics)
CI/CD: GitHub Actions  │  Container Orchestration: Docker Compose → Kubernetes (TBD)
```

---

## 2 · Technology Stack

| Layer           | Choice(s) & Version Targets                                                         | Notes                                                    |
| --------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Frontend        | React 19, Vite 5, TypeScript 5.x, TanStack Query 5, Zustand 4, Axios ^1.6, httpx-ts | SSR not required.  SPA only.                             |
| Backend         | Python 3.11, Django 5, DRF 3.16                                                     | JWT‑based OAuth2 (django‑oauth‑toolkit).                 |
| Proxy / Gateway | LiteLLM Proxy ≥ 0.4.x                                                               | OpenAI‑style routes + virtual keys.                      |
| Inference       | Ollama 0.2.x (local); future vLLM ≥ 0.4 & sGLang ≥ 0.3                              | Must expose `/v1/*` routes.                              |
| Database        | PostgreSQL 15                                                                       | Single instance in dev; managed cluster prod.            |
| Cache           | Redis 7.x                                                                           | For rate‑limit counters, request cache, async job queue. |
| Message Queue   | RabbitMQ 3.13 **or** Kafka 3.7 (TBD)                                                | Used by Celery‑Beat jobs & billing pipeline.             |
| Observability   | Prometheus ≥ 2.52, Grafana 10                                                       | Scrape LiteLLM & Django metrics.                         |
| Reverse Proxy   | Nginx 1.26                                                                          | TLS termination + compression.                           |
| Container       | Docker 24; optional Kubernetes 1.30                                                 | Compose for dev; Helm chart later.                       |
| CI/CD           | GitHub Actions                                                                      | Build, test, push images, apply K8s manifests.           |

---

## 3 · Frontend Requirements

### 3.1 Pages / Routes

| Route                | Purpose                                             | Key Components                     |
| -------------------- | --------------------------------------------------- | ---------------------------------- |
| `/`                  | Landing / docs splash                               | Markdown docs loader               |
| `/dashboard`         | Usage graphs, billing summary                       | TanStack Query, recharts           |
| `/keys`              | Create, revoke API keys                             | Modal with sk‑… reveal (copy once) |
| `/playground`        | Chat playground (model selector, temperature, etc.) | Streaming SSE, status indicators   |
| `/history`           | Past chats & export                                 | Infinite scroll, CSV/JSON export   |
| `/login` & `/signup` | OAuth2 flow                                         | Redirect to Django auth server     |

### 3.2 State & Data Flow

- **Zustand** stores auth token, active key, UI prefs.
- **TanStack Query** handles all API fetching with retry/back‑off.
- **Axios Instance**: `baseURL` env‑driven, attaches `Authorization` header.
- **Streaming Helper**: custom hook `useChatStream()` wraps OpenAI SDK, publishes thinking indicators (first‑token, done).

### 3.3 UX & Validation

- Limit prompt size client‑side (configurable).
- Warn on token quota nearing 90 %.
- Dark‑mode first; responsive up to 320 px.

---

## 4 · Backend (Django + DRF)

### 4.1 Apps & Packages

| Django App | Purpose                                          |
| ---------- | ------------------------------------------------ |
| `accounts` | OAuth2, user profile                             |
| `keys`     | Virtual‑key CRUD wrapper around LiteLLM `/key/*` |
| `usage`    | Store request/response payloads, token counts    |
| `billing`  | (Phase 2) Stripe metered usage events            |
| `webhooks` | Receive LiteLLM callbacks                        |

### 4.2 REST Endpoints

| Method + Path                | Auth       | Purpose                         |
| ---------------------------- | ---------- | ------------------------------- |
| `POST /api/keys/`            | OAuth      | Create new key → returns `sk‑…` |
| `DELETE /api/keys/{id}/`     | OAuth      | Revoke key                      |
| `GET /api/usage/summary`     | OAuth      | Aggregate tokens by month       |
| `GET /api/chats/?key=...`    | OAuth      | Paginated history               |
| `POST /api/webhooks/litellm` | Master sig | Save per‑call data              |

### 4.3 Celery Tasks (RabbitMQ/Kafka)

- `aggregate_daily_usage` → sums tokens, writes `DailyUsage` table.
- `check_budgets` → flags keys above quota; emit alert event.
- `export_stripe_usage` (phase 2).

---

## 5 · Database Schema (Postgres)

```
users             (id, email, pwd_hash, …)
api_keys          (id, user_id, key, created_at, revoked_at)
request_logs      (id, api_key_id, model, prompt_tokens, completion_tokens, ts, latency_ms)
chat_history      (id, request_log_id, role, content)
monthly_usage     (user_id, month, tokens, cost_usd)
```

*LiteLLM Proxy owns its own **`virtual_keys`** & **`spend`** tables — keep in same DB for JOINs.*

---

## 6 · Inference Layer

1. **Ollama Service**
   - Runs on port `11434`; expose `/v1`.
   - Models pinned by digest; quantization level in env‐var.
2. **Future Adapters**
   - `vllm serve` on `8000`; add to `model_list` in LiteLLM.
   - `sglang api-server` on `8001`.
3. **Hot Reload**
   - Use LiteLLM’s `/model/add` to register new model at runtime.

---

## 7 · LiteLLM Proxy Config (snippet)

```yaml
master_key: ${LITELLM_MASTER_KEY}
database_url: ${DATABASE_URL}
port: 4000
model_list:
  - model_name: llama3
    litellm_params:
      api_base: "http://127.0.0.1:11434/v1"
callbacks:
  - "http://127.0.0.1:8000/api/webhooks/litellm"
redis_host: 127.0.0.1   # for rate limits across nodes
```

---

## 8 · Redis Utilisation

- **Rate‑limiting counters** (LiteLLM).
- **TanStack server‑state cache** (optional via Django channels).
- **Celery broker fallback** if RabbitMQ/Kafka not chosen.

---

## 9 · Observability & Logs

| Concern    | Tool                                                              | Note |
| ---------- | ----------------------------------------------------------------- | ---- |
| Metrics    | Prometheus scrape `:4000/metrics`, Django `/metrics`, DB exporter |      |
| Dashboards | Grafana — latency, tokens/min, error rate                         |      |
| Traces     | OpenTelemetry + Jaeger (stretch)                                  |      |
| Logs       | JSON‑structured; shipped to Loki or Elasticsearch.                |      |

---

## 10 · Containerisation & Deployment

| Stage | Tool                                    | Outcome                            |
| ----- | --------------------------------------- | ---------------------------------- |
| Dev   | `docker‑compose.dev.yml`                | One‑host stack, hot‑reload volumes |
| CI    | GitHub Actions → `docker buildx bake`   | Tag `:sha‑short`, push to GHCR     |
| Prod  | Kubernetes (Helm) **or** Compose‑Swarm  | Nginx Ingress, secret mounts       |
| TLS   | Nginx + Let’s Encrypt certbot container |                                    |

---

## 11 · CI/CD Pipeline (GitHub Actions)

1. **Lint & Test** – flake8, mypy, Jest/Playwright.
2. **Build Images** – `frontend`, `backend`, `proxy`, `ollama`.
3. **Push** to GHCR.
4. **Deploy** – `kubectl apply -f k8s/` via OIDC‑auth runner.

---

## 12 · Security Essentials

- All traffic HTTPS only.
- 12‑factor env‑vars for secrets.
- Rotate master key monthly.
- OAuth access tokens short‑lived; refresh tokens rotated.
- CSP headers, rate‑limit middleware, input length validation.

---

## 13 · Open Topics / TODOs

| Area                   | Decision Needed                                       |
| ---------------------- | ----------------------------------------------------- |
| Message Queue          | RabbitMQ vs. Kafka (throughput, ops team familiarity) |
| Orchestration          | Commit to Kubernetes or stay on Docker Compose prod?  |
| Billing                | Stripe metered billing integration timeline?          |
| Multi‑tenant Org Model | Single‑tenant for MVP or org separation now?          |
| Content Moderation     | Implement after usage scaling or day‑1?               |

---

*End of core requirements.*

