# اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز

> Test Your Product or Idea from Day One with Engineer Abdulaziz
>
> AI-powered service suite to validate ideas, design curricula, and launch educational products — following best practices, from zero to the first 100 students.

[![Status](https://img.shields.io/badge/status-launch--ready-brightgreen)]() [![Bundle](https://img.shields.io/badge/main--chunk-105KB%20gzip-blue)]() [![Build](https://img.shields.io/badge/build-passing-success)]() [![Languages](https://img.shields.io/badge/AR%20%2B%20EN-RTL%20%2F%20LTR-purple)]()

---

## ✨ What This Is

A complete, production-grade web application that turns a raw idea into a launch-ready product. It guides founders, trainers, and academies through **16 integrated services** — from market research to curriculum design to first-100-students growth — with professional exports at every step.

**Fully standalone.** No backend, no database, no API keys required.

---

## 🚀 Quick Start

```bash
cd app
npm install
npm run dev      # http://localhost:5173
```

For production:

```bash
npm run build    # outputs to app/dist
npm run preview  # preview the production build
```

## ☁️ One-Click Deploy

Push this repo to GitHub / GitLab, then:

1. Go to [Render.com](https://render.com) → **New** → **Blueprint**
2. Connect the repo
3. Render reads `render.yaml` and sets everything up automatically
4. ~3 minutes later your app is live

See **[DEPLOY.md](./DEPLOY.md)** for Vercel / Netlify / custom domains.

---

## 🗂️ Services

| Stage | Service | Deliverable |
|---|---|---|
| 1 | Idea Discovery | 3 validated ideas + positioning statement |
| 2 | Deep Research | Market size, SWOT, personas, pricing bands, core analysis |
| 3 | Curriculum Builder ⭐ | Transformation-first curriculum with modules, objectives, exports |
| 4 | Sales Page | Headline, problem framing, offer, objection handling |
| 5 | Launch Emails | 5-email sequence with timing and job-per-email |
| 6 | Pricing & Packages | 3-tier value-based pricing |
| 7 | First 100 Students | Channels, waitlist, early bird, weekly milestones |
| 👑 | **Final Venture Blueprint** | Consolidated view + full-bundle PDF export |

Plus shared services: **Review & Governance**, **Templates Library**, **Output Center**, **Analytics**, **Settings**.

---

## 🎯 Highlights

- 🌐 **Bilingual** (Arabic + English, RTL / LTR auto)
- 🌓 **Dark / Light theme**
- 📱 **Mobile responsive** with drawer navigation
- ⌘K **Command palette**
- 💾 **Offline-first** — data stays on your device
- 📦 **Export anything** — PDF, Word, HTML, PowerPoint, JSON
- 🔗 **Share snapshots** via unique URLs
- ♻️ **Undo / Redo** in the curriculum builder
- 🎬 **Smooth animations** with CSS safety fallbacks
- 🔐 **Zero tracking, zero telemetry**

---

## 🧱 Stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · Framer Motion 11 · Zustand 4 · react-i18next · @dnd-kit · jsPDF · docx · pptxgenjs

---

## 🔑 Optional: Enable Real AI

The app runs fully offline with a deterministic mock AI. To enable real Claude / Gemini / OpenAI:

1. Deploy a tiny proxy that holds your API key (sample Cloudflare Worker in [DEPLOY.md](./DEPLOY.md)).
2. Set `VITE_CLAUDE_PROXY_URL` in your env.
3. Restart the app → Settings shows "AI is live".

The `withClaudeFallback` wrapper automatically drops to mock if the proxy fails — users never see a broken service.

---

## 📚 Docs

- **[DEPLOY.md](./DEPLOY.md)** — full deployment guide (Render, Vercel, Netlify, custom)
- **[PR_DESCRIPTION.md](./PR_DESCRIPTION.md)** — ready-to-paste PR body
- **[CHANGELOG.md](./CHANGELOG.md)** — release notes

---

## 📁 Structure

```
./
├── render.yaml               # Render Blueprint (one-click deploy)
├── DEPLOY.md                 # Deployment guide
├── PR_DESCRIPTION.md         # PR body
├── CHANGELOG.md              # Release notes
├── README.md                 # You are here
└── app/                      # The Vite application
    ├── .env.example          # Optional AI proxy vars
    ├── .node-version         # Pins Node 20
    ├── public/
    │   └── _redirects        # SPA fallback for Netlify/Render
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── i18n.ts
    │   ├── index.css
    │   ├── store/            # Zustand store with persist + history
    │   ├── types/
    │   ├── lib/              # Claude, mockAI, export, genericExport, share
    │   ├── components/       # Layout, ErrorBoundary, ExportMenu, ShareButton,
    │   │                       NextSteps, DetailedProgress, Markdown, ServiceActionsBar,
    │   │                       curriculum/ModuleCard
    │   ├── pages/            # 16 services
    │   └── locales/          # ar.json, en.json
    └── package.json
```

---

## 🤝 Contributing

This is a solo-built reference implementation. Issues and discussions welcome.

---

## 📄 License

MIT — use freely, attribution appreciated.

---

**Built with care — ready for real users, real products, real launches.**
