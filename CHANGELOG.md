# Changelog

Each entry lists what changed, the key decisions and why, and what's left open. Decisions marked **Revisit?** are the ones you may want to change.

## Phase 7.5 and fixes: photos, portrait, CV viewer, the landing (2026-10-23)

Branch `phase-7-case-studies`.

- **Header name:** the header said "Habib Wasi"; it now shows the full name, **Habib Ahmed Wasi**. On phones it's 18 px and can take two lines, so the four nav links still fit at 320 px.
- **Landing:** Home's first screen is the landing only. Hero and object nav fill the viewport (`.hw-landing`, `100svh` minus the header), so Selected work no longer peeks into the first view on phones and tall screens.
- **Empty space at the bottom:** the page reserved room for the guide tile under the footer (96 px, plus 96 px of body padding below 1024 px, and 240 px while the tour offer showed). All of it is gone. The footer keeps its links out of the tile's corner instead, and the tour offer hides while the footer is on screen. The keyboard test confirms no focused link is covered (WCAG 2.4.11).
- **Portrait (7.5):** a pixel-art portrait made from your photo fills the hero slot (`public/hero/portrait.png`, 17 KB, preloaded). From desktop width it's now Home's largest paint (about 180 ms locally); on phones it's hidden and the name still is. The LCP test checks both.
- **About photos (7.5):** the three photo cards are collages: Sønderborg harbour (September 2023), uTest (profile, badges and your article) and the October 2026 job fairs in Vejle and Sønderborg. Every picture has alt text, and none carries GPS or camera data. Your originals (`photos/`, `personalphoto.jpg`) stay out of git through a new root `.gitignore`.
- **CV viewer:** every CV link (header, hero, contact, case studies, object nav, the guide's offer) opens the CV's two pages in a modal, with "Download PDF" at the top; the buttons say "View CV". The pages are images because a PDF in a frame shows nothing on Android; `scripts/cv-pages.py` renders them, so rerun it whenever the PDF changes. New-tab and modified clicks, and visitors without JavaScript, still get the PDF.
- **Analytics:** opening the CV still counts as `CV download` with where it was clicked; a real download from the viewer is recorded with place `cv-viewer`. **Revisit?** In Umami, the event name now means "opened the CV".
- **Stack logos:** each skill button carries its logo (Simple Icons, CC0) or a small drawn icon for concepts like TDD and RAG; brand tags take their brand colour on hover.
- **Tooling:** `agentRules: false` stops `next dev` writing an `AGENTS.md` into the repo when an AI agent runs it.
- **Checked:** typecheck and lint pass; the production build passes; 162 end-to-end tests pass locally (16 skipped by design). Unit tests run in CI only (Smart App Control). Two e2e tests were updated for the CV viewer and the portrait.
- **Lighthouse fix:** CI's phone run put the About page's LCP at 3.41 s (budget 2.5 s): the first Sønderborg photo is the largest element and loaded lazily. It now preloads, and images are served as AVIF first (WebP as fallback). Locally About went to 2.17–2.28 s; the other pages are unchanged.
- **Heads-up:** `next build` warns that Next.js 16.4.0 has a known security advisory. It doesn't fail the build in CI or on Vercel. Upgrading is a separate step.
- **Left open:** drawings of your own objects (optional) and checking the About facts (7.5); the rest of Phase 7 (7.6–7.11).

## Phase 7.3: Ridly and Validation Portal case studies (2026-10-22)

Branch `phase-7-case-studies`. TopicTrail stays placeholders until Habib sends its files.

- **Ridly:** the problem, three decisions with their reasons (direct MobilePay payment, SKAT-rate pricing in whole øre, the two trip models) and the Prisma 7 correction as the AI example, all drafted from HOP-KMP for your review. Five screens from the README gallery, framed as phones. A new architecture diagram drawn from your `hop-dataflow.drawio`. A Home card cover made of three screens.
- **Ridly, corrected:** pushes go through FCM and APNs, not a BullMQ queue. CI builds iOS but can't fail on it (`xcpretty || true`), so the page no longer says it builds both apps. The known limits from the codebase audit (overbooking under concurrent bookings, partial settlement creation, recurring-trip idempotency, backend tests not in CI) are stated as the next work.
- **Validation Portal:** built solo; the problem; three decisions (AI drafts that the founder must save, the AI behind session-checked serverless functions from day one, guest access deleted after seven days); Copilot and Claude Code; the model history (OpenAI → Gemini → Groq). New in the text: the AI question generator, the Mom Test bias check, translation into eight languages and the read-only report link. Five screens taken from the live demo reel, an architecture diagram drawn from the code, and a card cover.
- **Site:** media can be phone-shaped (`shape: "phone"`); desktop screenshots show two per row; a unit test checks every case study image exists and has alt text.
- **Accessibility fix found on the way:** the guide tile could cover a focused link near the bottom of the screen (the flaky keyboard test). `scroll-padding-bottom: 120px` keeps focus clear of it (WCAG 2.4.11).
- **Videos:** the Ridly film (`GB39N2Kh7Jk`, with its own poster) and the Validation Portal walkthrough (`DqSZ-N4Znnc`) play behind the click-to-load facade, and the guide's `play_demo` now offers both.
- **k6, corrected to the repo:** the site said the ramp went to 1,500 users; `load-test.js` peaks at 1,200 (800 searching, 400 signed in). Every mention now says 1,200. With no results committed, the test-run frame shows the ramp as configured, labelled that way, with the 96 ms point at 300 users.
- **TopicTrail:** written from the project files: the problem (from the proposal and PRD), your part of a two-person team, four decisions (the 0.1 watch-ratio threshold, keyword as the baseline for semantic search, privacy and the ToS limits, the move from a local-first Electron app to a server with per-user encryption), the evaluation plan, and dated progress. The hero is a new planned-architecture diagram; your class diagram sits under Architecture. "Local, first, opt-in capture" is gone, because the October design changed it.
- **Testimonial (7.4):** Kasper Krogh's LinkedIn recommendation, shown as the screenshot you sent (LinkedIn's tabs cropped off), with the full text as alt text. Two of its sentences stay in the content for the guide.
- **TopicTrail AI section:** Claude Code, GitHub Copilot and Codex, and how you step in at every design decision because they can be confidently wrong.
- **Focus never hides under the guide (WCAG 2.4.11):** when a focused element sits under the guide tile or the tour offer, the page scrolls it clear; the browser's own focus scrolling skips elements that are already on screen. The page also leaves room for the offer while it shows.
- **Keyboard test, steadied:** it turns smooth scrolling off during the walk, so it judges where focus lands, not a frame of the scroll animation (the cause of the intermittent CI failures).
- **Lighthouse fix:** Validation Portal's page missed the 2.5 s LCP budget in CI (3.16 s) once its video poster arrived, because the poster loaded lazily. The case study hero now preloads; locally that page went from 3.28 s to 2.21–2.47 s.
- **Footer fix:** at the very bottom of a page the guide tile covered the footer's last link; the footer has room for it now.
- **Left open:** upload `ridly-film.vtt` to the Ridly video as English subtitles (the Validation Portal video has captions burned in); one concrete example of correcting Copilot or Claude Code on Validation Portal; TopicTrail.

## Phase 6: Polish (2026-10-22)

Spec: [specs/features/phase-6-polish.md](specs/features/phase-6-polish.md) · Roadmap items 6.1–6.2 · Branch `phase-6-polish`, merged into `redesign`

**Status: done.** CI and the Vercel preview pass on `redesign` (merge commit `65a7871`, PR #1). In CI: 303 unit tests in 27 files, 158 end-to-end tests, and Lighthouse on phone within budget. The guide evaluation wasn't rerun, since nothing in the guide changed. Unit tests still run in CI only, because Smart App Control blocks Vitest on this PC.

- **Accessibility audit (6.1):** axe with the WCAG 2.2 AA tags plus best practice on every page, a Tab walk of every page, reduced motion, 320 px reflow and the WCAG text-spacing overrides. The site already passed nearly all of it. Two fixes came out of it:
  - **Card links:** each featured card is one link, so a screen reader named it with the whole card (placeholder, metrics, tags and "Read the case study"). It's now named by the title and described by the summary.
  - **404:** Next's bare "404" is replaced with a page in the site's style that leads back to the work, About and Home.
- **Tests that keep it:** `e2e/a11y.spec.ts` runs all of the above on every page, plus Home with the guide open. A unit test checks the contrast of the colour pairs the design uses, read from `globals.css`. The lowest pairs are `signal` on paper (4.61:1) and muted ink on the marker (4.93:1).
- **Analytics (6.2):** Umami Cloud, as you chose. One listener recognises CV, `mailto:` and Calendly links by their target and sends `CV download`, `Email click` or `Calendly click` with where on the page the click happened. Case study views are Umami's page views of `/work/<slug>`. The script loads only when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set and counts only the production host, so previews and CI never show up. The CSP allows `cloud.umami.is` and `gateway.umami.is`. Checked with a test ID: the script loads and nothing is blocked.
- **Why not Umami's own `data-umami-event`:** on a link it cancels the click and sets `location.href` itself, which would open the CV PDF instead of downloading it.
- **Revisit?** Vercel Analytics stays next to Umami, so page views are counted twice, in two dashboards. Dropping Vercel's is a one-line change.
- **Left open:** the Umami account and website ID (7.9), and a manual screen reader pass with NVDA and VoiceOver on the real content (7.10).

## Phase 5 follow-up: smoother tiles, guide answers that scroll (2026-10-22)

Reported on the preview: the page lagged, the letter tiles fell unevenly, and guide answers looked cut off.

- **Tiles:** a trace showed the tiles repainted about twice a frame while falling (261 paints and 421 ms of raster work in 2 s), because the growing shadow changed `box-shadow` every frame and the tiles had no layers of their own. Now each tile is its own layer, moved by transform only, and the extra shadow fades in by opacity: 0 repaints and 1 ms of raster in the same 2 s. The engine also ran one step per screen refresh, so on a 120 or 144 Hz screen the fall was 2–2.4× too fast and any dropped frame hitched. It now steps on real time (fixed 1/120 s steps, drawn between steps).
- **The drop, second pass:** popping the tiles up out of the pile (the first fix) shuffled them and broke the name. They fall from the top again, but now each drops straight into its own slot, H first, so the name always lands as H W A S I. The still pile is that same row, so the name reads right without JavaScript too. 16 test drops at 1100–1440 px all landed in order, every tile within 8° of upright.
- **Guide:** a long answer didn't scroll; it painted over the question field and the footer. The conversation now scrolls on its own between the jumps and the field and follows the newest message, unless you've scrolled up to read. This dates from Phase 3; the bigger header and the busy fallback's four excerpts made it show. A dev server started before the fix can keep serving the old CSS (file watching is unreliable in OneDrive); restart it.
- **Not changed:** on the preview the guide has no Groq key yet (7.8), so every answer is the busy fallback: the matching pages, with excerpts cut at about 160 characters on purpose.
- **Load:** locally, nothing in the page load stands out beyond the tile repaints above. Vercel adds its toolbar script to protected previews, which production won't have.

## Phase 5: Delight (2026-10-22)

Spec: [specs/features/phase-5-delight.md](specs/features/phase-5-delight.md) · Roadmap items 5.1–5.6 · Branch `phase-5-delight`, merged into `redesign`

**Status: done.** CI, the guide evaluation and the Vercel preview pass on `redesign` (commit `1dc9042`). In CI: 258 unit tests in 25 files, 102 end-to-end tests (2 skipped by design), and Lighthouse on phone within budget on every URL. The first run's end-to-end job failed before any test ran: `npm ci` timed out downloading the ONNX runtime from nuget.org. The re-run passed. Unit tests can't run on this PC for now: Windows Smart App Control blocks Rolldown's native module, which Vitest needs, so CI runs them.

**What changed.** The site moves now, and the guide can act on the page. The first view is still server-rendered and readable before any of it runs.

- **Name (5.1):** after `load` and the fonts, the words lift in a short wave, then each letter flickers through mono glyphs and settles. It runs once per tab session, never under reduced motion, and the text never changes, so nothing shifts and the name stays Home's LCP element.
- **Physics tiles (5.2):** five tiles (a vermilion H, then W, A, S, I) replace the static H and W beside the portrait. With a mouse, Matter.js loads once the name has settled; the tiles drop in and can be dragged, flicked and poked, and a hard landing squashes a tile and scrambles its letter. Paused offscreen and in a hidden tab. Phones, touch screens and reduced motion get the still pile, and Matter.js never loads there.
- **Skills orbit (5.3):** from 1200 px the Stack becomes three rings around a dark core: AI tools outermost, then languages and data, then frameworks and tools. Hovering, focus or "Pause rotation" stops it. Below 1200 px it's three rows of tags. Same buttons either way.
- **Object nav (5.4):** under the hero, the mockup's laptop, stopwatch, sheet and envelope lead to Work, About, CV (once it exists) and Contact. They're decorative for keyboards and screen readers; the header's text menu is the accessible route.
- **Portrait slot (5.5):** `site.hero.portrait`, a placeholder until 7.5, then `next/image` in the same 4:5 box.
- **Guide (5.6):** the header character now listens, thinks, talks and points, from the mockup playground's keyframes, and pokes when the panel opens or you click it. The model can call six page tools: `scroll_to`, `open_case_study`, `highlight`, `play_demo`, `start_tour`, `download_cv` (offered only once the CV exists, and it asks first). The browser runs the tool, outlines the target, and a small H hops onto its corner; the chat says "Showing: …". New "Getting around this site" chunk; index rebuilt.
- **Revisit?** A tool call never goes back to the model, so each question is still one Groq request against the 90-a-day cap. The cost: the model can't comment on what the tool did.
- **Revisit?** The orbit shows all 21 skills, more than the design system's 6/5/3, so the rings are fuller than the mockup. Tags on neighbouring rings can briefly overlap as they turn.
- **Found while building:** letters as `inline-block` lost Fraunces' kerning ("W asi"); positioned letter spans took the name away from LCP (it fell to the next heading); and tiles that switched from `left`/`bottom` to `top` caused a 0.07 layout shift. All three are fixed, and e2e tests cover LCP and shift.
- **Tests:** unit and component tests for skills families, the scramble, tile rules, tool schemas, request stripping, states, the tool runner and the CV card; end-to-end for the name, physics loading and pausing, the orbit, the object nav and two tool flows with axe. All 100 e2e tests passed twice in a row locally (desktop and phone). Typecheck and lint pass. The guide evaluation's retrieval passes all 27 cases, including the four new tool questions; the answer half needs `GROQ_EVAL_API_KEY` (7.8).
- **Lighthouse (local):** Home's LCP is 2.58–2.63 s here, against 2.53–2.56 s for Phase 4 on the same machine, which also misses the 2.5 s budget locally. CI decides. Home's CLS is 0.034 (Phase 4: 0.017), all from web fonts swapping in.

## Phase 4: AI story, proof and About (2026-10-22)

Spec: [specs/features/phase-4-ai-story-about.md](specs/features/phase-4-ai-story-about.md) · Roadmap items 4.1–4.4 · Branch `phase-4-ai-story-about`, merged into `redesign`

**Status: done.** CI, the guide evaluation and the Vercel preview pass on `redesign` (commit `1063fa4`). The first push failed the guide evaluation: the new question "Where has he worked before?" didn't retrieve the journey, because its chunk never said "worked" or "experience". The chunk is now labelled as work experience and education.

**What changed.** Home now runs hero → selected work → **How I build with AI** → proof → **Stack** → contact, and the site has an **About** page.

- **How I build with AI (`#ai`, 4.1):** the Plan → Human review → Build → Test → Ship diagram with the "rejected: revise" loop (a vertical stack on phones), and the AI toolkit as dark tags, each linking to the project that proves it.
- **Stack (`#stack`, 4.3):** every skill a project proves, in two groups. Picking one shows where it was used. The orbit replaces the row in 5.3.
- **One skills list:** `src/content/skills.ts` feeds both. A test fails if a skill has no proof, or if a proof links somewhere the site doesn't have.
- **About (`/about`, 4.4):** intro, three photo placeholders, the journey line (horizontal on desktop, vertical on phones, linked to the case studies and the QA record), the full QA record, and CV and email. It's in the nav, the sitemap and Lighthouse, with its own OG image. Home's proof links to it ("See the full record").
- **Guide:** new chunks for the AI workflow, skills and journey; the QA record chunk points to About; the "AI workflow" jump goes to `/#ai`; one new eval question. Index rebuilt.
- **4.2 (testimonial)** needed no new code and moves to 7.4.
- **Revisit?** The toolkit drops Llama 3.3 and RAGAS from the mockup and adds "GPT-OSS via Groq". This site and its guide count as proof for RAG, embeddings, Claude Code and TDD.
- **Revisit?** The journey facts come straight from the mockup (dates, "SDU in Sønderborg", "91% on time" at Just Eat). They're listed in 7.5 to check.
- **Tests:** 227 unit and component tests, 86 end-to-end (desktop and phone, with axe); lint, typecheck and build pass. Lighthouse wasn't run locally; CI runs it.

## Phase 3 follow-up: search-only fallback while busy (2026-10-22)

Spec: [specs/features/phase-3-guide.md](specs/features/phase-3-guide.md), section 3.6 · Branch `phase-3-search-fallback`, merged into `redesign`

**What changed.** When the guide is busy (a visitor or the site is over its limit, there's no Groq key, or Groq fails), it still says "The assistant is busy right now", and under that it lists the parts of the site that match the question: a link and a short excerpt for each. Before, a busy guide was a dead end.

- **Route:** the busy cases are now a normal streamed answer with `busy: true` and the matches, instead of a bare 429 or 503. Over a limit the search is keyword-only, so a limited visitor never loads the embedding model. A question with no match still gets "I don't know", key or no key.
- **Sources** carry an `excerpt` (about 160 characters, cut at a word), taken from the index, never from the model.
- **Panel:** a "Matching pages" list under the busy message. A Groq error mid-answer shows the same list from that answer's sources.
- **`/guide`:** the "Limit" step explains the fallback; the index was rebuilt.
- **Why:** Groq's free tier for `gpt-oss-120b` allows 200,000 tokens a day, which is roughly 100 answers. Past that, visitors still get something useful.
- **Tests:** 203 unit and component tests (6 new), 72 end-to-end (2 new, with axe), lint and typecheck clean.
- **Daily cap lowered from 300 to 90** questions across the site, just under Groq's roughly 100 answers a day, so the guide goes busy before Groq starts refusing. **Revisit?** Raise it if Groq's usage dashboard shows answers using fewer tokens than estimated, or on a paid Groq tier.

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
   **Correction after the merge:** the 58 MB was the local trace, and Vercel still failed the preview deployment on the function's size. Habib fixed it by setting `VERCEL_SUPPORT_LARGE_FUNCTION=1` in the Vercel environment. It is now in the README, `.env.example` and the tech stack's variable table, and has to be set for Production too before `main` is merged.
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
