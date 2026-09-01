# Student Marks Analytics & CO/PO Attainment Tool
### Module 6 — Dashboard & Visualization · Module 7 — Report Generation & Export

A standalone, production-quality frontend for the analytics and reporting layer
of an academic OBE (Outcome-Based Education) accreditation system. Built to be
demoed to faculty/accreditation reviewers today, and wired to a real backend
(Modules 1–5) tomorrow without any UI rewrite.

---

## 1. What's implemented

**Module 6 — Dashboard & Visualization**
- Main Dashboard: 6 KPI cards (with sparklines + trend vs previous assessment), grade distribution bar chart, student risk donut, CO attainment bar chart (with target line), PO attainment radar, performance trend line chart, and an "Automated Analytics Insights" panel generated live from the data.
- Performance Analytics page: subject-wise averages + trend.
- CO Attainment page: per-CO cards, attainment vs target chart, detailed table, auto-generated analysis notes.
- PO Attainment page: radar chart, PO table, and a CO→PO contribution heatmap matrix (0/1/2/3 mapping strength).
- Student Performance page: searchable/sortable/paginated table with grade & risk filters, and a full student detail drawer (subject/CO/assessment charts, strengths vs weaknesses, PDF marksheet button).
- Assessment Analytics page: per-assessment average/highest/lowest/median/std-dev/pass %, comparison chart, distribution donut, trend chart.
- Global chrome: collapsible sidebar, top filter bar (year/semester/branch/batch — all live-affect the data), dark mode (persisted), notifications dropdown, profile menu, and a `Ctrl+K` command palette.

**Module 7 — Report Generation & Export**
- Report Center with 7 report types, each with a configuration + live preview modal (institution header, metadata, tables) before export.
- Real PDF generation via jsPDF + jsPDF-AutoTable: Individual Marksheet, Class Performance, CO Attainment, PO Attainment, Assessment Analysis, Student Risk, Complete Academic Analytics — each with institution header, tables, footer and page numbers.
- Real `.xlsx` export via SheetJS for Class Performance, CO Attainment, PO Attainment, and Student Marks.
- Print support (browser print, with a dedicated print stylesheet that hides chrome).
- Export History page, persisted in `localStorage`, with delete.
- Data Preview page (tabbed: Students / Subjects / Assessments / Marks / COs / POs) — a transparent look at exactly what data the dashboard is consuming.
- Settings page (institution name, department, academic year, default semester/target, report footer) persisted in `localStorage`.

**Cross-cutting**
- No dead buttons — every control performs a real action.
- Toast notifications for success/failure of exports and filter changes.
- Skeleton loading states between page navigations.
- Empty states for no-results scenarios (search, filters, export history).
- Responsive layout (sidebar collapses, tables scroll horizontally, charts resize).
- Accessible: semantic roles, aria-labels, visible focus states, keyboard-operable nav and command palette.

---

## 2. Technology stack

| Concern | Choice |
|---|---|
| Markup/styling | HTML5, Tailwind (Play CDN, JIT — reflows on dynamic content), custom `css/styles.css` for design tokens & components Tailwind doesn't cover |
| Logic | Vanilla ES6+, no framework |
| Charts | Chart.js 4 (bar, line, radar, doughnut) |
| PDF | jsPDF + jsPDF-AutoTable |
| Excel | SheetJS (xlsx) — real `.xlsx` binary files, not CSV |
| Icons | Font Awesome 6 |

Everything is loaded from CDN, so the project runs immediately — no build step, no `npm install`.

---

## 3. Folder structure

```
student-marks-analytics/
├── index.html                 # App shell: sidebar, topbar, script includes
├── README.md
├── css/
│   └── styles.css             # Design tokens, layout, components, dark mode
├── data/
│   └── mockData.js            # SINGLE source of truth for all demo data
├── services/
│   ├── apiService.js          # Mock "REST" layer — replace this to go live
│   ├── analyticsService.js    # Pure calculation functions (avg, grade, CO/PO attainment, risk…)
│   └── reportService.js       # jsPDF / SheetJS generation + export history (localStorage)
└── js/
    ├── app.js                 # Router, sidebar/topbar, filters, theme, command palette
    ├── ui.js                  # Toasts, modal/drawer, skeletons, badges, chart color helpers
    ├── dashboard.js           # Dashboard + Performance Analytics pages
    ├── students.js            # Student Performance page + detail drawer
    ├── co.js                  # CO Attainment page
    ├── po.js                  # PO Attainment page + CO/PO matrix
    └── reports.js             # Report Center, Export History, Data Preview, Settings
```

---

## 4. How to run

Just open `index.html` in a browser, or serve it locally (recommended, avoids `file://` CORS quirks):

```bash
cd student-marks-analytics
python3 -m http.server 8080
# then open http://localhost:8080
```

No build tools, no dependencies to install.

---

## 5. The mock API layer — where the backend team plugs in

**`services/apiService.js` is the single seam between UI and data.** Every page
in `js/*.js` calls functions on the global `ApiService` object — never
`MOCK_DB` directly. To connect a real backend:

1. Keep the exact function names/signatures in `apiService.js`.
2. Replace each function body with a `fetch()` call to the matching endpoint.
3. Nothing in `js/*.js` needs to change.

Example:

```javascript
// BEFORE (mock)
async function getDashboardAnalytics(filters) {
  const students = resolveStudents(filters);
  // ...compute from MOCK_DB...
  return resolveAfterDelay({ ... });
}

// AFTER (real backend)
async function getDashboardAnalytics(filters) {
  const qs = new URLSearchParams(filters).toString();
  const res = await fetch(`/api/dashboard?${qs}`);
  if (!res.ok) throw new Error('Failed to load dashboard analytics');
  return res.json();
}
```

### Suggested REST contract

```
GET  /api/filters                      -> { academicYears, semesters, branches, batches }
GET  /api/dashboard?year&sem&branch&batch
GET  /api/insights?year&sem&branch&batch
GET  /api/students?year&sem&branch&batch
GET  /api/students/:id
GET  /api/co-attainment?year&sem&branch&batch
GET  /api/po-attainment?year&sem&branch&batch
GET  /api/co-po-matrix
GET  /api/assessment-analytics?year&sem&branch&batch
```

The frontend does not assume any backend language (Java/Spring, Python/Flask
or FastAPI, Node, etc.) — it only expects JSON over HTTP, so any of those
stacks can implement the contract above unchanged.

**`services/analyticsService.js`** is intentionally backend-agnostic pure
functions (`calculateAverage`, `calculateGrade`, `calculateCOAttainment`,
`calculateRisk`, …). Even after the backend exists, this file remains useful
for any client-side re-aggregation (e.g. recomputing a filtered subset without
a round trip), or can be ported to the backend language as-is for parity.

**`services/reportService.js`** only depends on `ApiService`, so PDF/Excel
generation keeps working unmodified once `apiService.js` is pointed at a real
backend.

---

## 6. CO/PO attainment methodology (demo)

This project labels its calculation approach explicitly as a **Demo
Calculation Method** rather than claiming to be an official NBA/NAAC formula:

- **CO Attainment** = class-average of each student's per-CO internal
  assessment performance (see `AnalyticsService.calculateCOAttainment`).
- **PO Attainment** = weighted roll-up of CO attainments into each PO, using
  the CO→PO mapping strength (0/1/2/3) from the CO-PO matrix as the weight
  (see `AnalyticsService.calculatePOAttainment`).

Replace these two functions with your institution's official OBE formula when
integrating with real assessment data — the rest of the UI (charts, tables,
reports) will continue to work unchanged since they only consume the output
shape (`{ id, target, attainment }`).

---

## 7. Report generation & export details

- **PDF**: `ReportService.generateReport(reportType, options)` dispatches to
  one of 7 generators, each producing a real multi-section PDF with an
  institution header, data tables (via AutoTable), and a footer with page
  numbers — downloaded directly via `doc.save(...)`.
- **Excel**: `ReportService.exportExcel(reportType, filters)` builds a real
  workbook via `XLSX.utils.json_to_sheet` and downloads a genuine `.xlsx`
  file via `XLSX.writeFile`.
- **Preview**: the Report Center always shows an on-screen preview
  (institution header + tables) before any file is generated — nothing
  downloads silently.
- **History**: every successful export is appended to `localStorage`
  (`sma_export_history_v1`) and shown on the Export History page.

---

## 8. Known scope boundaries (by design)

This deliverable intentionally does **not** include: authentication, a real
database, or CRUD screens for students/subjects/marks — those belong to
Modules 1–5, built by the rest of the team. The Faculty profile, role badge
and Logout button in the sidebar are presentational placeholders that call
`ApiService`-style functions only where real, computable data exists.
