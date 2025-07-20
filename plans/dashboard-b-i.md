# Dashboard Backend Integration Plan (API & Data Layer)

> **Scope**: Design & implement the backend pieces required to supply the Dashboard UI defined in `dashboard-f.md` with real, aggregated metrics. This plan targets the Django backend inside `studio-backend/`.

---

## 1 — High-Level Requirements

1. Single aggregated endpoint (initially) providing all metrics used by the dashboard, filtered by a time-range.  
2. Response must be **camelCase JSON** to respect frontend expectations.  
3. Must support **Custom / 24H / 7D / 1M / 3M** presets via query params.  
4. Data must be computed efficiently (DB aggregation, optional Redis caching).  
5. Architecture should allow splitting into multiple smaller endpoints later without breaking the UI.

## 2 — API Specification

| Method | URL | Query Params | Description |
| ------ | --- | ----------- | ----------- |
| GET | `/api/dashboard/` | `range` (enum: custom \| 24h \| 7d \| 1m \| 3m), `start`, `end` (ISO 8601, required when `range=custom`) | Returns the full dashboard payload. |

### 2.1 Example Response

```jsonc
{
  "range": "7d",
  "generatedAt": "2025-07-09T11:32:00Z",
  "requests": {
    "timestamps": ["2025-07-02", "2025-07-03", "2025-07-04", "…"],
    "success": [1742, 1890, 2103, "…"],
    "error": [12, 15, 9, "…"]
  },
  "errorsBreakdown": [
    {"label": "400", "value": 1024},
    {"label": "401", "value": 540},
    {"label": "500", "value": 270}
  ],
  "topModels": [
    {"name": "gpt-4-vision-preview", "requests": 794467},
    {"name": "gpt-4", "requests": 562747}
  ],
  "costs": {
    "timestamps": ["2025-07-02", "…"],
    "value": [312.45, "…"]
  },
  "topCountries": [
    {"countryCode": "US", "requests": 4389},
    {"countryCode": "ID", "requests": 2948}
  ],
  "latency": {
    "timestamps": ["2025-07-02T12:00", "…"],
    "value": [6.05, 5.92, "…"]
  }
}
```

> **Note**: Keep nesting shallow and keys predictable for easy TypeScript typing.

## 3 — Data Source & Models

### 3.1 Existing Structures

We log chat completions in `chat_models/` but do **not** yet persist per-request metrics. We need a unified log table.

### 3.2 New Model — `RequestLog`

```py
class RequestLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)

    endpoint = models.CharField(max_length=64)          # e.g. '/v1/chat/completions'
    status_code = models.PositiveSmallIntegerField()
    latency_ms = models.FloatField()

    model_name = models.CharField(max_length=128)        # e.g. 'gpt-4'
    country_code = models.CharField(max_length=2, blank=True)

    # Cost info (optional, can be null if not applicable)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        indexes = [models.Index(fields=["created_at"]), models.Index(fields=["model_name"])]
```

• Logged in middleware so **all** endpoints automatically write entries.  
• Add country code extraction via geolocation of `request.META['REMOTE_ADDR']` (maxmind or similar) *optional*.

## 4 — Business Logic (Aggregation)

Create query-service layer `dashboard/services.py`:

```py
from django.db.models.functions import TruncDay, TruncHour
from django.db.models import Count, Sum, Avg, Case, When

def get_requests_over_time(qs, grain):
    trunc = TruncHour("created_at") if grain == "hour" else TruncDay("created_at")
    return (
        qs.annotate(period=trunc)
          .values("period")
          .annotate(
              success=Count(Case(When(status_code__lt=400, then=1))),
              error=Count(Case(When(status_code__gte=400, then=1))),
          )
          .order_by("period")
    )
```

Similar helpers for costs, latency, top models, etc. Package results into the response shape.

## 5 — View & Serializer

```py
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        range_param = request.GET.get("range", "7d")
        start, end, grain = parse_range(range_param, request.GET)

        qs = RequestLog.objects.filter(created_at__gte=start, created_at__lte=end)

        payload = compute_dashboard_payload(qs, grain)
        return Response(payload)
```

• `parse_range` returns `(start, end, grain)` where `grain` is `hour` or `day`.  
• `compute_dashboard_payload` uses service helpers & returns camelCase dict.

## 6 — Performance / Caching

1. Cache final JSON in Redis keyed by `(range, user.id)` for 60 s.  
2. Heavy aggregates (`3m`) pre-compute via nightly Celery task and store in a summary table to speed up requests.

## 7 — Security & Permissions

• Only authenticated users (JWT) may access.  
• In multi-tenant future, filter `RequestLog` by `user.account_id`.

## 8 — Migration & Data Seeding

1. Create migration for `RequestLog`.  
2. Implement `RequestLoggingMiddleware` and add to `MIDDLEWARE` after `django.middleware.common.CommonMiddleware`.  
3. Back-fill historical logs if available (optional).

## 9 — Frontend Integration Steps

1. Replace `useDashboardData.ts` mock fetch with React Query `useQuery` calling `/api/dashboard/`.  
2. Pass `range` param based on selected tab.  
3. Map response directly to chart props (shapes already aligned).

## 10 — Task Breakdown

1. **Model & Migration** – `RequestLog`.  
2. **Middleware** – log each request.  
3. **Service Layer** – aggregation helpers in `dashboard/services.py`.  
4. **Serializer** – `DashboardSerializer` (or inline dict).  
5. **View & URL** – `DashboardView` at `api/dashboard/`.  
6. **Unit Tests** – fixture logs → view returns correct aggregates.  
7. **Performance** – Redis caching decorator + Celery pre-computation.  
8. **Docs & README** – update API docs & environment variables for Redis/geolocation.

## 11 — Acceptance Criteria

- Endpoint returns JSON matching spec within **<500 ms** for 7-day range on dev DB of 1 M rows.  
- Data matches aggregates from direct SQL queries (tested).  
- Authenticated route only.  
- Redis caching hits for identical subsequent calls.  
- Frontend renders real data with zero code changes outside `useDashboardData`.

---

*End of Dashboard Backend Integration Plan* 