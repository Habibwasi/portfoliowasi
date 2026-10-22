# Changelog

Each entry lists what changed, the key decisions and why, and what's left open. Decisions marked **Revisit?** are the ones you may want to change.

## Phase 3: AI guide (2026-10-22, closed the same day)

Spec: [specs/features/phase-3-guide.md](specs/features/phase-3-guide.md) · Roadmap items 3.1–3.5 · Branch `phase-3-guide`, merged into `redesign`

**Status: done.** Every check passes in CI on `redesign` (commit `9b3a6e2`). The guide works end to end except for live answers, which need a `GROQ_API_KEY` (roadmap 7.8). Until then the chat shows its "busy" state, and the jumps and the tour work as normal.

The vermilion "H" now sits bottom-right on every page. Opened, it docks a 400 px panel on desktop and reflows the page, or slides up as a sheet on phones. It has a "Jump to" row, a 30-second tour of Home, and a chat that answers from the site's own text with source links. `/guide` explains how it works.

### Verification

| Check | Result |
| --- | --- |
| Lint, typecheck | Pass |
| Unit and component tests | 197 passed (was 144). The route is tested with the AI SDK's mock model |
| E2E + axe, desktop and phone | 70 passed (was 50). Zero axe violations with the panel open and on `/guide`. The chat is tested with `/api/guide` mocked at the network level |
| Retrieval evaluation (`npm run eval:guide`, real gte-small embeddings) | 22 of 22: the expected source is in the top 4 for all 16 recruiter questions, and both clearly off-topic questions retrieve nothing. The 22 answer checks are skipped without `GROQ_EVAL_API_KEY` |
| Production build | Pass. `/guide` and its OG image are static. The `/api/guide` function traces to 58 MB, with only the Linux x64 ONNX runtime |
| Lighthouse, phone (local) | All four pages within budget: `/` LCP 2.33 s, CLS 0.017; `/work/ridly` 2.23 s; `/work/validation-portal` 2.27 s; `/guide` 1.97 s |
| CI on GitHub (`redesign`, commit `9b3a6e2`) | All three jobs pass: check, E2E + axe, Lighthouse (phone) |
| Live answers from Groq | **Not checked.** There is no Groq key yet |

### What changed

- **Tile (3.1):** `src/components/guide/guide-launcher.tsx` draws the design system's "H" with CSS idle and blink, which stop under reduced motion. The panel is a separate chunk, preloaded on hover or focus and loaded on click. Before that, no panel markup is on the page.
- **Panel (3.2):** `guide-panel.tsx` is a non-modal dialog labelled "AI assistant". Escape closes it and focus goes back to the tile. The conversation is a `role="log"`.
  - *Jump to:* the tour (the only primary button), Best project (Ridly), AI workflow (Ridly's "AI in the build" until 4.1), Proof, Contact. These are real links; on a phone the sheet closes after a jump.
  - *Tour:* 5 stops, 6 s each, with Pause, Previous, Next and Stop. Each stop is outlined in cobalt. On a phone the sheet shrinks to the tour card during the tour.
  - *Tour offer:* on Home, after the first scroll, shown once per browser.
  - *Page IDs:* the hero got `#intro` and the Ridly card `#work-ridly`. Case study section IDs now come from one helper in `anchors.ts`.
- **RAG chat (3.3):**
  - *Chunks:* `src/lib/guide/chunks.ts` turns `src/content` into 25 chunks (case study sections, projects, intro, QA record, contact, `/guide`). Placeholders are never indexed.
  - *Index:* `npm run guide:index` embeds the chunks with gte-small and writes the committed `src/generated/guide-index.json` (94 KB).
  - *Search:* `search.ts` combines BM25 and cosine with reciprocal rank fusion and returns the top 4.
  - *Route:* `POST /api/guide` validates the request with Zod (user and assistant text only, questions up to 500 characters). It rate-limits each visitor to 10 questions per 10 minutes and the site to 300 a day, failing closed. It then embeds the question (falling back to keyword search after 4 s) and streams GPT-OSS 120B with low reasoning effort. Source links go out as message metadata. With no match it answers "I don't know" without calling the model; Groq errors show "busy".
  - *Rendering:* answers go through a small renderer (paragraphs, lists, bold, `[n]` links) that never parses HTML.
- **Evaluation (3.4):** `evals/guide/` holds 22 cases, the runner and an LLM faithfulness judge on 5 answers. `.github/workflows/guide-eval.yml` runs it nightly and on demand, but GitHub only does that from the default branch (`main`, after Phase 7). Until then it also runs on pushes to `redesign` that touch the content or the guide.
- **How this guide works (3.5):** `/guide`, with the build and request pipelines as numbered steps, the model, the limits, the evaluation and links to the code. It is in the sitemap, Lighthouse measures it, and its text is indexed so the guide can explain itself.
- **Dependencies:** `ai` 7.0.148, `@ai-sdk/react` 4.0.152, `@ai-sdk/groq` 4.0.67, `@huggingface/transformers` 4.3.1, `@vercel/functions` 3.10.2, and `tsx` (dev).
- **README** status, stack and scripts brought up to date.

### Key decisions and why

1. **The index is committed, not built during `next build`.** CI and Vercel never download the model, and a unit test fails if content changes without `npm run guide:index`. This follows the decisions log ("RAG index as JSON in the repo").
2. **Off-topic gate.** gte-small's scores are compressed: off-topic questions scored up to 0.75, relevant ones 0.80 and up. The model is skipped when no chunk shares a keyword and none reaches 0.76, or when nothing reaches 0.74 at all. That second rule stops a stray keyword ("write" in "write me a poem") from counting. Questions close to Habib that the site doesn't answer (salary, Rust, weather) reach the model, which is told to say "I don't know". The answer evaluation checks that once a key exists. **Revisit?** If the live eval shows the model answering those, raise the thresholds.
3. **Function size.** Transformers.js loads `onnxruntime-node` dynamically, so file tracing missed it entirely; including the whole package pulled in every platform (313 MB, over Vercel's 250 MB). The config now includes only the Linux x64 binary: 58 MB in total. The model files (about 34 MB) download from the Hugging Face Hub on a cold start and are cached in the temp folder.
4. **No Markdown library.** Answers are a few sentences, and a small renderer can't output HTML at all, which is stricter than a library with HTML disabled.
5. **Eval key from a separate Groq organisation.** Groq's limits are per organisation, so a second key in the same one would share the production quota.

### Left for you

- **Groq keys** (roadmap 7.8): `GROQ_API_KEY` in Vercel (Preview and Production) and `.env.local`; `GROQ_EVAL_API_KEY` from a second Groq organisation, as a GitHub Actions secret. After that, check a first real answer on the preview and run `npm run eval:guide`.
- **Cold start on Vercel.** The first question on a fresh instance downloads the embedding model and is answered by keyword search alone. Worth watching on the preview once the key exists.

## Phase 2: Ridly case study (2026-10-22, closed the same day)

Spec: [specs/features/phase-2-ridly.md](specs/features/phase-2-ridly.md) · Roadmap items 2.1–2.3 · Branch `phase-2-ridly`, merged into `redesign`

**Status: done.** Every check passes in CI on `redesign` (commit `446015a`). Missing Ridly content (problem, decisions, screens, videos, diagram) is in roadmap 7.3.

All three featured projects now have a case study. Ridly's card on Home links to `/work/ridly`, each case study has its own social preview in Fraunces, and videos sit behind a click-to-load player.

### Verification

| Check | Result |
| --- | --- |
| Lint, typecheck | Pass |
| Unit and component tests | 144 passed (was 131) |
| E2E + axe, desktop and phone | 50 passed (was 38). Zero axe violations on `/work/ridly` |
| Production build | Pass. All three case studies and their OG images are static |
| Video facade in a real browser | Checked with a temporary public video, then reverted: no request to YouTube or Google before the click; after it, the `youtube-nocookie.com` player with captions on, focus inside, no CSP errors |
| CI on GitHub (`redesign`, commit `446015a`) | All three jobs pass: check, E2E + axe, Lighthouse (phone), so Home's LCP is within budget in CI |
| Lighthouse, phone (local) | `/work/ridly` and `/work/validation-portal` pass. `/` measured LCP 2.52–2.57 s against the 2.5 s budget, but `redesign` without any Phase 2 change measured 2.23–2.67 s (median 2.53 s) in the same session. The machine was slower than when Phase 1 measured 2.34 s, so this isn't a regression. CI on Linux is the reference |

### What changed

- **Ridly case study (2.1):** `src/content/case-studies/ridly.ts`, from the HOP-KMP repo and the decisions log. The spec has a table of every fact and its source.
  - *My role:* built solo, all 387 commits; names the four parts (shared KMP module, Android, iOS, NestJS API).
  - *AI in the build:* LangGraph planning with the HITL gate; Claude Code and Copilot working against `Agent.md`, which tells the agent to stop and ask instead of inventing architecture; Copilot's Ridly bug-audit skill. No other tools named.
  - *Solution:* the passenger and driver flows, MobilePay settlement, ratings, the tax report, saved search alerts.
  - *Architecture:* shared KMP module with MVI ViewModels, Compose and SwiftUI on top; NestJS 11, Prisma, PostgreSQL with PostGIS, Supabase, Socket.IO, BullMQ, Sentry.
  - *Test evidence:* the k6 ramp (300 → 600 → 1,500, trip search p95 96 ms at 300), the k6 failure test, and what CI runs. It has a test-run frame for the k6 recording.
  - *Impact:* 96 ms p95, 1,500 virtual users, 387 commits, 2 platforms.
  - "Next project" now runs TopicTrail → Ridly → Validation Portal.
- **Social previews (2.2):** `src/lib/og.tsx` draws every preview: the label in IBM Plex Mono, the title in Fraunces SemiBold, the context line in Fraunces Regular, and the "H" tile. `src/app/work/[slug]/opengraph-image.tsx` makes one per case study, and the default image uses the same layout. The TTFs and their OFL licences are in `public/fonts/`. Case study pages now set their own Twitter title and description; before, they inherited the site's.
- **Video facade (2.3):** `src/components/video-facade.tsx`. A poster with a vermilion play mark and "Play · loads YouTube"; the click swaps in the privacy-enhanced player with English captions forced on. `MediaItem` gains an optional `poster`. A content test checks that every video ID is a valid YouTube ID.
- **Lighthouse** also measures `/work/ridly`.
- **README** status table brought up to date.

### Key decisions and why

1. **Ridly's screens stay placeholders, though the repo has real ones.** The HOP-KMP README has Roborazzi renders of every screen state, taken from the real Compose UI. Per the decision that content comes in Phase 7, I didn't pull them in. **Revisit?** If you're happy to use them, pick 3–5 (for example search results, trip detail, chat, post a trip, settlement) and they can go in now.
2. **The poster never comes from YouTube.** YouTube's own thumbnail would contact Google on page load, before anyone chose to watch. The poster is a local image, or a plain paper frame when there is none.
3. **The facade is a link, not a button.** Without JavaScript it opens the video on YouTube; with JavaScript it plays in place. Ctrl- and Cmd-clicks still open a new tab.
4. **Plex Mono for the OG label.** Satori draws Fraunces' "+" wrongly ("Mobile + backend" came out broken). Plex Mono is the site's own label font, so the preview now matches the page.
5. **One static `alt` for the case study OG images** ("Case study by Habib Ahmed Wasi"). Per-page alt text would need `generateImageMetadata`, which changes the image URLs. Social sites rarely show it.
6. **Claims kept to what the repo shows.** "Review its price", not "set the price"; "marked as paid", not "both sides confirm"; CI "on pushes to main and pull requests into it". The k6 ramp numbers come from the decisions log, because the stress profile in `load-test.js` is configured lower (up to 300). **Revisit?** If the 1,500 run used a different script or settings, say so and the text can name it.

### Left for you

- **Ridly content** (roadmap 7.3): problem text, two or three decisions, one concrete example of correcting AI output, 3–5 screens, the demo video and the k6 run recording (YouTube IDs, with captions), the architecture diagram. The repo already has `architecture-diagrams.html`, `hop-dataflow.drawio` and a marketing video with a `.vtt` voiceover that may serve.
- ~~**Commit, push and merge.**~~ Done: `446015a` is on `redesign`, and CI passes.

## Phase 1: Launch (2026-10-21, closed 2026-10-22)

Spec: [specs/features/phase-1-launch.md](specs/features/phase-1-launch.md) · Roadmap items 1.1–1.12 · Branch `phase-1-launch`, merged into `redesign`

**Status: done.** Every "done when" check passes in CI on `redesign`. The content still missing (CV, Calendly, case study material, testimonial) is tracked in Phase 7, and 1.13 moved there as 7.6.

The old site is gone. Home is now Hero → Featured work → Proof → Contact, and TopicTrail and Validation Portal have case study pages at `/work/<slug>`. Content you haven't supplied yet shows as labelled placeholders.

### Verification

| Check | Result |
| --- | --- |
| Lint, typecheck | Pass |
| Unit and component tests | 125 passed |
| E2E + axe, desktop and phone | 38 passed. axe reports zero violations (not only serious ones) on `/` and both case studies |
| Production build | Pass. `/work/topictrail` and `/work/validation-portal` are static; `/work/ridly` is a 404 |
| Lighthouse, phone | LCP 2.34 s on `/` and 2.2 s on a case study; CLS ≤ 0.035; TBT about 240 ms (measured on Windows). LCP is an **error** again |
| CI on GitHub (`redesign`, commit `294adf6`) | All three jobs pass: check, E2E + axe, Lighthouse (phone) |

### Fix: layout shift on Linux, ChromeOS and Android (2026-10-22)

The first CI run failed Lighthouse: **CLS 0.21** against the 0.1 budget, on every run. On Windows it measured 0.017.

- **Cause:** `next/font` sizes its fallback fonts only against Times New Roman and Arial. Linux, ChromeOS and Android don't have either, so they showed unsized fallback fonts. Those are wider, so the name and intro took more lines until Fraunces and Instrument Sans loaded, and then everything below jumped. This would have hit real Android visitors, not just CI. iPhone and Windows were unaffected.
- **How it was confirmed:** a local script that blocks the Times New Roman and Arial fallbacks and delays the web fonts reproduced the shift (Home: 0.017 → 0.052 even with Georgia as the stand-in). Linux's DejaVu Serif is wider still.
- **Fix:** `globals.css` adds size-matched fallback faces to both font stacks:
  - *Clone:* Liberation Serif/Tinos and Liberation Sans/Arimo, metric clones of Times New Roman and Arial, so they reuse `next/font`'s own values.
  - *Android:* Noto Serif and Roboto, with values from `next/font`'s formula and its bundled capsize metrics.
  - IBM Plex Mono is left alone: it's only used for short labels, and its stack falls back to monospace of about the same width.
- **Guard:** `tokens.test.ts` checks that both stacks list the fallbacks and that each face is sized (131 unit tests in total).
- **Result:** Lighthouse passes in CI. CI reports only pass or fail; the exact CLS is in the Lighthouse job's artifact.

### What changed

- **Hero (1.1):** static, server-rendered, visible with JavaScript off. Role line, name, intro with the marker highlight, availability line, "View case studies" and "Download CV". The portrait slot and the H/W tiles show on desktop only.
- **Featured work (1.2, 1.3):** the three cards in the decided order; TopicTrail and Validation Portal link to their case studies, Ridly says "Case study coming". More projects lists five, linking only public repos.
- **Case study template (1.4):** `src/components/case-study.tsx` and `src/app/work/[slug]/page.tsx`. Header with the facts row, hero media, then Problem → My role → AI in the build → Solution → Architecture → Test evidence → Impact, ending with "Next project" (primary) and "Download CV". Each page has its own title, description and canonical URL.
- **Case studies (1.5, 1.6):** `src/content/case-studies/`. Validation Portal's solution, architecture and stack come from its README and history: 111 commits, all yours; started March 2026; `gpt-oss-20b`. Its test evidence says plainly that there are no automated tests. TopicTrail shows only the planned design, marked "Planned".
- **Proof (1.7):** testimonial slot plus the one-line QA record (Silver, 92.26%, 268 cycles, 46 issues).
- **Contact (1.8, 1.9):** Email me, Download CV and Book a call as secondary buttons, then the form with the only primary button. `/api/contact` now validates with Zod, HTML-escapes the email, sets `replyTo`, checks Resend's `{ error }` (502 instead of a false 200), drops honeypot submissions, and rate-limits 5 per IP per 10 minutes through Upstash. If Upstash is missing or down, the form keeps working. The form has pending, success, field-error and error states.
- **Metadata (1.11):** new title and description, `metadataBase`, Open Graph and Twitter tags, a default OG image, `sitemap.xml` and `robots.txt`.
- **Phone (1.12):** stacked full-width buttons; no horizontal scroll (checked in E2E).
- **Clean-up:** removed the six legacy sections, `components/ui`, `components.json`, the shadcn colour mapping, the legacy lint exception, and `@radix-ui/react-slot`, `class-variance-authority`, `lucide-react` and `tw-animate-css`. Added `zod` 4.6.5, `@upstash/ratelimit` 2.2.0 and `@upstash/redis` 1.39.0, pinned.

### Key decisions and why

1. **Missing CV and Calendly render as visible placeholder buttons** ("[CV PDF]", "[Calendly URL]"), not dead links. The nav still hides CV. The E2E test accepts either the real link or the placeholder, so it keeps passing when the PDF arrives.
2. **About is hidden from the nav** until the About page exists (4.4), by the same rule as CV. The old About and Experience sections are gone, and the full uTest record returns with the About page. **Revisit?** If you'd rather keep a short experience block on Home until Phase 4.
3. **The Motion provider is unmounted.** Nothing animates in Phase 1, so loading `LazyMotion` on every page only cost first-view JavaScript. The `motion` dependency stays for Phases 3 and 5.
4. **Home has no `#ai` or `#stack` sections yet.** They are Phase 4. The anchors stay defined, so the section numbers on Home are 01–03 for now.
5. **The old site's phone number is not carried over.** The mockups and decisions list email, CV and Calendly only. **Revisit?**
6. **Validation Portal's role stays a placeholder,** even though all 111 commits are yours. If you built it solo, say so and it becomes "Built solo" like Ridly.
7. **Demo videos render as a plain "Watch on YouTube" link** once a video ID is set. The click-to-load facade is 2.3.

### Left for you

- **Content (CV, Calendly, case study material, testimonial, profiles):** deferred to the end of the project. It's tracked as [Phase 7: Content handover](specs/product/roadmap.md#phase-7-content-handover-last), which also absorbs 1.13. Placeholders stay until then.
- ~~**Stray `package-lock.json` at the repo root.**~~ Deleted.
- **Commit, push and merge:** nothing is committed yet. `phase-1-launch` branches from `phase-0-foundation`, which isn't merged into `main` either.

## Phase 0: Foundation (2026-10-21)

Spec: [specs/features/phase-0-foundation.md](specs/features/phase-0-foundation.md) · Roadmap items 0.1–0.8

Visitors see almost nothing new yet. The old sections still render, now on the paper palette with the new fonts, header and footer. Underneath, the codebase now has design tokens, a typed content layer, the first six design system components, tests, CI and security headers.

### Verification

| Check | Result |
| --- | --- |
| Typecheck (`npm run typecheck`) | Pass |
| Lint (`npm run lint`) | Pass (with one scoped exception, see decision 9) |
| Unit and component tests (`npm test`) | 74 passed |
| E2E + accessibility, desktop and phone (`npm run test:e2e`) | 12 passed |
| Production build | Pass |
| Lighthouse, phone (`npm run lhci`) | CLS pass. LCP 2.8 s against a 2.5 s budget, reported as a warning (see decision 10) |

CI hasn't run on GitHub yet, because nothing is committed or pushed.

### What changed

**Dependencies (0.1)**
- Next.js 16.1.1 → 16.4.0.
- `framer-motion` → `motion` 13.5.1. Every import is now `motion/react`.
- Removed `next-themes`, the theme toggle, `nodemailer`, `@types/nodemailer` and the dark palette.
- Added Vitest, Testing Library, jsdom, Playwright, axe and Lighthouse CI as dev dependencies, all pinned to exact versions.
- `@types/node` 20 → 22.

**Tokens and fonts (0.2)**
- `src/app/globals.css` defines every design system token as a CSS variable and a Tailwind utility:
  - 13 colours (`bg-paper`, `text-ink`, `text-signal-ink`…)
  - spacing (`p-space-4`)
  - radius (`rounded-md`, `rounded-pill`)
  - shadows (`shadow-lift`)
  - type styles (`text-display-xl` … `text-label`), with the phone sizes below 640 px
- Fonts come from `next/font`: Fraunces, Instrument Sans, IBM Plex Mono.
- `design-system/tokens.json` is a snapshot of the design system's tokens, and a test checks every value against `globals.css`.

**Content layer (0.3)**
- `src/content/`:
  - `types.ts`
  - `projects.ts`: the featured three plus five more, with the decided facts
  - `site.ts`: identity, intro, availability, links, QA record, testimonial
  - `anchors.ts`: stable section IDs
  - `placeholder.ts`

**Components (0.4)**
- `src/components/hw/`: Button, Tag, Metric/Metrics, MediaFrame, ProjectCard, Testimonial, Placeholder.
- Styles are in `src/styles/components.css`, using the design system's `hw-` class names.

**Tests and CI (0.5, 0.6)**
- `vitest.config.mts`, `playwright.config.ts`, `e2e/shell.spec.ts`, `lighthouserc.json`.
- `.github/workflows/ci.yml` runs three jobs: check (lint, typecheck, unit tests, build), then E2E and Lighthouse in parallel against that build.
- `.env.example` lists every variable.
- `next.config.ts` sends a Content Security Policy plus `nosniff`, `Referrer-Policy` and `Permissions-Policy`.

**Site shell (0.7)**
- `SiteHeader`: wordmark, text nav, skip link.
- `SiteFooter`: GitHub, LinkedIn, the site's source and the CI badge.
- A global cobalt focus ring and a global reduced-motion rule.
- The old navbar and footer are deleted.

**Design system (0.8)**
Version 13 of the [design system](https://claude.ai/artifact/P1shpLvwDNZziVVL3V3v4Y):
- Featured order is TopicTrail, Ridly, Validation Portal.
- Hop → Ridly.
- Llama 3.3 → GPT-OSS on Groq.
- Justit → Just Eat.
- Commit and uTest numbers updated, with their conditions.
- The Testimonial placement now matches the Home order.
- The Metric example uses Ridly's p95 instead of Undershelf's unproven 80%.

### Key decisions and why

1. **Pinned exact versions, at least two weeks old.** This lowers the risk of pulling in a compromised fresh release. As a result, Next.js is on 16.4.0, not 16.4.2, and Motion on 13.5.1, not 14.5.0. Motion 14 had no breaking changes for React, so moving up later is a one-line bump.
   **Revisit?** Bump Next to 16.4.2 now if you'd rather have its patch fixes.

2. **Old sections kept, re-skinned rather than deleted.**
   - Deleting Hero, About, Experience, Projects, Skills and Contact would leave the site empty until Phase 1. Instead, the old shadcn colour variables (`--background`, `--primary`…) now point at the paper palette, so they still look coherent.
   - Their own gradients (blue/purple) remain until Phase 1.
   - The contact form still works through `/api/contact` and Resend. Its bug fixes are roadmap item 1.9, as planned.

3. **Spacing utilities are named `space-*`** (`p-space-4`, `gap-space-2`) instead of overriding Tailwind's numbers. Overriding `p-4` would have silently changed every old section. The design system's names are kept intact.

4. **Fraunces loads with its `opsz` axis.** The tech stack said "only if used". It is used: the design system sets optical size on the name and on Metric numbers. Fraunces is the only preloaded font; Instrument Sans and Plex Mono load without preload.

5. **The content layer is typed TypeScript, and missing content is a typed placeholder.**
   - Any field can be `placeholder("Ridly screens")`. It renders as a visible "[Ridly screens]" slot, and `listPlaceholders()` lists everything still missing.
   - Today that list includes: CV PDF, Calendly URL, the testimonial quote and name, the cover images, and your role on TopicTrail, Validation Portal, Undershelf, Deskinct and the Medication Adherence App.
   - Tests fail if "Hop", "Llama 3.3", "Justit" or "80%+" reappear anywhere in the content.

6. **Facts in `projects.ts` follow the roadmap's facts table.**
   - Ridly: "96 ms, Trip search p95, at 300 virtual users" and "387 commits, built solo".
   - Validation Portal: tagged "GPT-OSS 20B via Groq".
   - Undershelf: no coverage claim, and it uses SQLite.
   - Heat.IT: "I built the Asset Manager module".
   - Deskinct and Medication Adherence App: no link.
   - TopicTrail's "0.1 engagement threshold" is labelled as a design parameter from the PRD, not a result.

   **Revisit?** Check the wording before Phase 1 puts it on screen.

7. **Project cards aren't links until their case study exists.** A card with `caseStudyReady: false` renders as a plain card saying "Case study coming", so nobody clicks into a 404. All three are `false` today; Phase 1 flips TopicTrail and Validation Portal.

8. **The CV link hides until the PDF exists.** The nav shows Work, About and Contact, and adds CV automatically once `site.cv` is a real path instead of a placeholder. About points at the old About section until the About page arrives in Phase 4.

9. **One scoped lint exception for the old sections.** Lint had never run on this repo. Its only errors were unescaped apostrophes in the six old section files. Rather than edit files that Phase 1 deletes, `eslint.config.mjs` turns those two rules off for exactly those files, with a comment to remove the block with them. All new code is linted in full.

10. **LCP budget is a warning until Phase 1.**
    - Lighthouse on phone measured LCP at 4.4 s at first. The old hero was server-rendered at `opacity: 0` and only appeared after JavaScript ran its fade-in. This was true on the live site too.
    - I set the hero's fade-in to `initial={false}`, so it paints immediately. That brought LCP to 2.8 s.
    - What remains is the old page's heavy HTML, about 1 s of main-thread work on a throttled phone. Optimising code that Phase 1 deletes isn't worth it.
    - So the 2.5 s budget stays in `lighthouserc.json` as a warning, and Phase 1's "done when" now says to switch it back to an error. CLS is enforced as an error now.

11. **Accessibility fixes found by the new tests.**
    - axe flagged grey text on the old hero (ink at 60% opacity, 4.37:1 on paper). It now uses the `ink-muted` token (5.7:1) in the old sections.
    - The axe test waits until entrance animations settle, so it measures what visitors see, not a half-faded frame.

12. **The CI badge is lazy-loaded.** React 19 was preloading the github.com badge image in `<head>`, opening a third-party connection before first paint for an image in the footer.

13. **Static CSP that allows `unsafe-inline` scripts and styles.** Next.js's App Router injects inline scripts, and Motion writes style attributes. A nonce-based CSP would remove the need for `unsafe-inline`, but it forces every page into dynamic rendering. Allowed third parties:
    - Vercel Analytics
    - GitHub images (the badge)
    - `youtube-nocookie.com` frames, for Phase 2 videos

    Everything else is `self`, and framing the site is blocked (`frame-ancestors 'none'`).

14. **`.env.example` is committed.** The old `.gitignore` ignored every `.env*` file, which would have hidden it. It now has an exception for `.env.example`, and ignores the test output folders.

15. **Lighthouse runs against the CI build, not a Vercel preview yet.** Wiring it to preview URLs needs the Vercel project connected to GitHub checks. The workflow is ready to point at `E2E_BASE_URL` once that's done.

### Left for you

- ~~**Upstash:** create the account through the Vercel Marketplace integration.~~ Done 2026-10-21. Vercel named the variables `KV_REST_API_URL` and `KV_REST_API_TOKEN`, and `.env.example` now uses those names.
- **Portfolio Mockups artifact:** it still says "Hop" and "Llama 3.3" in places. Only the design system was corrected. Tell me if you want the mockups updated too.
- **Commit and push:** nothing is committed. Once pushed, CI runs on GitHub and the footer badge goes live.

### Known leftovers (handled in later phases)

- Old sections still carry the old copy: the "Passionate about…" intro and the older uTest numbers in Experience. Phase 1 replaces them.
- `metadata` in `layout.tsx` is unchanged (1.11).
- The `@/components/ui` shadcn primitives and `tw-animate-css` remain for the old sections.
