# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — Launch-ready release

### Added
- **16 integrated services**: Landing, Dashboard, Service Catalog, Idea Discovery, Deep Research, Curriculum Builder, Sales Page, Launch Emails, Pricing & Packages, First 100 Students Growth, Review & Governance, Templates Library, Output Center, Analytics, Settings, and the new **Final Venture Blueprint**.
- **Bilingual (Arabic / English)** with automatic RTL/LTR switching and branded typography (Cairo / Inter).
- **Dark / Light theme** applied across all surfaces with smooth transitions.
- **Mobile responsive layout** with animated drawer navigation.
- **Command palette** (⌘K / Ctrl+K) for instant navigation.
- **Curriculum Builder** centerpiece with:
  - Undo / Redo (50-step history) + keyboard shortcuts
  - Save Draft independent of approval status
  - Drag-and-drop module reordering (`@dnd-kit`)
  - Inline content editing for title, summary, content, transformation, objectives
  - Module-level & curriculum-level comments with reason codes
  - Live Lean Score with animated progress ring
  - Multi-format export (PDF, Word, HTML, PowerPoint, JSON)
- **Deep Research module** upgraded with SWOT analysis, 3 buyer personas, pricing bands, priority score, and markdown-formatted core analysis with tables.
- **DetailedProgress** component — per-service sub-task progress indicators replacing the generic spinner.
- **ServiceActionsBar** — unified Export + Share pattern across all 6 non-curriculum services.
- **ExportMenu dropdown** — consistent UX for PDF / Word / HTML / PPT / JSON exports.
- **Share feature** — URL-encoded shareable snapshots with a dedicated read-only `ShareViewer` page.
- **NextSteps recommender** — dynamic service suggestions based on current context, with "Final Venture Blueprint" CTA when enough data exists.
- **Review & Governance**: state machine (`draft → in_review → approved | revision_requested`), reason codes R001–R007, threaded comments at module + curriculum level.
- **Templates Library** with fork / clone / derive operations and lineage.
- **Output Center** with smart format recommendations per deliverable.
- **Analytics page** with 3-level KPIs (Service / Journey / Business) and animated bar charts.
- **Settings page** with theme toggle, language toggle, data export / import / reset, Claude AI status, and keyboard shortcut reference.
- **Final Venture Blueprint** — consolidated journey view with progress bar, stage timeline, and full-bundle PDF export.
- **Error handling** with per-service retry buttons.
- **ErrorBoundary** at app root for graceful failure.
- **Share link viewer** with brand shell, unicode-safe base64 encoding (handles Arabic), and inline PDF / Word / HTML / PPT re-export.
- **Claude API scaffold** (`lib/claude.ts`) with `withClaudeFallback` pattern — wire any proxy (Claude / Gemini / OpenAI) via `VITE_CLAUDE_PROXY_URL`.
- **Mock AI** (`lib/mockAI.ts`) — deterministic, realistic structured output for full offline operation.
- **Render Blueprint** (`render.yaml`) for one-click deployment with preview environments.
- **DEPLOY.md** — complete deployment guide for Render, Vercel, Netlify, S3, and more.
- **PR_DESCRIPTION.md** — ready-to-paste PR body.
- **.env.example** — documented optional env vars.
- **_redirects** — SPA fallback for Netlify / Render.
- **CSS motion safety net** — keyframe fallback ensures content is never stuck at opacity:0 in throttled browsers.

### Technical
- Vite 5 with `manualChunks` for granular lazy-loading.
- TypeScript 5 strict mode.
- Zustand 4 with `persist` middleware.
- react-i18next 14 with RTL auto-detection.
- Framer Motion 11 wrapped in `MotionConfig` for reduced-motion safety.
- jsPDF + autotable, docx, pptxgenjs, html2canvas, file-saver — all dynamic imports.
- react-markdown + remark-gfm for rich content rendering.

### Security & Privacy
- No API keys in the browser bundle.
- No telemetry, no analytics, no tracking.
- Data lives entirely in `localStorage`.
- Full export & wipe controls in Settings.

### Bundle metrics
- Main chunk: **105 KB gzipped**
- All heavy export libs: dynamically imported only on use.
- 2572 modules, build time ~4s.

---

**Ready for real users, real products, real launches.**
