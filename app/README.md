# Academy Curriculum Suite

> **اختبر منتجك مع مهندس عبدالعزيز باستخدام الذكاء الاصطناعي**
>
> A complete, bilingual (AR/EN) service suite for designing curricula and launching educational products — from idea validation to the first 100 students.

## Features

### 14 Integrated Services

| Service | Purpose |
|---|---|
| **Landing** | Smart entry with 4-question diagnostic |
| **Dashboard** | Course tracking, progress, bundle export |
| **Service Catalog** | Browse all services with previews |
| **Idea Discovery** | 3 validated ideas + positioning statement |
| **Deep Research** | Market insights, competitors, trends, pain points |
| **Curriculum Builder** | Transformation-first curriculum with modules |
| **Sales Page Builder** | High-converting page architecture |
| **Launch Email Sequence** | 5-email launch campaign |
| **Pricing & Packages** | Value-based 3-tier pricing |
| **First 100 Students** | Organic growth plan with channels & milestones |
| **Review & Governance** | State machine with reason codes + comments |
| **Templates Library** | Reusable assets |
| **Output Center** | PDF/Word/HTML/JSON export with smart recommendations |
| **Analytics** | 3-level KPIs (Service/Journey/Business) |
| **Settings** | Data management, Claude config, shortcuts |

### Curriculum Builder — the star

Every requested feature implemented:

- ✅ **Undo/Redo** with history stack (up to 50 steps) + `Ctrl+Z` / `Ctrl+Shift+Z`
- ✅ **Save Draft** independent of approval — `Ctrl+S`
- ✅ **Manual module management** — add, delete, drag-reorder
- ✅ **Inline content editing** — title, summary, content, transformation, objectives
- ✅ **Comments system** — curriculum-level and module-level with reason codes
- ✅ **Export** to PDF, Word, HTML (branded, print-ready)
- ✅ **Lean Score** computed dynamically with animated progress ring
- ✅ **Live AI generation** with structured output

### Platform features

- 🌐 **Bilingual** (Arabic/English) with automatic RTL/LTR
- 🌓 **Dark/Light theme** with smooth transitions
- 📱 **Mobile responsive** with drawer navigation
- ⌘K **Command palette** for fast navigation
- 🎬 **Framer Motion animations** throughout
- 💾 **Offline-first** with localStorage persistence via Zustand
- 📦 **Bundle export** — one PDF containing all deliverables for a course
- 🔐 **Data backup/restore** with JSON export/import
- 🔄 **Smart navigation** — stages auto-advance as services complete
- 🎯 **Service Contract** — all 14 services share the same architecture

## Quick Start

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
```

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 with manualChunks code-splitting |
| Styling | Tailwind CSS 3 with custom tokens (brand, accent, mesh) |
| Animation | Framer Motion 11 |
| State | Zustand 4 with `persist` middleware |
| i18n | react-i18next (AR/EN) |
| Icons | Lucide React |
| Drag & drop | @dnd-kit |
| PDF | jsPDF + jspdf-autotable (dynamic import) |
| Word | docx (dynamic import) |
| HTML Export | Template literal with branded inline CSS |

## Architecture

```
src/
├── App.tsx                    # Root router (stage-based)
├── main.tsx                   # Entry + ErrorBoundary
├── i18n.ts                    # AR/EN + RTL auto-switch
├── store/index.ts             # Zustand store with undo/redo
├── types/index.ts             # Shared TypeScript types
├── lib/
│   ├── mockAI.ts              # Deterministic AI stubs
│   ├── claude.ts              # Real Claude API client with fallback
│   └── export.ts              # PDF / Word / HTML / Bundle exporters
├── components/
│   ├── Layout.tsx             # Shell + Sidebar + Mobile drawer + Command palette
│   ├── ErrorBoundary.tsx      # Graceful error handler
│   └── curriculum/
│       └── ModuleCard.tsx     # Sortable module with inline editing
├── pages/
│   ├── Landing.tsx            # Hero + diagnostic + service catalog
│   ├── Dashboard.tsx          # Course list + bundle export
│   ├── ServiceCatalog.tsx
│   ├── IdeaDiscovery.tsx
│   ├── DeepResearch.tsx
│   ├── CurriculumBuilder.tsx  # MAIN — all required features
│   ├── SalesPage.tsx
│   ├── EmailSequencePage.tsx
│   ├── Pricing.tsx
│   ├── Growth.tsx
│   ├── ReviewCenter.tsx
│   ├── Templates.tsx
│   ├── OutputCenter.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
└── locales/
    ├── ar.json
    └── en.json
```

### State Flow

```
user action → store action → (optional) history push → state update → localStorage persist
                                                                      ↓
                                                              React re-render
```

## Enabling Real Claude AI

The app ships with a mock AI that works fully offline. To enable real Claude:

1. **Never expose your Anthropic API key in the browser.** Deploy a server proxy:
   - Cloudflare Worker
   - Vercel Edge Function
   - AWS Lambda
   - Any backend that holds `ANTHROPIC_API_KEY`

2. Your proxy should accept:
   ```json
   {
     "model": "claude-opus-4-6",
     "system": "...",
     "prompt": "...",
     "temperature": 0.7,
     "max_tokens": 2048
   }
   ```
   and return `{ "text": "..." }` or Anthropic's native `{ "content": [{ "text": "..." }] }`.

3. Configure the app:
   ```bash
   # app/.env.local
   VITE_CLAUDE_PROXY_URL=https://your-proxy.example.com/claude
   VITE_CLAUDE_MODEL=claude-opus-4-6
   ```

4. Restart `npm run dev`. The Settings page will now show "AI is live".

The `withClaudeFallback` wrapper in `lib/claude.ts` ensures graceful degradation — if the proxy fails, it falls back to mock output, preserving the UX.

## Deployment

### Vercel
```bash
npm run build
# Vercel auto-detects Vite and serves dist/
```

### Netlify
```
Build command: npm run build
Publish directory: dist
```

### Static hosting (S3, GitHub Pages, etc.)
Deploy the contents of `dist/` to any static host. The app is a pure SPA with no server requirements.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘Z` / `Ctrl+Z` | Undo (in Curriculum Builder) |
| `⌘⇧Z` / `Ctrl+Shift+Z` | Redo |
| `⌘S` / `Ctrl+S` | Save draft |
| `ESC` | Close modal / palette |

## Data Privacy

- **100% client-side** — all data lives in `localStorage`
- **No telemetry, no analytics, no tracking**
- **Export & delete** available in Settings > Data
- **Backup** produces a single JSON file you fully own

## Spec Compliance

This implementation satisfies the master prompt requirements:

- ✅ Service-by-Service Mode (all services work standalone)
- ✅ Connected Journey Mode (optional stage inheritance)
- ✅ Universal Service Contract (same architecture across services)
- ✅ Output & Publishing Engine (PDF, Word, HTML)
- ✅ Review, Approval & Governance (state machine + reason codes)
- ✅ Templates, Assets & Reuse (library + fork)
- ✅ Inter-Service Dependency Logic (non-mandatory inheritance)
- ✅ Quality Gates (lean score, readiness thresholds)
- ✅ Multi-language bilingual rendering
- ✅ Standalone & Embeddable (no hard-coded external dependencies)

## License

MIT — use freely, attribute when possible.

---

Built with care — ready for real users, real courses, real launches.
