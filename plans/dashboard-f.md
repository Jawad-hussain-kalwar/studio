# Dashboard Frontend Implementation Plan (Dashboard UI)

> **Scope**: Build the Dashboard page shown in the reference screenshot using React + TypeScript, Material UI (MUI) core & MUI X Charts. This plan focuses solely on the **frontend**; see `dashboard-b-i.md` for backend details.

---

## 1 — Architectural Overview

• **Route**: `/app/dashboard` → `DashboardPage` component (already routed in React Router).  
• **State & Data**: start with local **mock data** (`src/mock/dashboard.ts`), later swap to React Query hook (`useDashboardQuery`).  
• **Charts**: All data-visualisations use **MUI X Charts** – plenty for line, bar, donut.

## 2 — Component Hierarchy

```text
DashboardPage
 ├─ DashboardHeader
 │   ├─ TimeRangeTabs           (Custom, 24H, 7D, 1M, 3M)
 │   ├─ FilterButtons           (Show Filters / Saved Filters)
 └─ DashboardGrid               (CSS Grid wrapper)
     ├─ RequestsChartCard       (line chart: success vs error)
     ├─ ErrorsDonutCard         (donut chart: 400 / 401 / 500)
     ├─ TopModelsCard           (horizontal bar)
     ├─ CostsBarCard            (daily cost bar chart)
     ├─ TopCountriesCard        (horizontal bar)
     └─ LatencyChartCard        (line chart)
```

### 2.1 Shared Atoms / Molecules

| Component            | Responsibility                                             | Key Props |
| -------------------- | ---------------------------------------------------------- | --------- |
| `MetricCard`         | Reusable MUI `<Paper>` wrapper with title, optional subtitle & action menu. | `title`, `children`, `height?` |
| `TimeRangeTabs`      | Styled MUI `<Tabs>` controlling selected time window.      | `value`, `onChange` |
| `FilterButtons`      | Two MUI `<Button>`s aligned right.                         | callbacks |
| `ChartContainer`     | Handles **light/dark** theme palette selection for charts. | `children` |

### 2.2 Chart Components

All chart cards delegate actual drawing to small stateless chart atoms for separation & easier testing.

| Chart Atom                | MUI X Chart | Data Shape |
| ------------------------- | ----------- | ---------- |
| `RequestsLineChart`       | `LineChart` | `{ timestamp: string; success: number; error: number }[]` |
| `ErrorsDonutChart`        | `PieChart`  | `{ label: string; value: number }[]` |
| `HorizontalBarChart`      | `BarChart`  | generic for Top Models / Countries |
| `CostsBarChart`           | `BarChart`  | `{ timestamp: string; cost: number }[]` |
| `LatencyLineChart`        | `LineChart` | `{ timestamp: string; latency: number }[]` |

> **Why this split?**  
> • Card handles layout, margin, title.  
> • Chart atom focuses purely on rendering & theming.

## 3 — Theming (Light & Dark)

We already have `ThemeProvider` & `ThemeContext` in `studio-frontend`. Integrate charts by reading the MUI palette:

```ts
const { palette } = useTheme();
const lineColor = palette.success.main; // etc.
```

Wrap every chart in `ChartContainer` that feeds computed colors into MUI X Charts `theme` prop so both themes stay consistent.

## 4 — Mock-Data & Swapping Strategy

1. **File**: `src/mock/dashboard.ts` exports strongly-typed objects matching chart props.  
2. **Hook**: `src/hooks/useDashboardData.ts`:

```ts
export function useDashboardData(range: TimeRange) {
  // today: return MOCK_DASHBOARD_DATA[range];
  // future: replace with React Query fetching logic.
}
```

3. Components remain agnostic: they receive data via hook props, not import mock directly.  
4. When backend is ready, simply change implementation of `useDashboardData` without touching UI code.

## 5 — Implementation Order (Tasks)

1. **Scaffold Route/Page** – confirm `/app/dashboard` renders placeholder text.  
2. **Create Mock Data & Types** – `types/dashboard.ts`, `mock/dashboard.ts`.  
3. **Build DashboardHeader** – tabs + buttons, wire up state.  
4. **Create MetricCard atom** – common wrapper.  
5. **Implement Chart Atoms** – start with RequestsLineChart to validate MUI X Charts integration.  
6. **Implement each *Card** component one by one, consuming chart atoms + mock data.  
7. **Compose DashboardGrid** – responsive CSS Grid (MUI `Grid` or `Box` with `display: grid`).  
8. **Theme Handling** – integrate `ChartContainer` and verify both light & dark.  
9. **Refactor `useDashboardData`** – isolate data hook & swap logic placeholder.  
10. **QA & Storybook (optional)** – add stories for each card for visual testing.  
11. **Write Docs** – update `README.md` & append new task to `TASK.md`.

## 6 — File & Folder Structure

```text
studio-frontend/
└─ src/
   ├─ pages/
   │   └─ App/
   │      └─ DashboardPage.tsx          <-- new
   ├─ components/
   │   └─ dashboard/
   │      ├─ DashboardHeader.tsx
   │      ├─ DashboardGrid.tsx
   │      ├─ MetricCard.tsx
   │      ├─ TimeRangeTabs.tsx
   │      ├─ FilterButtons.tsx
   │      ├─ cards/
   │      │   ├─ RequestsChartCard.tsx
   │      │   ├─ ErrorsDonutCard.tsx
   │      │   ├─ TopModelsCard.tsx
   │      │   ├─ CostsBarCard.tsx
   │      │   ├─ TopCountriesCard.tsx
   │      │   └─ LatencyChartCard.tsx
   │      └─ charts/
   │         ├─ RequestsLineChart.tsx
   │         ├─ ErrorsDonutChart.tsx
   │         ├─ HorizontalBarChart.tsx
   │         ├─ CostsBarChart.tsx
   │         └─ LatencyLineChart.tsx
   ├─ hooks/
   │   └─ useDashboardData.ts           <-- mock today, query later
   ├─ mock/
   │   └─ dashboard.ts
   └─ types/
       └─ dashboard.ts
```

## 7 — Acceptance Criteria

- Page visually matches provided screenshot for light & dark themes.
- All 6 metric panels show sensible placeholder data.
- Switching time range tabs updates data (using different mock slices).
- No component exceeds **300 lines**.
- Swapping to backend requires **only updating `useDashboardData`** (plus adding React Query calls).

---

*End of Dashboard Frontend Plan* 