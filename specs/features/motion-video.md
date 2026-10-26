# Spec: Motion video

Roadmap items M.1–M.6 · Status: specced (2026-10-26) · Branch `motion-video`

## Goal

A short video of the portfolio for LinkedIn and the repo README, made to get noticed by recruiters and developers. It is built as code: Remotion scenes in React and TypeScript, using the site's own design tokens and fonts, with real footage of the site captured by Playwright scripts. Music and on-screen text only, no voiceover.

The story follows a sceptical tech lead's questions. It opens on the product (what it does, how the guide answers), turns to what happens when things go wrong (the edge cases), and ends on how we know it always works (tests, evaluation, Lighthouse). Every scene answers the question on screen; a shot that doesn't answer one is cut.

Every number and every answer in the video is real: taken from the site, the index, the test suite or a CI run, never typed in by hand.

## Out of scope

- A voiceover, or Habib on camera.
- A YouTube upload or other platforms. The two cuts below are for LinkedIn and the README; others can reuse them later.
- Showing the video on the site itself (hero or a page). It could come later; nothing on the site changes in this spec.
- Rendering on every push or release. Rendering is run by hand (locally or with a manual workflow).
- The "ship log" process shots (writing a spec, a commit time-lapse). Only the proof at the end of story 2 is kept.

## Sources

| What | Source |
| --- | --- |
| Story and scene order | Discussion of 2026-10-26: story 1 ("10 seconds, then under the hood") as the backbone, story 2 ("ship log") as the closing proof, the edge cases between them |
| Edge cases | The feature edge-case list of 2026-10-26 (12 sections), checked against the code: `src/lib/rate-limit.ts`, `src/app/api/contact/route.ts`, `src/components/contact-form.tsx`, `src/components/cv-viewer.tsx`, the guide in `src/lib/guide/` |
| Colours, type, radii, shadows | `portfolio-website/design-system/tokens.json` and the `hw-` classes (`hw-letter`, citation chips) |
| Fonts | Fraunces, Instrument Sans, IBM Plex Mono (the site's `next/font` set) |
| Retrieval scores | `createSearcher` in `src/lib/guide/search.ts` (`SearchHit`: `bm25`, `cosine`, fused `score`) over `src/generated/guide-index.json` |
| Model name | `GUIDE_MODEL` in `src/lib/guide/config.ts` (7.11 may change it) |
| Evaluation | `evals/guide/cases.ts` (32 cases on 2026-10-26), the nightly `guide-eval.yml` |
| Lighthouse | `lighthouserc.json` (phone profile, five URLs) and the latest `lighthouse-report` artifact from CI on `main` |
| Earlier coded video | The Validation Portal demo reel (`src/components/demo` in that repo), 1920×1080 with captions burned in |

## Decisions made in this spec

| Question | Decision | Why |
| --- | --- | --- |
| Tool | **Remotion 4** (latest 4.0.x at install, pinned exactly, like the site's other dependencies). Free for individuals; check remotion.pro/license at install | React and TypeScript, which Habib already uses. The video's code is part of what it shows. |
| Where it lives | A new `video/` folder at the repo root with its own `package.json` and lockfile. Nothing in `portfolio-website/` imports it, and it imports nothing from the site except `design-system/tokens.json`, the index JSON and the eval cases, read as data | The site's build, CI jobs and Vercel deploy stay untouched. Next.js components (`next/image`, `next/font`) don't run in Remotion. |
| Real UI or redrawn | The real UI is **footage**. Remotion draws only what the site can't show: the retrieval diagram, the on-screen questions, number cards, the test montage, the end card | Redrawing the site would be a mock-up; footage is proof. |
| The chat | A **real recording** with the caption "Real answer, unedited". The same answer's text is reused in scene 3's diagram | Authenticity is the point. If 7.11 changes the model, the chat is captured again. |
| Which question the guide answers | One question from `evals/guide/cases.ts` that passes the nightly evaluation, chosen when capturing | It is known to retrieve the right sources and cite them. |
| How footage is captured | Playwright scripts drive the browser (fixed viewport, scripted mouse, a fresh context per take, so the name and tour offer play as on a first visit). Capture with Playwright's `recordVideo` first; if a 1080p test take looks soft, switch to Chrome DevTools screencast frames | Repeatable takes; no stray mouse or browser UI. Playwright's video bitrate is low, so it is checked before relying on it. |
| Which build is filmed | A local production build (`npm run build && npm start`), never the live site | Keeps fake clicks out of analytics and the live guide's quota free for visitors. |
| Guide quota while filming | The happy-path takes need `KV_REST_API_URL` and `KV_REST_API_TOKEN` (without Upstash a production build keeps the guide closed) and count against the real limits: 10 per 10 minutes per visitor, 90 a day for the site. At most 15 guide questions per capture session; ask one warm-up question first (cold start answers by keyword search only) | The limiter fails closed in production by design (`allowGuide`). |
| Sizes and frame rate | README cut 1920×1080, LinkedIn cut 1080×1350 (4:5), both 30 fps, H.264 MP4 with AAC audio | 4:5 fills the most of a phone feed on LinkedIn. |
| Physics on the 4:5 cut | Tile shots are captured at desktop size and reframed in Remotion | Physics only runs with a fine pointer at ≥ 640 px; a phone capture shows a still pile. |
| README embed | The README cut is uploaded through GitHub's editor as an attachment and the link goes in `README.md`. The MP4 is not committed | GitHub plays attachments inline. Video files would bloat the repo. Free plans cap video attachments at 10 MB, so the README cut must fit (see acceptance). |
| Where rendering runs | Locally if Remotion runs on this machine. If Smart App Control blocks its binaries (it already blocks Rolldown's native module), footage goes up as a GitHub Release asset and a `workflow_dispatch` job in `.github/workflows/video.yml` renders both cuts and uploads them as artifacts | Checked first, in M.1. |
| Music | A royalty-free track that allows use on LinkedIn and GitHub (for example Pixabay Music), chosen by Habib. Its licence goes in `video/music/LICENSE.md`. Until then a silent placeholder | Content is supplied at the end (Phase 7, item 7.12). LinkedIn autoplays muted, so the text carries the story either way. |
| End card claim | "This video is rendered from code", with the repo path `video/` | True whether it renders locally or in CI. Nothing claims it renders on every release. |

## Scenes

Times are seconds. The README cut is about 90 s, the LinkedIn cut about 40 s.

| # | On-screen question | What's shown | Made of | README | LinkedIn |
| --- | --- | --- | --- | --- | --- |
| 1 | (none: the hook) | The name scrambles in, then the tiles drop in one by one and read H W A S I | Footage, desktop | 0–5 | 0–3 |
| 2 | "What does it do?" | Home, a case study, the guide opening and answering one question, with the caption "Real answer, unedited" | Footage | 5–20 | 3–10 |
| 3 | "How does it answer?" | The question splits into terms; BM25 and cosine rank the chunks as two bar lists (real scores); the lists fuse into the top sources; the model name from `GUIDE_MODEL`; the answer from scene 2 streams in and its citations light up the sources they point to | Remotion, from exported data | 20–40 | 10–18 |
| 4 | "What if you try to break it?" | An off-topic question gets the fixed "I don't know" at once, with the caption "No model call"; a prompt injection ("ignore your rules…") gets an on-topic refusal | Footage | 40–50 | 18–24 |
| 5 | "What if Groq goes down?" | The busy message with matching pages and excerpts. Then a split screen with the rate limiter down: the contact form still sends, the guide says it is busy, captioned "Limiter down: one fails open, one fails closed. On purpose." | Footage | 50–60 | 24–30 |
| 6 | "What about phones, or motion turned off?" | Split screen of Home: motion on and reduced motion. Then the phone layout. Optional, README only: the demo video with the network panel showing no YouTube requests until play | Footage | 60–68 | cut |
| 7 | "How do I know it always works?" | Real test names scroll by and turn green; the guide evaluation's case count and last nightly result; the Lighthouse medians from CI; a deploy | Remotion, from exported data, plus a short CI footage clip | 68–82 | 30–37 |
| 8 | (end card) | Name, site URL, GitHub; "This video is rendered from code" | Remotion | 82–90 | 37–40 |

The case study "Next project" link wraps from the last project to the first; it can serve as the transition into scene 8.

## Acceptance criteria

### M.1 Project and the local check
- `video/` holds a Remotion project with two compositions, `Readme` (1920×1080) and `LinkedIn` (1080×1350), both 30 fps, built from the same scene components with per-cut timings from one table in code (the Scenes table above).
- Colours, radii and shadows come from `tokens.json`; no colour is written by hand in a scene. Fonts load through `@remotion/google-fonts` with the three families above.
- Remotion Studio and a one-second test render are tried on this machine. The result (works, or blocked by Smart App Control) is written in the build notes, and the render route above follows from it.
- The site's `npm ci`, build, tests and Vercel deploy are unchanged.

### M.2 Data from the real system
- `video/scripts/export-retrieval.ts` runs `createSearcher` on the committed index for the chosen question and writes `video/data/retrieval.json`: the query terms, the top hits with `bm25`, `cosine` and fused `score`, the sources the answer cites, and `GUIDE_MODEL`.
- `video/scripts/export-numbers.ts` writes `video/data/numbers.json`: the number of eval cases (from `cases.ts`), the date and result of the last nightly evaluation, and the Lighthouse medians per URL from a CI report. Each value carries the date and the source it came from.
- `video/scripts/export-tests.ts` writes `video/data/tests.json`: the names of the tests that cover the edge cases, read from the test files (`it(`/`test(` titles) and checked against a passing CI run, so the montage shows only tests that exist and pass.
- No scene contains a number, score, test name or answer that isn't read from these files or from footage.

### M.3 Footage capture
- `video/capture/` holds one Playwright script per shot. Each starts a fresh browser context, sets the viewport (1920×1080, or a phone device for the phone shot) and writes to `video/public/footage/<shot>.webm` (git-ignored).
- Tile shots wait for `data-physics="running"` before any drag; throws and pokes are scripted mouse paths. Each script can record several takes; the best one is chosen by eye.
- Reduced-motion takes use the context's `reducedMotion: "reduce"`.
- The busy shot runs the build without `GROQ_API_KEY`. The limiter-down shot points `KV_REST_API_URL` at an unreachable host: the contact form still sends (a real email to Habib through Resend), and the guide shows the busy message.
- `video/capture/README.md` lists each shot, its environment variables and the command that records it.

### M.4 Scenes
- Each scene in the table is a component; each cut assembles them with its own timings. The LinkedIn cut drops scene 6.
- Every on-screen question and caption stays up for at least 0.5 s plus 1 s for every 3 words, and is at least 44 px tall at 1080 px wide. On the 4:5 cut, text stays out of the bottom 15% and keeps a 64 px margin, clear of LinkedIn's overlays.
- Nothing flashes more than three times a second over a large area (WCAG 2.3.1); the scramble and the tile flicker stay small.
- Music fades in and out; the video makes sense with the sound off.

### M.5 Render
- Both cuts render to MP4 (H.264, AAC). The README cut is at most 10 MB; if 1080p can't reach that at good quality, it renders at 1280×720.
- If rendering runs in CI: `video.yml` is `workflow_dispatch` only, downloads the footage release asset, runs the checks below, renders both cuts and uploads them as artifacts.

### M.6 Publish
- `README.md` shows the README cut near the top (a GitHub attachment), with one line of text saying what it shows, for anyone who can't play it.
- Habib posts the LinkedIn cut; the post text is drafted with it.
- The music licence is in `video/music/LICENSE.md`.

## Tests (written first)

- Unit (`video/`): the timing table gives each cut its target length (90 s ± 3, 40 s ± 2) and the LinkedIn cut has no scene 6; every caption meets the hold-time rule; every caption box sits inside the safe area of its cut.
- Unit (data scripts): `export-retrieval` on a fixed question returns hits sorted by fused score, each with `bm25` and `cosine`, and its cited sources are among the hits; `export-numbers` reads the eval case count from `cases.ts`; `export-tests` returns only titles that exist in the test files.
- Unit (tokens): scenes read colours from `tokens.json`; a check fails on a hard-coded hex colour in `video/src/`.
- Render smoke: `remotion still` renders one frame from the middle of every scene in both cuts without errors (locally or in `video.yml`).
- By hand: watch both cuts with sound off and on, on a phone and a laptop; check every number against its source file.

Unit tests run in `video/`'s own Vitest. If Smart App Control blocks Vitest there too, as it does in `portfolio-website/`, they run in `video.yml`.

## Order and dependencies

1. M.1 and M.2 can start now.
2. Final footage (M.3) waits for what it films to be final: case study content (7.3) and photos (7.5) for scene 2, and the guide's model choice (7.11) for the chat in scenes 2–4. Draft takes can be captured before then.
3. Music (7.12) goes in last.

## Done when

- Both cuts are rendered, watched by hand, and every number matches its source file.
- The README shows the video; the LinkedIn cut is ready for Habib to post.
- The roadmap marks M.1–M.6 done, and the decisions log has this spec's decisions.

## Build notes

(Filled in while building.)
