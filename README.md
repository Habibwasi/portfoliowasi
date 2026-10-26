# Habib Ahmed Wasi — Portfolio

[![CI](https://github.com/Habibwasi/portfoliowasi/actions/workflows/ci.yml/badge.svg)](https://github.com/Habibwasi/portfoliowasi/actions/workflows/ci.yml)

The portfolio of Habib Ahmed Wasi, a software engineer graduating from SDU in January 2027. The site should prove within 10 seconds that I can build and ship software, and let a tech lead check that in depth: one case study per project, with real architecture, demos, tests and numbers.

The site is being rebuilt in phases, spec-first and test-first. The live version is at [portfolio-habib-wasi.vercel.app](https://portfolio-habib-wasi.vercel.app/).

## Status

| Phase | What | Status |
| --- | --- | --- |
| 0 | Foundation: design tokens, content layer, base components, tests, CI | Done |
| 1 | Launch: new Home, case study template, TopicTrail and Validation Portal case studies, working contact | Done |
| 2 | Ridly case study, per-page social previews, click-to-load video player | Done |
| 3 | AI guide: corner tile, panel with jumps and a 30-second tour, RAG chat with sources, nightly evaluation, "How this guide works" page | Done; the guide answers on production since 2026-10-26 (roadmap 7.8) |
| 4–6 | AI story and About page, delight, polish | Planned |
| 7 | Content handover: CV, Calendly, screens, videos, testimonial, photos | Last |

Full plan in [specs/product/roadmap.md](specs/product/roadmap.md). What changed and why: [CHANGELOG.md](CHANGELOG.md).

## Docs

| Doc | What it holds |
| --- | --- |
| [specs/product/mission.md](specs/product/mission.md) | The core idea, audiences, positioning, principles, success measures |
| [specs/product/tech-stack.md](specs/product/tech-stack.md) | How each part of the stack fits, with versions and tradeoffs |
| [specs/product/roadmap.md](specs/product/roadmap.md) | Phases, decisions log, open decisions, content still to supply |
| [specs/features/](specs/features/) | One spec per feature or phase, written before the code |
| [Portfolio Redesign — Requirements.md](Portfolio%20Redesign%20—%20Requirements.md) | Original requirements (G, A, S, C, V, AI, GD, P IDs) |
| [Design system](https://claude.ai/artifact/P1shpLvwDNZziVVL3V3v4Y) | Tokens, components, voice (private artifact) |

## Stack

- **Framework:** Next.js 16 (App Router), React 19 with the React Compiler, TypeScript (strict)
- **Styling:** Tailwind CSS v4, with design system tokens in `@theme` and `hw-` component classes
- **Fonts:** Fraunces, Instrument Sans and IBM Plex Mono via `next/font`
- **Motion:** Motion (`motion/react`) through `LazyMotion`
- **Email:** Resend, for the contact form
- **Tests:** Vitest + Testing Library, Playwright + axe, Lighthouse CI
- **Hosting:** Vercel, with Vercel Analytics and Umami Cloud for events
- **AI guide:** Vercel AI SDK v7 with GPT-OSS 120B on Groq; a build-time RAG index (gte-small embeddings via Transformers.js) committed as JSON, hybrid BM25 + cosine search; Upstash rate limits

## Getting started

The app lives in `portfolio-website/`. You need Node.js 22 or later.

```bash
cd portfolio-website
npm install
cp .env.example .env.local   # fill in what you need; the site runs without any
npm run dev                  # http://localhost:3000
```

Environment variables (all listed in `.env.example`):

| Variable | Needed for |
| --- | --- |
| `RESEND_API_KEY` | Sending the contact form |
| `GROQ_API_KEY`, `GROQ_EVAL_API_KEY` | AI guide and its evaluation (Phase 3) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Rate limiting (Phase 1 onwards) |
| `NEXT_PUBLIC_CALENDLY_URL` | "Book a call" |
| `NEXT_PUBLIC_SITE_URL` | Metadata, sitemap and social previews; the only host Umami counts |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami Cloud events (Production only); without it the script never loads |
| `VERCEL_SUPPORT_LARGE_FUNCTION=1` | Vercel only: lets the `/api/guide` function past the size check (not needed locally) |

## Scripts

Run these from `portfolio-website/`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright end-to-end and axe accessibility tests on desktop and phone, against a production build (run `npm run build` first; `npx playwright install chromium` once) |
| `npm run lhci` | Lighthouse on a phone profile against the production build |
| `npm run guide:index` | Rebuilds the AI guide's index (`src/generated/guide-index.json`) after a content change; a unit test fails until you do |
| `npm run eval:guide` | The guide's evaluation: retrieval always, answers through the real route when `GROQ_EVAL_API_KEY` is set |

CI (`.github/workflows/ci.yml`) runs on pull requests and pushes to `main` that change `portfolio-website/` or the workflow itself. Changes to the specs, this README or `video/` skip it.
1. Lint, typecheck, unit tests and build, once.
2. Then, in parallel, against that build: the Playwright suite, and Lighthouse with one job per page (each page in `lighthouserc.json` needs a matching entry in the workflow's matrix; the job fails otherwise).

`.github/workflows/guide-eval.yml` runs the guide's evaluation nightly and on demand (from `main`), retrieval and answers. A push to `main` that touches the content or the guide runs retrieval only, to save the evaluation's daily Groq quota.

## Project structure

```
portfoliowasi/
├── .github/workflows/           CI pipeline, nightly guide evaluation
├── specs/
│   ├── product/                 mission, tech stack, roadmap
│   └── features/                one spec per feature or phase
├── CHANGELOG.md                 what changed per phase, and why
└── portfolio-website/
    ├── design-system/tokens.json   snapshot of the design system tokens (tested against globals.css)
    ├── e2e/                        Playwright specs
    ├── src/
    │   ├── app/                    routes, layout, globals.css (tokens), API routes
    │   ├── components/
    │   │   ├── hw/                 design system components (Button, Tag, Metric, MediaFrame, ProjectCard, Testimonial, Placeholder)
    │   │   ├── site-header.tsx     header, text nav, skip link
    │   │   └── site-footer.tsx     footer with source link and CI badge
    │   ├── content/                all site text and project data, typed; placeholders for missing content
    │   └── styles/components.css   hw- component styles
    ├── lighthouserc.json           performance budget
    └── playwright.config.ts, vitest.config.mts
```

## How work is done

1. **Roadmap first.** Every feature is an item in [roadmap.md](specs/product/roadmap.md), with requirement IDs.
2. **Spec before code.** Each feature or phase gets a spec in `specs/features/` with acceptance criteria.
3. **Tests from the spec.** The acceptance criteria become unit, component and e2e tests.
4. **Build until CI is green**: lint, types, tests, accessibility and the performance budget.
5. **Log the decisions** in `CHANGELOG.md`, and record product decisions in the roadmap's decisions log.

**Content rules:**
- Site text lives in `src/content/`, never in components.
- Anything not supplied yet is a `placeholder("…")`, which shows on the page as a labelled "[…]" slot.
- Nothing is invented to fill a gap.

## Contact

Habib Ahmed Wasi · Kolding, Denmark
- Email: habibwasi9@gmail.com
- LinkedIn: [linkedin.com/in/habib-ahmed-wasi-4985091b8](https://linkedin.com/in/habib-ahmed-wasi-4985091b8)
- GitHub: [github.com/Habibwasi](https://github.com/Habibwasi)
