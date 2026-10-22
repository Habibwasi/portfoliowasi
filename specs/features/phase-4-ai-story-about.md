# Spec: Phase 4 — AI story, proof and About

Roadmap items 4.1–4.4 · Status: done (closed 2026-10-22; CI, guide eval and Vercel pass on `redesign`, commit `1063fa4`) · Branch `phase-4-ai-story-about`, merged into `redesign`

## Goal

Give Home the two sections it still lacks, and give the site its last page. "How I build with AI" shows the workflow behind the work, with every AI tool linked to a project that proves it. A Stack row lists only skills a project proves, and each one says where. The About page holds the journey and the full QA record, at the end of the flow, after the work.

Home becomes: hero → selected work → how I build with AI → proof → stack → contact (tech stack, "Pages").

Missing content (photos, the testimonial) stays a visible, labelled placeholder until Phase 7. Nothing is invented to fill a gap.

## Out of scope

- The skills orbit with its AI ring (5.3). This phase ships the tag row it will replace on desktop; the "where I used it" panel stays.
- Hand-drawn objects, the hero illustration and real photos (5.4, 5.5, 7.5).
- The testimonial's words and name (7.4). The `Testimonial` component and its placeholder already exist (1.7), and the guide indexes the quote once it is real (3.3). 4.2 needs no new code, so it moves to 7.4, like 1.13 did.
- The CV PDF (7.1). About's CV button is a placeholder until then, like every other CV button.

## Sources for the facts

| Fact | Source |
| --- | --- |
| Workflow: LangGraph planning → human review → Claude Code and GitHub Copilot → TDD and k6 → CI/CD | AI2; mockup "02 / How I build with AI"; Ridly case study |
| Journey dates and lines (Upwork Jan 2023, uTest Jun 2024, Just Eat Feb 2025, Validation Portal Mar 2026, Ridly Apr 2026, TopicTrail Sep 2026, graduation Jan 2027) | Mockup "About · journey". Checked by Habib in 7.5 |
| "BSc in Software Engineering at SDU in Sønderborg", "91% on time" at Just Eat | Mockup "About · journey". Checked by Habib in 7.5 |
| QA record numbers | Decisions log: 92.26% Silver, 268 cycles, 46 issues, 234 cases, 100 products (overrides the mockup's 91.8%) |
| Which project proves which skill | `projects.ts`, the case studies, `/guide` and this repo |

## Decisions made in this spec

| Question | Decision | Why |
| --- | --- | --- |
| One list of skills | `src/content/skills.ts` holds every skill once: name, kind (`ai` or `tech`) and its proofs (title, link, one line). The AI toolkit in 4.1 and the Stack row in 4.3 both read it | AI6 and C14 are the same rule ("only what a project proves"); one list keeps them from drifting apart, and the orbit (5.3) reads it later. |
| AI toolkit | Claude Code, GitHub Copilot, LangGraph, Human-in-the-loop, RAG pipelines, Vector embeddings, Cosine similarity, Prompt engineering, GPT-OSS via Groq. Each tag links to its first proof | The mockup's list minus Llama 3.3 (shut down, decisions log) and RAGAS (replaced by the TypeScript eval, decisions log). "GPT-OSS via Groq" is what Validation Portal and the guide actually call. |
| This site as a proof | `/guide` and the repo count as proof (RAG, embeddings, cosine, Claude Code, TDD, Next.js) | The decisions log makes this site's test-first build and CI the main proof of "test-driven"; the guide is a working RAG pipeline. |
| TopicTrail as a proof | Allowed for RAG and embeddings, worded as "planned" | It is labelled in progress everywhere (mission, "Honest about what's unfinished"). |
| Stack interaction | Tags are toggle buttons (`aria-pressed`) in two groups, "AI tools" and "Languages and frameworks". One is selected at a time; a panel under the row lists its proofs. The first AI tool is selected on load, so the server-rendered page already shows one panel | Mockup "Pick one to see where I used it". A skill with three projects can't be a single link. |
| Home proof → About | Home keeps the one-line QA record and adds "See the full record" → `/about#qa-record` | Mockup; C17 reinterpretation (experience on About). |
| Section numbers | 01 Selected work, 02 How I build with AI, 03 Proof from others, 04 Stack, 05 Contact | Mockup order. |
| Journey layout | An ordered list. Desktop (≥ 1024 px): a horizontal cobalt line with dots, entries alternating above and below. Narrower: a vertical line on the left. The last entry (graduation) has a hollow dot: it hasn't happened yet | V7, mockup. A list reads in order for screen readers; the line is decoration. |
| Journey links | uTest → `#qa-record`; Validation Portal, Ridly and TopicTrail → their case studies | Connects the story back to the work (C18). |
| Guide | "AI workflow" jump → `/#ai`. New chunks: "How I build with AI", "Skills" and "Journey"; the QA record chunk points to `/about#qa-record`. The tour stays at 5 stops | The Phase 3 jump was a stand-in until `#ai` existed. A sixth stop would push the tour past 30 seconds. |

## Acceptance criteria

### 4.1 How I build with AI (`#ai` on Home)
- `AiWorkflow` section after Selected work: eyebrow "02 / How I build with AI", h2 "AI-native, human in charge", and the mockup's subline.
- The diagram is an ordered list of five steps with a name and one line each: **Plan** (LangGraph agents clarify, scope and write specs), **Human review** (I approve or reject every step, HITL), **Build** (Claude Code and GitHub Copilot, reviewed by me), **Test** (TDD, k6 load and stress tests), **Ship** (CI/CD tests and builds every push). Human review has the signal border. A "rejected: revise" loop runs from Human review back to Plan. Arrows and the loop are `aria-hidden`; the loop is also said in text for screen readers.
- Desktop: one row of five boxes with arrows, on `paper-raised`. Phone: a vertical stack with down arrows; no horizontal scroll.
- "AI toolkit I use every week": the AI skills from `skills.ts` as dark tags (`hw-tag--ai`), each a link to its first proof. Then the closing line: "AI drafts, I decide. Every AI-written change goes through my review, tests and CI before it ships. Questions? The guide in the corner knows the whole site."
- No AI tool is named on the site that isn't in `skills.ts` or a project's `aiTags` (AI6).

### 4.2 Testimonial
- Moves to 7.4. Nothing new is built in this phase.

### 4.3 Stack (`#stack` on Home)
- `Stack` section after Proof: eyebrow "04 / Stack", h2 "Shipped stack, AI-native toolkit", subline "The languages, frameworks and AI tools behind the projects above. Pick one to see where I used it."
- Two labelled groups of toggle buttons, AI tools (dark tags) and languages and frameworks. Selecting one shows "Selected · <skill>" and its proofs: title (a link) and one line each.
- Every skill has at least one proof (C14). Every proof link is a published page or anchor on the site, or a project's own code link.
- Keyboard: Tab reaches each button, Enter or Space selects it. The panel is `aria-live="polite"`.

### 4.4 About page (`/about`)
- Header: eyebrow "About", h1 "The path so far", the intro paragraph from the mockup.
- Three photo slots with captions, all placeholders ("Photo 1"… and "Photo 1 caption: where, when"…), listed under 7.5.
- `#journey`: eyebrow "Journey", h2 "Each step led to the next", and the seven entries from the sources table (date, title, one line), with the links from the decisions table. "Ridly (Hop)" is "Ridly". 
- `#qa-record`: "QA record", "uTest by Applause, June 2024 to now", the description line, and five metrics: 92.26% rating, 268 test cycles, 234 test cases run, 100 products tested, 46 issues reported.
- Closing: "The full story, on paper", Download CV (placeholder until 7.1) and Email me.
- Nav: Work, About, CV (once supplied), Contact. About is `aria-current="page"` on `/about`.
- Metadata: title "About", own description, canonical, OG and Twitter; its own OG image; in the sitemap; Lighthouse on phone measures it.

## Tests (written first)

- Unit (`skills`): every skill has a proof; proof hrefs are a published case study (and section), `/guide`, a Home or About anchor, the repo, or a project's code link; no Llama, RAGAS or "Hop" anywhere in the content; the AI toolkit is exactly the decided nine.
- Unit (`about`): journey entries are in date order, the last one is graduation, none says "Hop"; QA numbers match `qaRecord`.
- Unit (guide): the index has the new chunks and isn't stale; the "AI workflow" jump is `/#ai`; QA record chunk points to `/about#qa-record`.
- Component: `AiWorkflow` renders five steps in order, Human review mentions HITL, toolkit tags are links; `Stack` selects the first AI tool on load, switches panels on click and keyboard, `aria-pressed` follows; `Proof` links to `/about#qa-record`; About renders one h1, the journey list of seven, the five metrics and the placeholders; the nav shows About.
- E2E (desktop and phone): Home has `#ai` and `#stack` in order after `#work` and `#proof`; nav → About → journey → Ridly; Stack pick → proof link works; `/about` has no horizontal scroll and no axe violations; `/about/opengraph-image` is a PNG; the sitemap lists `/about`.
- Eval: one new case, "Where has he worked before?", answered from the journey.

## Done when

- All of the above pass locally and in CI on `redesign`, and the Vercel preview builds.
- The roadmap marks 4.1, 4.3 and 4.4 done and 4.2 moved to 7.4; 7.5 lists the photos and the journey facts to check.
