# Spec: Phase 2 — Ridly case study

Roadmap items 2.1–2.3 · Status: done locally (2026-10-22); CI on `redesign` once merged; missing content tracked in roadmap 7.3 · Branch `phase-2-ridly`, merged into `redesign`

## Goal

Publish the third case study, Ridly, the strongest evidence for "full-stack and mobile, with numbers". Give every case study its own social preview set in Fraunces, so a link pasted into LinkedIn or an application looks like the site. Add a video player that costs nothing until someone presses play.

Missing content (problem text, decisions, screens, demo and test-run videos, the architecture diagram) stays a visible, labelled placeholder until Phase 7. Nothing is invented to fill a gap.

## Out of scope

- Ridly content that only Habib can supply: the problem text, the decisions behind "What I built", a concrete example of correcting AI output, 3–5 screens, the demo and k6 recordings, the architecture diagram. They are listed in roadmap 7.3.
- Uploading videos to YouTube and writing their captions (content, Phase 7). 2.3 builds the player, so a video only needs its ID.
- The "How I build with AI" section on Home (4.1). Ridly's "AI in the build" links to nothing new yet.

## Sources for the facts

Everything on the page comes from the [HOP-KMP repository](https://github.com/Habibwasi/HOP-KMP) (README, `Agent.md`, `.github/`, `apps/api/k6/`, Prisma migrations, CI workflow; checked 2026-10-22) or from the roadmap's decisions log:

| Fact | Source |
| --- | --- |
| Built solo, 387 commits, first commit April 2026 | Commit history; decisions log |
| Android (Compose Multiplatform) and iOS (SwiftUI) over one shared KMP module: domain, Ktor repositories, MVI ViewModels, Koin | README, `Agent.md` |
| NestJS 11 API, Prisma + PostgreSQL, Supabase auth, Socket.IO chat, BullMQ push notifications, Sentry on all three apps | README tech stack |
| Trip origins and destinations stored as PostGIS geography points with spatial indexes | Migration `20260522130000_add_postgis_geography` |
| Passengers pay drivers directly with MobilePay; settlement tracking, mutual ratings, driver tax dashboard and report, saved search alerts | README modules and screens |
| k6: ramp 300 → 600 → 1,500 virtual users; trip search p95 96 ms at the 300 stage | Decisions log (always state "p95" and the stage) |
| k6 failure test: bad input, broken tokens, unknown IDs and a 50 requests/s burst on search; fails on any 5xx | `apps/api/k6/README.md` |
| CI runs the shared module's unit tests and builds the Android and iOS apps, on pushes and PRs to `main` | `.github/workflows/ci.yml` |
| Claude Code works from `Agent.md`, which records the architecture decisions and tells the agent to stop and ask when a request conflicts with them; Copilot has a Ridly bug-audit skill | `Agent.md`, `.github/copilot-instructions.md` |
| Planned with the LangGraph workflow (AI_Workflow_Global) with a human-in-the-loop gate | Decisions log, project card |

## Acceptance criteria

### 2.1 Ridly case study (`/work/ridly`)
- `projects.ts`: Ridly gets `caseStudyReady: true`. Its card on Home becomes a link to `/work/ridly`, and "Case study coming" no longer appears anywhere on Home.
- `src/content/case-studies/ridly.ts`, typed `CaseStudy`, in the fixed order (problem → my role → AI in the build → solution → architecture → test evidence → impact).
- Header: "Case study 02 / 03 · Mobile + backend · AI workflow". Facts row: My role "Built solo", Started "April 2026", Platforms "Android and iOS", Commits "387".
- **My role** says "built solo" and names the four parts he built (shared KMP module, Android app, iOS app, NestJS API). His decisions are placeholders.
- **AI in the build** names LangGraph planning with the HITL gate, Claude Code and GitHub Copilot, says what each did, and says where he stays in charge (`Agent.md` rules). A concrete "where I corrected the AI" example is a placeholder. No other AI tools are named.
- **Solution** describes the rider and driver flows from the README. At most 5 screens (C10), placeholders until supplied.
- **Architecture** describes the shared KMP module, MVI, the NestJS backend and PostGIS. The diagram is a placeholder.
- **Test evidence** states the k6 ramp and the p95 with its stage, the failure test, and what CI runs. It has a test-run frame (C11), a placeholder until the recording exists.
- **Impact** metrics: "96 ms" trip search p95 (note: at 300 virtual users, in a k6 ramp to 1,500), "1,500" peak virtual users, "387" commits built solo, "2" platforms from one Kotlin codebase. Stack tags and the code link to HOP-KMP.
- "Next project" order becomes TopicTrail → Ridly → Validation Portal → TopicTrail.
- `/work/ridly` is in the sitemap and is statically generated.

### 2.2 Per-page OG images
- Fraunces SemiBold and Regular, and IBM Plex Mono Medium for the label, as static TTF files in `public/fonts/`, with their OFL licences beside them.
- `src/app/work/[slug]/opengraph-image.tsx`, 1200×630 PNG, paper and ink: the case study eyebrow in Plex Mono, the project title in Fraunces SemiBold, the context line in Fraunces Regular, and the "H" tile with the name. Statically generated for each published case study.
- The default image (`src/app/opengraph-image.tsx`) uses the same Fraunces files and the same layout helper.
- Each case study page sets its own `twitter` title and description (until now it inherited the site's), and its `og:image` points at its own image.

### 2.3 Video facade
- A `VideoFacade` client component for `demo` and `test-run` media whose `src` is a YouTube ID.
- Before the click: a poster (the item's optional `poster` image under `/public`, or a plain paper poster when there is none), a play mark and the caption. Nothing loads from YouTube or Google: no iframe, no thumbnail.
- It is a link to the video on YouTube, so it still works without JavaScript. With JavaScript, the click is intercepted and the iframe replaces the poster.
- The iframe uses `https://www.youtube-nocookie.com/embed/<id>` with captions on (`cc_load_policy=1`, `cc_lang_pref=en`), `autoplay=1`, `rel=0`, `playsinline=1`, a `title`, and receives focus.
- Accessible name: "Play video: <caption>". Keyboard operable (Enter on the link).
- Video IDs are validated in content tests (11 characters, `[A-Za-z0-9_-]`).
- No CSP change: `frame-src` already allows `www.youtube-nocookie.com`.

## Tests (written first)

- Unit (`case-studies`): exactly the three featured projects are published, in featured order; Ridly has every section; Ridly states "built solo", "p95" and "300" together; Ridly names only Claude Code, GitHub Copilot and LangGraph as AI tools (no Llama, no "Hop"); Ridly has a test-run frame; "Next project" cycles TopicTrail → Ridly → Validation Portal → TopicTrail; every non-placeholder video `src` is a valid YouTube ID.
- Component: Ridly renders with one `h1`, "Case study 02 / 03", the facts row and the code link; the Ridly card on Home is a link and "Case study coming" is gone; `VideoFacade` renders a YouTube link with no iframe, then on click renders a `youtube-nocookie.com` iframe with captions on and focus inside; it uses the poster when given.
- E2E (desktop and phone): Home → Ridly card → `/work/ridly` → Next project → Validation Portal; `/work/ridly` has no horizontal scroll and no axe violations; `/work/ridly/opengraph-image` is a PNG; each case study's `og:image` and `twitter:title` are its own; the sitemap lists `/work/ridly`.
- Lighthouse on phone also measures `/work/ridly`.

## Done when

- All of the above pass locally and in CI on `redesign`.
- The roadmap marks 2.1–2.3 done, with the missing Ridly content in 7.3.
