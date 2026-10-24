# Portfolio Redesign — Requirements

Oct 21, 2026 · @wasi

## Overview

The redesign turns the current single-page portfolio into a story-driven site that proves competence within 10 seconds and gives each project its own case study page.

These requirements come from three sources: the handwritten research notes (goals, audiences, research plan), the reference portfolios marked up in those notes, and a review of the live site at [portfolio-habib-wasi.vercel.app](https://portfolio-habib-wasi.vercel.app/) on 21 Oct 2026. Each requirement has an ID (G, A, S, C, V, P) so design and build decisions can point back to it. Items marked *(added)* are standard practice rather than something stated in the notes.

## Goals and primary action

The site exists to show the work, the story behind it and the thinking, and every page must lead to one chosen action.

| ID | Requirement |
| --- | --- |
| G1 | Showcase work, story and projects through storytelling that makes creativity, critical thinking and design sense visible. |
| G2 | Must not look like the generic, AI-made portfolios common online; layout, visuals and copy feel personal. |
| G3 | Pick ONE primary goal before design starts: job hunting, freelance leads or visibility. Content and calls to action follow from it. |
| G4 | Actions per visit, in order of weight: view a case study first, then download the CV, email or book a call. Every page leads to them. |
| G5 | Secondary actions (GitHub, LinkedIn) stay available but never compete visually with the primary action. |

Decided: the goals are job hunting and visibility; freelance leads are out of scope for now.

## Audiences

Four viewer groups read the site at different depths, so it needs a fast layer for skimmers and a deep layer for technical readers.

| ID | Viewer | How they read | What they need to find | Where the site serves them |
| --- | --- | --- | --- | --- |
| A1 | Recruiters | Skim fast, about 10 seconds | Quick proof of competence | Hero, featured projects, impact numbers |
| A2 | HR and tech leads | Slower, more technical | How problems were solved, trust signals, testimonials | Case study pages, QA record, testimonials |
| A3 | Potential clients (low priority: no freelance for now) | Problem-focused | Work relevant to their problems, trust signals | Project outcomes, testimonials, contact |
| A4 | Peers and other developers | Curious | Stack, code quality, process | Stack per project, GitHub links, architecture notes |

A5: every page works for A1 at a glance and lets A2 to A4 go deeper with one click.

## Site structure

S1: the home page puts featured work second, right after a short hero; the journey moves to an About page at the end of the flow. S2: every featured project opens its own case study page built from one shared template. S3: both end at the same primary action.

&#91;embedded content: site map · home page, case study template, primary action\]

Goals and actions follow the decisions in G3 and G4.

## Content requirements

Show the work early, keep text short, and let every project prove problem, role and impact.

### Hero and intro

- C1: Something real is visible in the first 3 seconds; the hero never waits on an animation to show the name and role.
- C2: The intro gives context in 20 words or less: who, what and where. No "Hi, I'm passionate about…" opener.
- C3: Work is reachable by second 3 to 5, either visible in the first scroll or one obvious click away.
- C4: Animated, expressive typography for the name and intro, so the hero feels alive rather than static, plus a personal illustration or character beside it, and real photos (from the aashishthakuri.com reference).\


**Decided:** the name enters with a staggered reveal, then settles through a text scramble, followed by one playful layer of physics letters with a material feel (shadows, squash on landing, slight rotation) and scramble on impact that starts only once the text is readable.

Enhancements considered for the physics letters (chosen: material feel and scramble on impact; the rest stay as options):

- Letters spring back: after a visitor scatters them, they snap back into your name on idle or click, so the name always ends readable.
- Scramble on impact: a letter flickers through random characters when hit, tying the scramble and physics together.
- Personal objects fall too: the small objects from V1 drop in with the letters and work as navigation.
- Skill words as debris: small tech words fall after the name; clicking one opens a project that uses it.
- Tilt to move gravity: on phones, tilting the device shifts the letters (needs a permission prompt on iPhone).
- Material feel: soft shadows, a slight squash on landing, a little rotation.
- Scroll handoff: as the visitor scrolls, the letters fall away and reveal Featured work.

Keep the letter count small, pause the physics when the hero is off screen, and show static text for reduced motion (P2, P4).

Approaches for the animated hero typography (C4). Pick one entrance effect plus at most one interactive effect:

| Approach | What the visitor sees | Effort | Watch out for |
| --- | --- | --- | --- |
| Staggered reveal | Letters or words slide, fade or unmask in one after another on load | Low (CSS or Motion) | Keep it under 1 second so the 3-second rule (P1) holds |
| Rotating word | One word in the intro cycles, e.g. "I build *search engines* / *IoT dashboards* / *desktop tools*" | Low | Lets a 20-word intro (C2) show several skills |
| Text scramble | Letters flicker through random characters, then settle into your name | Low to medium | Fits a developer identity; keep it short |
| Variable-font motion | Letter weight or width breathes, or reacts to the cursor | Medium (variable font + JS) | Needs a font with variable axes; add a touch fallback |
| Physics letters | Letters fall, pile up and can be pushed around (zandanizidan.com, V5) | Medium to high (e.g. Matter.js) | Start it after the text is readable, never before (P2) |
| Scroll-driven | The headline scales, splits or moves aside as you scroll into the work | Medium (GSAP or CSS scroll-driven animation) | Should hand off to Featured work, not delay it |

All options switch to static text for visitors who prefer reduced motion (P4).

### Projects and case studies

- C5: Show 2 to 3 strong projects, not every project.
- C6: Every project has its own page (from the VERSE reference).
- C7: Each case study runs problem → solution → impact and answers how, why, where and with whom.
- C8: Your role is stated plainly on every project ("I built…", not "we did").
- C9: Each project shows real or expected impact metrics.
- C10: Each project shows 3 to 5 final screens at most, not every sketch or wireframe.
- C11: Each case study shows the core of the architecture, for tech leads and peers (A2, A4): a high-level architecture diagram, a demo video, visuals of the product, test evidence (e.g. a video of the tests running), plus the stack and a link to the code.
- C12: Each case study ends with a path onward: next project or the primary action.

### Skills

- C13: Skills appear as icons in an orbit (from the "Skills in Orbit" reference), not a wall of tags.
- C14: Only list skills that at least one project or role proves.

### Experience and trust

- C15: Trust signals are visible on the home page: testimonials, ratings, recognitions.
- C16: The uTest QA record is condensed into one credibility line plus a link to the detail, not a block of eight numbers.
- C17: Experience and skills sit side by side in a clear layout (from the aashishthakuri.com reference).

### Journey

- C18: A visual journey line connects the points of your path so viewers feel connected to the story (your own idea, page 1 of the notes).
- C19: The journey line lives on a separate About page at the end of the flow, after the work.

### Contact

- C20: One primary call to action, repeated at the end of the home page and every case study.
- C21: CV available as a download *(added: the current site has none)*.

## Visual and interaction requirements

The look borrows from four reference portfolios and adds your own journey line; each idea must still serve the 10-second scan.

| ID | Requirement | Reference |
| --- | --- | --- |
| V1 | Navigation through small personal objects (e.g. instrument, headphones, keyboard) instead of a plain menu; each object opens a section. A plain text menu stays available as fallback. | [aashishthakuri.com](https://www.aashishthakuri.com/) |
| V2 | Expressive display typography for the name and headline. | aashishthakuri.com |
| V3 | A personal illustration or character in the hero, plus a small set of real photos. | aashishthakuri.com |
| V4 | Skills shown as icons orbiting a centre. | "Skills in Orbit" site (URL not noted) |
| V5 | Falling or physics effect on words, for the name or headline. | [zandanizidan.com](https://zandanizidan.com/) |
| V6 | Each project opens its own full page with a large hero visual and its write-up beside it. | VERSE project page (URL not noted) |
| V7 | A drawn journey line that connects the points of your path. | Your own idea |
| V8 | One consistent visual identity across home and case studies, distinct from generic templates (G2). | Your notes |

**Decided visual direction (21 Oct 2026):** light and editorial, recorded in the Habib Wasi Portfolio design system.

- Color: paper #f5f1e8 ground, ink #1c1a16 text, one vermilion accent (signal #c24018), cobalt #2b4acb for links and connections, a yellow marker highlight.
- Type: Fraunces for the name and headings, Instrument Sans for reading, IBM Plex Mono for labels and the text scramble.
- Hero motion: reveal, then scramble, then physics letters with a material feel.
- AI tools appear as dark ink tags, apart from languages and frameworks.

## AI-native showcase

The site must show that AI is part of how you build, always with you making the decisions, and name the tools concretely.

| ID | Requirement |
| --- | --- |
| AI1 | The hero intro says it: full-stack, mobile and RAG products, AI-native and test-driven. |
| AI2 | Home has a "How I build with AI" section with the agentic workflow: LangGraph planning → human review (HITL) → Claude Code and GitHub Copilot → TDD and k6 → CI/CD. |
| AI3 | An AI guide character is the site's only chat: it answers with a RAG pipeline over the site and CV, cites its sources, runs a 30-second tour and offers quick jumps (see AI guide). |
| AI4 | The skills orbit gets an AI ring: Claude Code, GitHub Copilot, LangGraph, RAG pipelines, vector embeddings, Llama 3.3. AI tools use dark tags so they read apart from languages. |
| AI5 | Every case study has an "AI in the build" section saying which tools did what and where you decided. |
| AI6 | Each AI keyword links to a project that proves it; no tool is named that you don't use. |

C22: a "More projects" list under the featured work links every other notable repository to GitHub (AI\_Workflow\_Global, Undershelf, Heat.IT, Deskinct, Medication Adherence App).

## AI guide

An animated "H" tile with eyes guides visitors around the site; it waits in the corner and only acts when invited.

| ID | Requirement |
| --- | --- |
| GD1 | Character: one of the hero's physics letter tiles, the vermilion "H", with two eyes; the H's crossbar is its mouth. Original design, never a face or a person. |
| GD2 | Five states move the whole body with squash and stretch: idle (breathes, blinks), listening (perks up, leans in), thinking (jelly wobble, eyes roll up), talking (bounces on each beat), pointing (hops to the target and nudges toward it). A click is a poke: a jelly wobble. |
| GD3 | Collapsed bottom-right on every page. Never opens by itself; after the first scroll it offers the 30-second tour once. |
| GD4 | Opened, it is a chat plus a "Jump to" row: Take the 30-second tour, Best project, AI workflow, Proof, Contact. Quick jumps work without typing. |
| GD5 | Answers come from a RAG pipeline over the site and CV (vector store, Llama 3.3 via Groq, serverless route), always with sources; it says "I don't know" when nothing fits. |
| GD6 | The model can call page tools: scroll\_to, open\_case\_study, highlight, play\_demo, start\_tour, download\_cv (asks first). The guide then hops to the target and points. |
| GD7 | Desktop: a 400 px side panel that reflows the page. Phone: a bottom sheet. |
| GD8 | Labelled "AI assistant"; speaks about Habib in the third person; closable, keyboard-operable, a plain chat for screen readers; reduced motion fades instead of hopping. |
| GD9 | Rate-limited, short answers, API key server-side only. Evaluate with RAGAS on about 20 recruiter questions. |

The design is in the Mockups canvas (character sheet, desktop, phone and a playable board) and in the Guide component of the design system.

## Performance, accessibility and technical

The creative effects are allowed only if the first view stays fast and the site works on every device.

- P1: The first view shows name, role and a route to the work within 3 seconds, before any animation finishes.
- P2: Orbit, falling-text and illustration effects load after the core content and never block scrolling or clicks.
- P3: Every page works on phone, tablet and desktop *(added)*.
- P4: Animations switch off for visitors who set reduced motion, and the object navigation (V1) has a keyboard and screen-reader fallback *(added)*.
- P5: Keep the current page title, description and social preview metadata, updated to the new intro *(added)*.
- P6: Each case study has its own URL so it can be linked from a CV, LinkedIn or a job application *(added)*.
- P7: Stack stays open; the current site uses Next.js and Tailwind CSS, which can carry all the requirements above.

## Things to avoid

The recruiter research names the patterns that lose attention; none of them goes into the redesign.

- An intro that opens with being "passionate about" something.
- Recapping the CV or LinkedIn profile on the home page.
- Long design-philosophy essays.
- A "my journey into tech" autobiography as text.
- Every sketch, wireframe or persona ever made.
- Generic process diagrams copied from articles.
- Many average projects in place of 2 to 3 strong ones.
- "We did" without saying what you did.

## Gaps in the current site

The live site has solid raw material (three projects with metrics, a strong QA record), but its structure breaks 13 of the requirements above.

| Current site | Problem | Breaks |
| --- | --- | --- |
| Intro: "Passionate about building scalable applications…" in about 25 words | The exact opener the research warns against, and over 20 words | C2 |
| Projects link only to GitHub repos | No case study pages, no problem → solution → impact, no screens | C6, C7, C10 |
| Team projects described as a whole | Your own role is not stated | C8 |
| Skills: 30+ tags incl. Java, C++, Spring Boot, MongoDB | Several are not proven by any listed project | C13, C14 |
| uTest section: eight separate numbers | Strong trust signal, but heavy to scan | C16 |
| "View My Projects" and "Get in Touch" side by side | Two competing actions | G4, C20 |
| No CV download, no testimonials | Missing proof for A1 and A2 | C15, C21 |
| Single page with About before Projects | Work sits below the bio | C3 |

Strongest starting point: Undershelf already has real metrics (80%+ test coverage, sub-second search, O(log n) lookup), so it should be the first full case study.

## Open decisions

The original seven decisions are made; two new ones came up with the AI guide.

- [x] Primary goal: job hunting and visibility; no freelance work for now (G3).
- [x] Actions: view a case study, download the CV, email, book a call (G4).
- [x] Journey line: lives on a separate About page at the end of the flow (C18, C19).
- [x] Animation budget: hero sequence is reveal → scramble → one playful layer; playful layer = physics letters with material feel and scramble on impact; must not break the 3-second first view (P1).
- [x] Designer references vs. developer audience: every case study carries architecture diagram, demo video, visuals and test evidence (C11).
- [x] Which 2 to 3 projects to feature from your GitHub: TopicTrail, Hop and Validation Portal; Undershelf moves to More projects (C5).
- [x] Testimonials: one from your team leader at Just Eat; more welcome later (supervisors, teammates, uTest feedback) (C15).\


* [ ] Name the AI guide, or keep it nameless (GD1).
* [ ] Confirm whether Claude Code and GitHub Copilot were used on Ridly, as the case study now says (AI5).

Project shortlist from your public GitHub, confirmed 21 Oct 2026. Featured three in order:

| Rank | Project | What it is | Why feature it | Still needed |
| --- | --- | --- | --- | --- |
| 1 | [Hop (HOP-KMP)](https://github.com/Habibwasi/HOP-KMP) | Carpooling app for Android and iOS: trips, bookings, MobilePay, real-time chat | Biggest scope (382 commits): mobile, backend and payments end to end | Your role on the team, screens, any user or test numbers |
| 2 | [Validation Portal](https://github.com/Habibwasi/Validation-Portal) | Startup validation tool: surveys, interviews, AI signal analysis | Live demo at [validation-portal.vercel.app](https://validation-portal.vercel.app), modern stack, 104 commits | 3 to 5 screens, a usage or impact number |
| 3 | [Undershelf](https://github.com/SP-SDU/Undershelf) | Book search and recommendation system | Real metrics already: 80%+ test coverage, sub-second search | Your part of the team work, screens |
| Alt | [AI\_Workflow\_Global](https://github.com/Habibwasi/AI_Workflow_Global) | LangGraph workflow that turns a feature idea into approved specs, 33 tests | Strong if you target AI or tooling roles | Demo or screenshots |

Update 21 Oct 2026: TopicTrail (bachelor project, RAG semantic search) now leads the featured three, followed by Hop and Validation Portal. Undershelf, AI\_Workflow\_Global, Heat.IT, Deskinct and MedicationAdherenceApp sit in the More projects list (C22).

## Remaining research tasks

Four research steps from the notes are still open; their findings may add or change requirements.

- [ ] Behavioral: watch or read UX teardown videos of recruiters reviewing portfolios.
- [ ] Competitive: collect 5 to 10 portfolios you admire; note their order (outcome first or process first) and what annoys you.
- [ ] Secondary sources: read a handful of articles and threads on what recruiters want to see in a portfolio.
- [ ] Job postings: read postings for your target role and put the skills they emphasize up front.

## References

- [Current portfolio](https://portfolio-habib-wasi.vercel.app/) (reviewed 21 Oct 2026)
- [aashishthakuri.com](https://www.aashishthakuri.com/): object navigation, typography, illustration, photos
- [zandanizidan.com](https://zandanizidan.com/): falling-word effect
- "Skills in Orbit" and VERSE project page: screenshots in the research notes, URLs not recorded
- [Lena Kul, LinkedIn post on the 10-second recruiter scan](https://www.linkedin.com/posts/lena-kul_recruiters-spend-around-10-seconds-with-your-ugcPost-7392527528696983552-2SsH/)
- Your research notes (PDF, 3 pages)

* [Habib Wasi Portfolio design system](https://claude.ai/artifact/P1shpLvwDNZziVVL3V3v4Y): tokens, components, Guide
* [Portfolio Mockups](https://claude.ai/artifact/QSRUEsagnBAdJSfNJBg4aD): Home, Hop case study, About, phone, AI guide
* TopicTrail PRD and CV (PDFs shared 21 Oct 2026)
* [HOP-KMP](https://github.com/Habibwasi/HOP-KMP), [Validation-Portal](https://github.com/Habibwasi/Validation-Portal), [AI\_Workflow\_Global](https://github.com/Habibwasi/AI_Workflow_Global)
