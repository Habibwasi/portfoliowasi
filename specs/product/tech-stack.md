# Tech stack

Last updated: 2026-10-21. Versions were checked against npm and PyPI on that date.

The redesign stays on the current app (`portfolio-website/`: Next.js, React, TypeScript, Tailwind CSS v4, deployed on Vercel Hobby), as requirement P7 allows. What changes:

- design tokens replace the shadcn neutral palette
- a typed content layer replaces data hardcoded in components
- case study routes
- motion and physics that load late
- an AI guide whose RAG index ships with the site
- tests and CI, which the project doesn't have today

Two constraints shape the choices:

- **Free tiers only.** The site runs on Vercel Hobby, Groq free tier and Upstash free tier.
- **No vendor lock-in for data.** Content and the search index live in the repo.

## At a glance

| Layer | Choice | Status |
| --- | --- | --- |
| Framework | Next.js 16 App Router (upgrade 16.1.1 → 16.4.x), React 19, React Compiler | Keep |
| Language | TypeScript, `strict` | Keep |
| Styling | Tailwind CSS v4, CSS-first `@theme` filled from the design system tokens | Keep, retheme |
| Fonts | `next/font/google`: Fraunces (variable), Instrument Sans (variable), IBM Plex Mono (400, 500) | Replace Geist |
| Motion | `motion` 14 (`motion/react`) through `LazyMotion`, replacing `framer-motion` | Migrate |
| Hero physics | `matter-js` 0.20, lazy-loaded after launch | Add later |
| Content | Typed TypeScript modules in `src/content/` (prose as Markdown strings) | Add |
| Contact email | Resend (`resend` 6.x), already used by `/api/contact` | Keep, harden |
| Booking | Calendly link | Add |
| AI guide model | Vercel AI SDK v7 (`ai`, `@ai-sdk/react`, `@ai-sdk/groq`), `openai/gpt-oss-120b` on Groq | Add |
| Retrieval | Build-time JSON index (chunks + embeddings) + in-memory hybrid search (keyword + cosine) | Add |
| Embeddings | `@huggingface/transformers` running `gte-small` locally: at build time for chunks, in the function for queries | Add |
| Rate limiting | `@upstash/ratelimit` 2.x + Upstash Redis (contact form and guide) | Add |
| Guide character | Inline SVG + CSS, Motion for the state animations | Add |
| Testing | Vitest + Testing Library, Playwright + axe, Lighthouse CI, a TypeScript eval script for the guide | Add |
| CI/CD | GitHub Actions, then Vercel preview and production deploys | Add |
| Analytics | `@vercel/analytics` page views (Hobby). Custom events are an open decision: Umami or Plausible. | Keep |

## Removed from the current app

| What | Why |
| --- | --- |
| `next-themes`, `theme-toggle.tsx`, the `.dark` palette | One light "Paper" theme only. |
| `nodemailer`, `@types/nodemailer` | Nothing imports them; the contact route already uses Resend. |
| shadcn neutral palette and the blue/purple/pink gradients | Replaced by design system tokens. |
| Geist fonts | Replaced by Fraunces, Instrument Sans and IBM Plex Mono. |
| Content hardcoded inside components | Moved to `src/content/` so the guide indexes the same text the page shows. |
| Supabase, pgvector, RAGAS (from earlier drafts) | Replaced by a JSON index in the repo and a TypeScript eval script. No database to keep alive, and no Python toolchain. |

The shadcn primitives in `src/components/ui/` can stay as unstyled building blocks (Radix Slot, `cva`), restyled to the `hw-` component rules.

## How each part fits

### Design system → Tailwind v4

- Every token in the design system's `tokens.json` becomes a CSS variable under `@theme` in `globals.css`, and Tailwind generates the matching utilities (`bg-paper`, `text-ink`, `shadow-lift`).
  - Colours: `paper`, `paper-raised`, `paper-sunk`, `ink`, `ink-muted`, `line`, `line-strong`, `signal`, `signal-ink`, `on-signal`, `cobalt`, `marker`, `marker-ink`.
  - Spacing `space-1` to `space-7`; radius `radius-sm`, `radius-md`, `radius-pill`; shadows `shadow-letter`, `shadow-lift`.
- Type styles (`display-xl`, `display-l`, `heading`, `title`, `body`, `small`, `label`) become utilities, with the phone sizes below 640 px.
- Each design system component becomes one React component in `src/components/`, matching its README's markup and accessibility rules. Where a README is out of date, the decisions log in the roadmap wins.
- Contrast pairs follow the token notes. For example, `signal` is never used for small text; `signal-ink` is.

### Fonts

- `next/font/google` self-hosts the fonts with no layout shift. Load the `latin` subset only.
- Fraunces is the LCP font, so only it is preloaded. Instrument Sans and Plex Mono use `preload: false`.
- Load only the axes in use: `wght` for Fraunces by default, adding `opsz` only if the hero uses optical size.
- Plex Mono isn't variable, so it loads weights 400 and 500.
- Each font is exposed as a CSS variable (`--font-display`, `--font-sans`, `--font-mono`) for `@theme`.

### Routes and content

```
src/app/
  page.tsx                    Home: hero → featured work → AI workflow → proof → stack → contact
  work/[slug]/page.tsx        Case study template (generateStaticParams + generateMetadata)
  work/[slug]/opengraph-image.tsx
  about/page.tsx              Journey line, photos, full QA record
  api/contact/route.ts        Contact form → Resend
  api/guide/route.ts          AI guide chat (streaming)
  sitemap.ts, robots.ts
src/content/
  projects.ts                 Typed index: slug, title, eyebrow, status, metrics, tags, links
  case-studies/<slug>.ts      One typed object per case study, section by section
  site.ts                     Intro, availability, testimonial, QA record, journey, links
  anchors.ts                  Stable section IDs (#work, #ai, #proof, #stack, #contact) for links and guide tools
public/cv/Habib-Ahmed-Wasi-CV.pdf
public/fonts/Fraunces-*.ttf   Static TTF files for OG images
scripts/build-rag-index.ts    Writes src/generated/rag-index.json at build time
evals/guide/                  Evaluation questions and the eval script
```

- **Case study URLs:** `/work/topictrail`, `/work/ridly`, `/work/validation-portal`. They are statically generated, each with its own title, description and OG image (P5, P6). In Next 15+ the route `params` is a Promise and must be awaited.
- **Typed TypeScript instead of MDX.** Every case study follows the same fixed section order, so it is structured data. A type such as `CaseStudy { problem, role, aiInTheBuild, solution, media, architecture, testEvidence, impact, stack, links }` lets the compiler catch a missing section. It also lets the RAG indexer read clean text. MDX can come later if a page needs components in the middle of prose.
- **Placeholders:** a `Placeholder` component renders a labelled slot (e.g. "[Ridly screens]") in the design system style. Content fields accept a placeholder value, so missing content shows up on the page and in a test report.
- **OG images:** `next/og` (Satori) can't read WOFF2, so commit static Fraunces TTF files for `opengraph-image.tsx`.

### Media

- Demo and test-run videos are hosted on YouTube in privacy-enhanced mode, shown behind a lightweight facade with a poster. The YouTube player only loads on click.
- Vercel Hobby bandwidth isn't spent on video. Captions are on (C11).
- Screens and diagrams are images in the repo, served through `next/image`.

### Motion and the hero

- **Migration:** replace `framer-motion` with `motion`, import from `motion/react`, and wrap the app in `LazyMotion` with the `m` component so only the needed features load. There are no breaking changes for React between v12 and v14.
- **First paint:** the name is server-rendered and visible on first paint. The staggered reveal and the text scramble animate only `transform` and clip, never from `opacity: 0`, and start after `load`. This keeps the `h1` as an early LCP candidate (P1). A Playwright test checks that the name is visible before any script runs.
- **Physics (after launch):** Matter.js 0.20.0 (MIT) is imported with `await import('matter-js')` on `requestIdleCallback`, only after the scramble finishes. It never loads under `prefers-reduced-motion`. An IntersectionObserver pauses the runner when the hero is offscreen. Letter tiles are DOM elements positioned from the physics bodies; the `h1` keeps `aria-label` and the tiles are `aria-hidden`. The last npm release is from June 2024; `planck` 1.5 is the fallback.
- **Skills orbit (after launch):** CSS transforms driven by `--a` and `--r` variables. It stops under reduced motion and becomes a tag row on phones. Until then, skills show as a tag row linked to the projects that use them.
- **Not used:** GSAP and CSS scroll-driven animations. Motion covers the effects, and `animation-timeline` doesn't ship in stable Firefox yet.

### Contact, CV, email and booking

- **Form:** keep `/api/contact` on Resend, sending to Habib's personal Gmail. Fixes:
  - Zod validation (format and length).
  - Escape the HTML body; today this is an injection risk.
  - Check `{ error }` from `resend.emails.send`; failures can return 200 today.
  - `replyTo` set to the sender.
  - A honeypot field and an Upstash rate limit.
  - Pending, success and error states in the form.
- **Sender:** while the sender is `onboarding@resend.dev`, Resend only delivers to the account owner's address. That's fine, because the form mails Habib.
- **Email me:** a `mailto:` link.
- **CV:** a static PDF in `public/cv/`, linked with `download`.
- **Book a call:** a plain link to Calendly in a new tab, with zero JavaScript on the critical path.

### AI guide

The guide is a vermilion "H" with eyes (GD1–GD9).

```
build:   src/content + CV text ─▶ chunk (by section, ~300 tokens) ─▶ gte-small embeddings
         ─▶ src/generated/rag-index.json   (deploys atomically with the content)

request: visitor ─ useChat ─▶ /api/guide (Vercel function)
           1. rate limit: per IP + a global daily cap (Upstash)
           2. trim history and input length
           3. embed the question (gte-small, same model as the index)
           4. hybrid search in memory: keyword (BM25) + cosine; top-k chunks with metadata
           5. streamText(groq('openai/gpt-oss-120b'), context + page tool schemas)
         ◀─ streamed answer, source links from chunk metadata, tool calls
browser: onToolCall → scroll_to / open_case_study / highlight / play_demo / start_tour / download_cv
         → the guide hops to the target and points
```

**Why this is still real RAG.** Chunking, embeddings, hybrid retrieval, citations, refusal when nothing matches, and evaluation are all there. Only the database is missing, and about 30 chunks don't need one. The keyword plus semantic search mirrors TopicTrail. The guide's own case study notes or "How this guide works" panel can name pgvector as the upgrade path at scale.

**Embeddings without a vendor.** `gte-small` runs through `@huggingface/transformers`: at build time for the chunks, and inside the function for each query. No API key, no extra service. The tradeoff is a cold start while the quantized model (about 30 MB) loads. If that proves too slow, a hosted embedding API is the fallback, and the index format stays the same.

**Model and limits**
- `openai/gpt-oss-120b` is a production model on Groq with tool use. `llama-3.3-70b-versatile` was shut down for free and developer tiers on 2026-08-16 ([Groq deprecations](https://console.groq.com/docs/deprecations)).
- The model ID lives in one config value.
- Groq's free tier for this model is about 30 requests a minute, 1,000 a day, and 8K tokens a minute. One RAG turn is about 3–4K tokens, so the site handles roughly two turns a minute.
- Hence a global daily cap, short answers (`maxOutputTokens`), trimmed history, and a clear "busy" state that falls back to quick jumps.

**Page tools**
- Defined on the server without `execute`. The browser runs them in `useChat({ onToolCall })` and returns results with `addToolOutput`, without awaiting it, which can deadlock. Then `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` continues the chat.
- Tool arguments are validated with `z.enum` over the known anchors and slugs.
- `download_cv` asks the visitor first.

**Prompt-injection hardening**
- Answers come only from retrieved chunks.
- Source links come from chunk metadata, never from URLs the model writes.
- Model output is rendered as Markdown with raw HTML disabled.
- Client-sent `system` and `tool` roles are ignored.
- The client IP comes from `ipAddress()` in `@vercel/functions`.

**Loading**
- Every page ships only the collapsed SVG tile with CSS idle animation.
- The panel, `@ai-sdk/react` and the Motion state animations load with `dynamic()` on first hover, focus or click.
- Quick jumps and the 30-second tour work without the model.

**Evaluation**
- A TypeScript script in `evals/guide/` runs about 20 recruiter questions through the real route.
- It asserts that each answer cites a source, that out-of-scope questions get "I don't know", and that the expected tool is called. A few answers get an LLM-judged faithfulness check.
- It runs manually or nightly, with a separate Groq key, so it doesn't use up the production quota. This replaces RAGAS (GD9; see the decisions log).

### Security

- **CSP:** a static Content Security Policy header in `next.config.ts`:
  - `frame-src` for YouTube's privacy-enhanced domain
  - `connect-src` for analytics
  - `default-src 'self'`

  A nonce-based CSP is avoided because in Next.js it forces every page into dynamic rendering.
- **Secrets:** API keys stay server-side.
- **Rate limits:** on both POST routes.

### Testing and CI

| Level | Tool | What it covers |
| --- | --- | --- |
| Unit and component | Vitest 5 + Testing Library 16 + jsdom | Content types and placeholders, contact validation, RAG chunking and search, guide state machine, client components. Vitest can't render async Server Components; those are covered by e2e. |
| End to end | Playwright 1.64 | Home → case study, Home → CV / email / Calendly, the contact form, name visible on first paint, reduced motion (`reducedMotion: 'reduce'`), phone viewport |
| Accessibility | `@axe-core/playwright` 4.14 | Every route, including with the guide panel open |
| Performance | Lighthouse CI 0.15 against the Vercel preview | LCP < 2.5 s, CLS < 0.1, JavaScript budget for the first view. In place from Phase 0, so later effects can't regress it unnoticed. |
| Guide quality | `evals/guide` (TypeScript) | Citations, refusals, tool calls, faithfulness |

GitHub Actions runs lint, typecheck, Vitest and build on every push and PR, then Playwright, axe and Lighthouse CI against the Vercel preview URL. Main deploys to production on Vercel. The workflow badge and repo link in the site footer are the public proof of "test-driven".

## Environment variables

| Name | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `/api/contact` | Exists today, undocumented |
| `GROQ_API_KEY` | `/api/guide` | Server only |
| `GROQ_EVAL_API_KEY` | `evals/guide` | Separate quota from production |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Rate limiting | Via the Vercel Marketplace integration |
| `NEXT_PUBLIC_CALENDLY_URL` | Book a call | Public |
| `NEXT_PUBLIC_SITE_URL` | `metadataBase`, sitemap, OG | Public |

All of them go in `.env.example`.

## Accounts needed

- Vercel Hobby (exists)
- Resend (exists)
- Groq (free)
- Upstash (free, via Vercel)
- Calendly
- YouTube (for video hosting)

## Risks and fallbacks

| Risk | Fallback |
| --- | --- |
| Effects hurt the first view | Name is visible on first paint; effects are lazy, optional and budget-checked in CI. |
| Embedding cold start in the function is slow | Hosted embedding API with the same index format; or keyword-only retrieval for the first answer. |
| Groq quota runs out | Global daily cap, "busy" state, quick jumps keep working. |
| Groq retires the model | Change the one model ID (e.g. `qwen/qwen3.6-27b`). |
| Matter.js stays unreleased | `planck` 1.5 |
| Upstash is a hosted dependency | It only holds rate-limit counters. Losing it fails open for the form and closed for the guide; it's swappable for any Redis. |
