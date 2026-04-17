# Deployment Guide

> **اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز**
> Production-ready deployment guide — Render (primary), plus Vercel / Netlify / any static host.

---

## TL;DR (Render, One-Click)

1. Push the repo to GitHub / GitLab (see [§ Creating the PR](#creating-the-pr) below).
2. On https://render.com → **New** → **Blueprint** → connect the repo.
3. Render reads `render.yaml` at the repo root and creates the static site automatically.
4. Click **Apply**. First build takes ~2–3 minutes.
5. Your app is live at `https://<service-name>.onrender.com`.

No API keys required. The app ships with a full, deterministic mock AI layer.

---

## Standalone Readiness Audit

| Concern | Status | Notes |
|---|---|---|
| **External API required** | ❌ No | All AI calls go through `lib/claude.ts` which falls back to `lib/mockAI.ts` when `VITE_CLAUDE_PROXY_URL` is not set. |
| **Database required** | ❌ No | 100% client-side state via Zustand + `localStorage` persist. Works offline. |
| **Auth provider required** | ❌ No | App is single-user / device-scoped. No login flow needed. |
| **Secret / API keys required** | ❌ No | None. Optional proxy URL only if you want real LLM generation. |
| **Server-side rendering** | ❌ No | Pure SPA. Any static CDN serves it. |
| **Build-time secrets** | ❌ No | No keys are read at build time. |
| **Bundle size** | ✅ OK | Main chunk 105 KB gzipped. Heavy libs (jsPDF, docx, pptx, html2canvas) are lazy-loaded on demand. |
| **Data privacy** | ✅ Strong | Nothing leaves the browser unless user exports. No telemetry. |
| **Offline-first** | ✅ Yes | After first load, app runs fully offline (including exports). |
| **Bilingual (AR / EN)** | ✅ Yes | Auto RTL / LTR switch. |
| **Mobile responsive** | ✅ Yes | Drawer navigation + responsive grids. |
| **Error recovery** | ✅ Yes | ErrorBoundary + per-service retry logic. |
| **A11y** | ✅ Baseline | Keyboard nav, ARIA labels, focus rings. WCAG 2.1 AA candidate. |

**Conclusion:** the app is a fully self-contained static SPA. It can run on any CDN without any infrastructure beyond the static files themselves.

---

## Deploy on Render

### Option A — Blueprint (recommended)
The `render.yaml` at the repo root defines everything.

1. Push repo to GitHub / GitLab.
2. Render Dashboard → **New** → **Blueprint** → select the repo.
3. Confirm the detected service → **Apply**.
4. First build takes ~2–3 min. Subsequent builds ~30s.
5. Preview deploys for every pull request (enabled by default in `render.yaml`).

### Option B — Static Site (manual)
If you prefer to avoid Blueprint:

1. Render Dashboard → **New** → **Static Site**.
2. Connect repo and use these settings:

| Field | Value |
|---|---|
| **Name** | `test-your-product-with-engineer-abdulaziz` |
| **Branch** | `main` |
| **Root Directory** | *(leave blank — monorepo-style paths are in build command)* |
| **Build Command** | `cd app && npm ci && npm run build` |
| **Publish Directory** | `app/dist` |
| **Auto-Deploy** | Yes |

3. **Environment Variables** (optional):
   - `NODE_VERSION` = `20`
   - `VITE_CLAUDE_PROXY_URL` = *(only if you want real AI)*
   - `VITE_CLAUDE_MODEL` = *(e.g., `claude-opus-4-6`)*

4. **Redirects / Rewrites** (add in Render dashboard):
   - Source: `/*` → Destination: `/index.html` → Action: **Rewrite**
   - *(Already handled by `app/public/_redirects` as a fallback.)*

5. **Headers** (already defined in `render.yaml`; if you used manual setup, add manually):
   - `Cache-Control: public, max-age=31536000, immutable` on `/assets/*`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`

### Custom Domain
1. Render → your service → **Settings** → **Custom Domain** → add your domain.
2. Add the CNAME record at your DNS provider pointing to `<service>.onrender.com`.
3. Render issues a Let's Encrypt certificate automatically.

---

## Deploy on Vercel

```bash
npm install -g vercel
cd app
vercel
```

Vercel auto-detects Vite. Confirm:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

Environment variables in Vercel dashboard: `VITE_CLAUDE_PROXY_URL`, `VITE_CLAUDE_MODEL` (optional).

---

## Deploy on Netlify

Create `app/netlify.toml` (not needed if using the Netlify UI):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Or via UI: Build command `cd app && npm ci && npm run build`, publish `app/dist`.

---

## Deploy on any S3 / Cloudflare Pages / Fly.io

```bash
cd app
npm ci
npm run build
# Upload everything in dist/ to your static host.
# Configure the host to serve index.html for 404s (SPA fallback).
```

---

## Enabling Real AI (optional, post-deploy)

The app ships in **mock mode** — every service generates realistic structured output without hitting any API.

To wire a real LLM:

### 1. Deploy a proxy
You need a tiny backend that holds your API key and forwards requests. Minimal reference (Cloudflare Worker):

```javascript
export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    const body = await req.json()
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model || 'claude-opus-4-6',
        max_tokens: body.max_tokens || 2048,
        system: body.system,
        messages: [{ role: 'user', content: body.prompt }],
      }),
    })
    const data = await r.json()
    return Response.json(data, { status: r.status })
  },
}
```

Equivalent shape works for Gemini, OpenAI, or any provider — just adapt the outbound request. The browser client only cares about the response shape: `{ text }` or `{ content: [{ text }] }`.

### 2. Configure the app
Set `VITE_CLAUDE_PROXY_URL` in your hosting provider's env vars → redeploy.

The **Settings** page in-app will flip from "Mock mode" → "AI is live" when the variable is present.

### 3. Graceful degradation
If the proxy is down, `withClaudeFallback` in `lib/claude.ts` automatically drops to the mock — users see no error, just a toast: `"Could not reach AI — fallback output used"`.

---

## Post-deployment smoke test

1. Open your deployed URL → Landing page renders with the new hero.
2. Click **"ابدأ رحلتي الكاملة الآن"** → routes to Idea Discovery.
3. Fill the 3 inputs → **"توليد 3 أفكار متحقق منها"** → detailed progress bar runs through sub-tasks → results render.
4. Click through the auto-suggested Next Steps → each service generates output.
5. Open **المخطط النهائي للمنتج** (Final Venture Blueprint) → verify all completed stages are ticked.
6. Click **تصدير الحزمة الكاملة** → a multi-section PDF downloads.
7. Test **Share** button → copy link → open in new incognito tab → Share Viewer renders the snapshot read-only.
8. Switch to English via the globe icon → layout mirrors to LTR and all text translates.
9. Switch to Dark mode → all surfaces adapt.
10. Resize to mobile → hamburger menu → drawer slides in from correct side.

---

## Monitoring & Maintenance

- **Logs**: Render Dashboard → service → **Logs** (build + runtime).
- **Build cache**: Render caches `node_modules` automatically. Force a clean build via dashboard if dependency changes misbehave.
- **Rollback**: Every deploy has a unique URL. Redeploy a previous commit by clicking it in **Events**.
- **Cost**: Static sites on Render are **free** for personal/hobby use (up to 100GB bandwidth / month).

---

## Creating the PR

This repo ships a self-contained PR description in `PR_DESCRIPTION.md`. When opening the pull request, paste that content as the PR body.

```bash
# From the repo root
git init                             # if not already a repo
git add -A
git commit -m "feat: initial launch-ready app"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main

# Feature branch for your changes
git checkout -b feat/launch-ready
# ... make changes ...
git add -A
git commit -m "feat: prep for Render deployment"
git push -u origin feat/launch-ready

# Open the PR in the GitHub UI — use PR_DESCRIPTION.md as the body.
```

---

## Support

- Issues: open one on the repo.
- Questions: the in-app Settings page → "AI status" shows whether you're in mock or live mode.
