# Roadmap

Last updated: 2026-10-22 (Phases 0–3 done; Phase 4 next)

The rebuild ships in phases. Each phase leaves the site deployable. Phase 1 replaces the live site with something better on every count; later phases add depth and delight. Every feature gets its own spec under `specs/features/` before it's built, with tests written first. IDs in brackets point back to the [requirements](../../Portfolio%20Redesign%20—%20Requirements.md).

Status: `planned` · `specced` · `in progress` · `done`

## Branches and deployment

- `main` is production (the live site). It stays unchanged until the whole redesign is done.
- `redesign` collects every phase. Vercel builds it as a **preview** deployment with its own URL; CI runs on every push to it.
- Each phase is built on its own branch (`phase-1-launch`, `phase-2-…`) and merged into `redesign`.
- After Phase 7, one PR merges `redesign` into `main`, and that is the production launch.

## Phase 0: Foundation · done

Get the codebase ready to build on: tokens, content layer, tests, CI.

| # | Feature | Refs | Status |
| --- | --- | --- | --- |
| 0.1 | Clean up dependencies: upgrade Next.js 16.1 → 16.4; replace `framer-motion` with `motion` (`LazyMotion`); remove `next-themes`, the theme toggle, `nodemailer` and the dark palette | P7 | done |
| 0.2 | Every design token in Tailwind `@theme`, the type styles, and the fonts (only Fraunces preloaded) | V2, V8 | done |
| 0.3 | Typed content layer: `projects.ts`, `case-studies/<slug>.ts`, `site.ts`, stable section anchors, and the `Placeholder` component | — | done |
| 0.4 | Base components from the design system: Button, Tag (incl. `--ai`), Metric, MediaFrame, ProjectCard, Testimonial | V8 | done |
| 0.5 | Tests: Vitest + Testing Library, Playwright + axe, Lighthouse CI with the first-view budget, and a `test` script | P1 | done |
| 0.6 | GitHub Actions CI on every push and PR; `.env.example`; static CSP header; Upstash set up | — | done |
| 0.7 | Site shell: header with the text nav (Work, About, CV, Contact); footer with GitHub and LinkedIn kept secondary, plus the repo and CI badge; reduced-motion handling; focus ring | G5, P3, P4 | done |
| 0.8 | Fix the outdated design system pages: ProjectCard order, "Justit" → Just Eat, "Hop" → Ridly in samples, Llama 3.3 out of the AI ring, Testimonial placement | V8 | done |

## Phase 1: Launch · done (closed 2026-10-22)

The smallest site that passes the 10-second scan and lets a tech lead click into real work.

| # | Feature | Refs | Status |
| --- | --- | --- | --- |
| 1.1 | Hero, static: name, role line, 20-word intro, availability line, "View case studies" (primary) and "Download CV" | C1–C3, AI1 | done |
| 1.2 | Featured work in this order: TopicTrail (labelled "Bachelor project · in progress · due Jan 2027"), Ridly, Validation Portal. The Ridly card says "Case study coming" until 2.1 ships. | C5, S1 | done |
| 1.3 | More projects: AI_Workflow_Global, Undershelf, Heat.IT, Deskinct, Medication Adherence App. Links and claims follow the facts table below. | C22 | done |
| 1.4 | Case study template at `/work/[slug]`: title and context line, problem, my role, AI in the build, solution (screens, demo), architecture, test evidence, impact, stack, code link. It ends with the same primary action as Home, "Next project" (S3). | S2, S3, C6–C12, AI5, V6 | done |
| 1.5 | **TopicTrail** case study, in progress: problem, architecture diagrams, planned RAG pipeline (keyword + semantic search), evaluation plan, dated progress notes; screens and demo shown as placeholders | C6–C11 | done (content in Phase 7) |
| 1.6 | **Validation Portal** case study with the real demo video, architecture diagrams, screens and live demo link | C6–C11 | done (content in Phase 7) |
| 1.7 | Proof, minimal: one-line uTest QA record (Silver, 92.26%, 268 test cycles, 46 issues reported) and a testimonial placeholder for the Just Eat team leader | C15, C16 | done (content in Phase 7) |
| 1.8 | Contact section: "Have a role in mind?", Email me (mailto), Download CV and Book a call (Calendly) as secondary buttons. The form sits below on `paper-raised`, and its submit button is the one primary on that screen. | C20, C21, G4 | done |
| 1.9 | Contact form that works: Zod validation, escaped email body, Resend error check, `replyTo`, honeypot, rate limit, pending/success/error states | G4 | done |
| 1.10 | CV PDF in `public/cv/` | C21 | done (content in Phase 7) |
| 1.11 | Metadata: new title and description, `metadataBase`, default OG image, sitemap, robots | P5 | done |
| 1.12 | Phone layout for all of the above. The phone contact section shows all three actions. | P3 | done |
| 1.13 | Profiles to match (outside the codebase) | — | moved to 7.6 |

**Done when:**
- Playwright passes Home → case study and Home → contact → CV.
- The name is visible on first paint.
- Lighthouse on phone: LCP under 2.5 s, CLS under 0.1. Switch the LCP assertion in `lighthouserc.json` from "warn" back to "error" (it is a warning only while the old sections remain).
- axe reports no violations.

Then it is reviewed on the `redesign` branch's Vercel preview. Production waits: `redesign` merges into `main` only after Phase 7 (see "Branches and deployment" below).

## Phase 2: Ridly case study · done (closed 2026-10-22)

Spec: [phase-2-ridly.md](../features/phase-2-ridly.md)

| # | Feature | Refs | Status |
| --- | --- | --- | --- |
| 2.1 | **Ridly** case study: built solo; architecture; k6 evidence (ramped 300 → 600 → 1,500 virtual users, trip search p95 96 ms at the 300 stage); AI in the build (LangGraph planning, HITL, Claude Code and GitHub Copilot); screens and demo | C6–C11, AI5 | done (content in Phase 7) |
| 2.2 | Per-page OG images with Fraunces TTF | P6 | done |
| 2.3 | Video facade: YouTube privacy-enhanced embed, poster, captions, loads on click | C11, P2 | done (videos in Phase 7) |

## Phase 3: AI guide (useful first, animated later) · done (closed 2026-10-22)

Spec: [phase-3-guide.md](../features/phase-3-guide.md)

| # | Feature | Refs | Status |
| --- | --- | --- | --- |
| 3.1 | Collapsed "H" tile on every page, with CSS idle and blink only. The panel loads on first interaction. | GD1, GD3 | done |
| 3.2 | Panel without the model: header labelled "AI assistant"; "Jump to" row (tour, best project, AI workflow, proof, contact); 30-second tour; one-time tour offer after the first scroll; 400 px side panel on desktop, bottom sheet on phones; closable, keyboard-operable, a plain chat for screen readers | GD3, GD4, GD7, GD8 | done |
| 3.3 | RAG chat: build-time JSON index, `gte-small` embeddings, hybrid search, `gpt-oss-120b` on Groq, sources on every answer, "I don't know" fallback, third-person voice, per-IP and daily limits, "busy" state | GD5, GD9, AI3 | done (live answers need the Groq keys, 7.8) |
| 3.4 | Guide evaluation: about 20 recruiter questions, citation and refusal checks (tool checks arrive with 5.6), run nightly on a separate key | GD9 | done (answers run once `GROQ_EVAL_API_KEY` is set, 7.8) |
| 3.5 | "How this guide works" link to its architecture | AI6 | done |
| 3.6 | Search-only fallback: when the guide is busy (limit, no key, Groq error) it still says so, and lists the parts of the site that match the question, with links and excerpts | GD5 | in progress |

## Phase 4: AI story, proof and About

| # | Feature | Refs | Status |
| --- | --- | --- | --- |
| 4.1 | "How I build with AI": AIWorkflow diagram (Plan → HITL → Build → Test → Ship), and AI toolkit tags, each linked to a project that proves it | AI2, AI6 | planned |
| 4.2 | Testimonial with the real quote, name and role, once supplied | C15 | planned |
| 4.3 | Skills as a tag row, each tag linked to the projects that use it (the orbit comes in Phase 5) | C13, C14, AI4 | planned |
| 4.4 | About page: short intro, photos (placeholders), the journey line (Upwork → uTest → Just Eat → Validation Portal → Ridly → TopicTrail → graduation), full QA record, CV and email | C18, C19, V3, V7 | planned |

C17 (experience and skills side by side) is reinterpreted: experience lives on About, and skills on Home link to it.

## Phase 5: Delight (after launch)

| # | Feature | Refs | Status |
| --- | --- | --- | --- |
| 5.1 | Name animation: staggered reveal → text scramble, animating from visible, starting after `load` | C4, P1 | planned |
| 5.2 | Physics letters (Matter.js, lazy): material feel, scramble on impact, one vermilion tile, paused offscreen, off for reduced motion | C4, V5, P2, P4 | planned |
| 5.3 | Skills orbit with an AI ring, replacing the tag row on desktop | C13, V4, AI4 | planned |
| 5.4 | Object navigation with hand-drawn objects next to the text menu | V1, P4 | planned |
| 5.5 | Hero illustration and photo slots | V3 | planned |
| 5.6 | Guide: five squash-and-stretch states, the poke, and the page tools (`scroll_to`, `open_case_study`, `highlight`, `play_demo`, `start_tour`, `download_cv`) with hop-and-point; reduced motion fades | GD2, GD6, GD8 | planned |

## Phase 6: Polish

| # | Feature | Refs | Status |
| --- | --- | --- | --- |
| 6.1 | Full accessibility pass: keyboard, screen reader, reduced motion, contrast | P4 | planned |
| 6.2 | Analytics for case study views, CV downloads and Calendly clicks (tool per the open decision) | G4 | planned |
| 6.3 | Rewrite the repo README (it still describes Nodemailer and the old sections) | — | done (Phase 0) |

## Phase 7: Content handover (last)

Every phase before this one builds with visible placeholders. Habib supplies the real content and assets at the end, in one pass, and each placeholder is swapped for the real thing. `listPlaceholders()` lists what is still missing; the phase is done when it returns nothing on the published pages.

| # | Item | Where it goes | Status |
| --- | --- | --- | --- |
| 7.1 | CV PDF, plus the same text for the guide's index | `public/cv/Habib-Ahmed-Wasi-CV.pdf`, then `site.cv` in `src/content/site.ts` (the CV buttons and nav item appear); the guide's index (3.3) | open |
| 7.2 | Calendly URL | `NEXT_PUBLIC_CALENDLY_URL` in Vercel and `.env.local` | open |
| 7.3 | Case study content: TopicTrail (role, problem, AI in the build, architecture diagrams, evaluation plan, dated progress notes, screens); Validation Portal (role, problem, AI in the build, demo video, screens, architecture diagram); Ridly (problem text, "what I built" decisions, one concrete example of correcting AI output, 3–5 screens, demo video, k6 run recording, the real architecture diagram). Videos go on YouTube with English captions; only the video ID goes in the content, plus an optional poster image | `src/content/case-studies/`, media in `public/work/<slug>/` | open |
| 7.4 | Testimonial: quote, name and role of the Just Eat team leader, with their permission | `testimonial` in `src/content/site.ts` (closes 4.2) | open |
| 7.5 | Photos with captions, line-art portrait, drawings of your own objects; journey dates checked | About page (4.4), hero (5.5), object nav (5.4) | open |
| 7.6 | Profiles to match (outside the codebase): same headline on CV, LinkedIn and GitHub; pinned repos match the featured three; GitHub profile README; fix or remove the dead Deskinct link | — | open |
| 7.7 | Role text for the More projects (Undershelf, Deskinct, Medication Adherence App) | `src/content/projects.ts` | open |
| 7.8 | Groq API keys: `GROQ_API_KEY` for the guide, and `GROQ_EVAL_API_KEY` from a separate Groq organisation (limits are per organisation) for the nightly evaluation | Vercel env and `.env.local`; GitHub Actions secret `GROQ_EVAL_API_KEY`. When adding to Production, check `VERCEL_SUPPORT_LARGE_FUNCTION=1` is there too (set for Preview on 2026-10-22) | open |

## Later (not scheduled)

- Calendly popup instead of the plain link
- Rive version of the guide character
- More testimonials (supervisors, teammates, uTest feedback)
- Physics extras: letters spring back, skill words as debris, tilt-to-move on phones
- Move TopicTrail's case study from "in progress" to complete once it has a demo and real retrieval numbers (around January 2027)

## Decisions log

| Date | Decision | Overrides |
| --- | --- | --- |
| 2026-10-21 | Goals: job hunting and visibility; no freelance | — |
| 2026-10-21 | Light "Paper" theme only; no dark mode | Current site |
| 2026-10-21 | Contact form stays and must work; Email me → personal mail; CV as a PDF on the site; Book a call → Calendly | Mockup (no form) |
| 2026-10-21 | Featured order: TopicTrail, Ridly, Validation Portal; others under More projects | Design system ProjectCard README |
| 2026-10-21 | TopicTrail is shown as in progress (architecture only); Validation Portal is complete | — |
| 2026-10-21 | Product name "Ridly" (repo HOP-KMP keeps its name) | Earlier draft "Hop" |
| 2026-10-21 | Ridly was built solo (all 387 commits) | Mockup "[Team size]" |
| 2026-10-21 | Claude Code and GitHub Copilot were used on Ridly | Open decision in requirements |
| 2026-10-21 | The AI guide stays nameless | Open decision in requirements |
| 2026-10-21 | Guide model: `openai/gpt-oss-120b` on Groq; Llama 3.3 is no longer offered and is removed from the site | AI3, AI4, GD5 |
| 2026-10-21 | RAG index as JSON in the repo; no Supabase or pgvector | Mockup character sheet |
| 2026-10-21 | TypeScript eval script instead of RAGAS | GD9 |
| 2026-10-21 | Keep "test-driven"; this site's test-first build and CI are the main proof | — |
| 2026-10-21 | Availability: Kolding, open to roles now, full-time from February 2027, learning Danish; work permit not stated | — |
| 2026-10-21 | Effects (physics, orbit, object nav, guide states) ship after launch | Animation budget timing |
| 2026-10-21 | uTest rating 92.26% Silver | Mockup 91.8% |
| 2026-10-21 | uTest counts: 268 cycles, 46 issues, 234 cases, 100 products | Current site (older numbers) |
| 2026-10-21 | Ridly k6 figure is p95 96 ms at the 300-VU stage | — |
| 2026-10-21 | Testimonial from the Just Eat team leader | Design system "Justit" |
| 2026-10-21 | Stay on Vercel Hobby | — |
| 2026-10-21 | All content and assets (CV, Calendly, case study material, testimonial, photos, profiles) are supplied at the end, in Phase 7; placeholders stay until then | Per-feature "once supplied" |
| 2026-10-21 | No production deploy until every phase is done: phases collect on `redesign` (Vercel preview); `main` is merged after Phase 7 | Phase 1 "deploy to production" |
| 2026-10-22 | The guide's index is committed (`src/generated/guide-index.json`) and rebuilt with `npm run guide:index`; a unit test catches a stale index | Tech stack "written at build time" |
| 2026-10-22 | The guide's "Best project" jump goes to Ridly; "AI workflow" goes to Ridly's "AI in the build" until 4.1 adds `#ai` on Home | — |
| 2026-10-22 | `GROQ_EVAL_API_KEY` must come from a separate Groq organisation, because Groq's limits are per organisation | Tech stack "separate key" |
| 2026-10-22 | `VERCEL_SUPPORT_LARGE_FUNCTION=1` is set in Vercel: the preview deployment failed on the size of `/api/guide` (ONNX runtime) despite tracing only the Linux binary | Phase 3 "58 MB, far under 250 MB" |

## Open decisions

- [ ] Analytics for custom events: Umami or Plausible (Vercel custom events need Pro). Decide in Phase 6.

## Content and assets to supply

All of it is collected in [Phase 7: Content handover](#phase-7-content-handover-last), done last. Until then each item is a visible placeholder in the build.

## Facts to check before they go on the site

| Item | Mockup or live site says | Repos show | Fix |
| --- | --- | --- | --- |
| Ridly commits | 382 | 387, all his | Use the current count, with "built solo" |
| Ridly k6 | "96 ms trip search" | Ramp 300 → 600 → 1,500 VUs; p95 96 ms at 300 | Always state "p95" and the stage |
| Validation Portal commits | 104 | 111 | Use the current count |
| Validation Portal model | Llama 3.3 via Groq | Groq `gpt-oss-20b` | Name `gpt-oss-20b` |
| Validation Portal tests | — | No tests or CI | Evidence is the live demo, video and diagrams; no TEST RUN frame (a C11 exception) |
| uTest rating | Mockups 91.8% | 92.26% Silver | 92.26% (decided) |
| uTest counts | Current site: 146 cycles, 30 issues, 131 cases, 57 products (older) | Mockups: 268 cycles, 46 issues, 234 cases, 100 products | Use the mockup numbers (decided) |
| Undershelf | 80%+ coverage, PostgreSQL, sub-second search | No coverage config, SQLite, team repo (6 of 147 commits his) | Drop the unproven claims and state his part |
| Heat.IT | Team project | 1 of 143 commits his | State his module (Asset Manager) |
| Deskinct link | github.com/Adymr/Desk-SemesterProject | 404 | New link, or list without a link |
| TopicTrail, Medication Adherence App | GitHub links | No public repos | Make them public, or show them without a link |
