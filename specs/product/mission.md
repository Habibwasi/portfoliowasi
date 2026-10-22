# Mission

Last updated: 2026-10-21 · Owner: Habib Ahmed Wasi

## The idea in one sentence

A portfolio that proves within 10 seconds that Habib can build and ship software, and lets a tech lead verify it in depth, so that Danish and EU teams shortlist him for a graduate full-stack or AI engineering role.

## Why it exists

Habib graduates with a BSc in Software Engineering from the University of Southern Denmark (SDU) in January 2027. He is open to opportunities now and available full-time from February 2027. The current site ([portfolio-habib-wasi.vercel.app](https://portfolio-habib-wasi.vercel.app/)) doesn't do that job:

- The intro opens with "Passionate about…".
- The three projects link only to GitHub. Two are team repos where his part isn't stated, and one link is dead.
- His newest and strongest work isn't on it: TopicTrail, Ridly, Validation Portal and his AI workflow.
- There is no CV download, no testimonial, and no page that shows how a project was solved.

The redesign replaces it with a site that shows the work first and explains the thinking behind it.

## Goals

1. **Job hunting (primary).** Every page leads a recruiter or tech lead toward these actions, in this order: view a case study, then download the CV, email, or book a call.
2. **Visibility (secondary).** Each case study has its own linkable URL with a proper social preview, so it can be put in a CV, on LinkedIn, or in an application.

Out of scope for now: freelance leads and client work.

## Who it serves

| Viewer | How they read | What the site gives them in the first view | One click deeper |
| --- | --- | --- | --- |
| Recruiters | About 10 seconds, skimming | Name, role, a 20-word intro, availability, three featured projects with numbers | CV download |
| HR and tech leads | Slower and technical | Stated role, problem → solution → impact | Case study: architecture, demo, test run, "AI in the build" |
| Peers and developers | Curious about how it's built | Stack tags, code links | GitHub repos, the AI workflow, this site's own repo and CI |
| Potential clients | Low priority | Outcomes and trust signals | Contact |

The rule: every page works for a recruiter at a glance, and lets everyone else go deeper with one click.

## Positioning

> Software engineer graduating from SDU in January 2027. I build full-stack, mobile and RAG products, AI-native and test-driven.

Availability line, shown with the intro or the contact section:

> Kolding, Denmark · Open to roles now, full-time from February 2027 · English, learning Danish

What backs each claim:

- **Full-stack and mobile, with numbers.** Ridly is an Android and iOS app built solo from one Kotlin Multiplatform codebase, with a NestJS backend and 387 commits. Its k6 load test ramped up to 1,200 virtual users, and trip search had a p95 of 96 ms at the 300-user stage. Validation Portal is live at validation-portal.vercel.app.
- **RAG.** TopicTrail, the bachelor project, combines keyword and semantic search over vector embeddings. The site's own AI guide is a working RAG pipeline (chunking, embeddings, citations, "I don't know") over the site and CV.
- **AI-native, with a human in charge.** Agents plan, Habib decides; AI drafts, he reviews every diff. The site names only the tools he actually uses (Claude Code, GitHub Copilot, LangGraph, RAG, GPT-OSS on Groq) and links each one to a project that proves it.
- **Test-driven.** This site is the main proof: it is built test-first, with CI on every push, and its repo is linked from the footer. Ridly adds CI and k6 load tests, and AI_Workflow_Global has a 33-test harness. His uTest record (Silver, 92.26%, 268 test cycles, 46 issues reported) is shown as QA experience, not as TDD.

## Principles

1. **Work before biography.** Featured work comes right after a short hero, and the journey moves to an About page at the end of the flow.
2. **Few and strong.** Three featured projects (TopicTrail, Ridly, Validation Portal); everything else goes in a short "More projects" list.
3. **Prove, don't claim.** Every project states Habib's own role ("I built…", "built solo"), shows real numbers with their conditions or clearly marked expected numbers, and links to code, a demo or a test run. Numbers that can't be backed up are removed.
4. **Honest about what's unfinished.** TopicTrail leads because it is the most relevant project for AI roles. It is labelled "Bachelor project · in progress · due January 2027" and shows design and architecture, not invented results.
5. **Personal, not generic.** The site should look like nobody else's: a light paper-and-ink editorial look, hand-drawn objects, a name made of physics letters, and a vermilion "H" guide. The rules are in the [design system](https://claude.ai/artifact/P1shpLvwDNZziVVL3V3v4Y).
6. **Delight never blocks.** Name, role and a route to the work are visible on first paint and well within 3 seconds. Effects load later, pause offscreen, switch off for reduced motion, and ship after launch.
7. **Honest AI.** Only tools he actually uses are named. The guide answers only from retrieved sources and says "I don't know" otherwise.
8. **Placeholders are visible.** Missing content (screens, quotes, photos) shows as a labelled placeholder, so it's clear what is still needed. Nothing is invented to fill a gap.

## What the research says

The strongest sources are a recruiter eye-tracking study (Ladders) and two hiring surveys (CoderPad, Stack Overflow). The rest are practitioner opinions from recruiting and portfolio blogs, and the claims built on them are kept at that level.

| Finding | Source type | What it means for the site |
| --- | --- | --- |
| Recruiters spend about 7.4 s on a resume's first screen and scan in an F pattern for titles, an overview line and clear headers ([Ladders, 2018](https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf)). | Study, about resumes rather than portfolios | The 10-second layer: the hero names the role, featured work shows in the first scroll, and labels are terse. The 10-second figure is a working rule, not a measured number for portfolios. |
| Only 11% of recruiters say a portfolio review reflects on-the-job ability; 16% trust resumes ([CoderPad State of Tech Hiring 2026](https://coderpad.io/survey-reports/coderpad-state-of-tech-hiring-2026/)). | Survey | Evidence beats decoration: test runs, demos, architecture and code links come before visual effects. |
| When AI is allowed, the skill signals hiring teams value most are catching and fixing AI mistakes (66%) and explaining tradeoffs and correctness (56%) (CoderPad 2026). | Survey | "AI in the build" sections show where Habib reviewed, rejected or corrected AI output, not just which tools he used. |
| 46% of developers distrust AI output; 66% are frustrated by "almost right" answers ([Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/ai)). | Survey of developers, not hiring managers | Tech leads reading the site are sceptical of AI claims, so every AI claim is paired with the human decision and with tests. |
| Hiring managers want the problem, key decisions and tradeoffs, measured impact and the person's own role ([Refactor Talent](https://refactortalent.com/developer-portfolio-projects-that-impress/), [SOLTECH](https://soltech.net/what-do-hiring-managers-actually-look-for-in-a-github-portfolio/)). | Practitioner opinion | Fixed case study order: problem → my role → AI in the build → solution → architecture → test evidence → impact. |
| Filler openers ("passionate, hardworking") carry no information; one finished project beats several half-built ones; animation that buries content loses visitors ([SlateGit](https://slategit.com/blog/developer-portfolio-website-that-converts-recruiters), [Curious.page](https://curious.page/blog/how-to-build-developer-portfolio-gets-hired)). | Practitioner opinion | The "Things to avoid" list, the 3-second rule for motion, and shipping effects after the content. |

## How we'll know it works

**Hiring outcomes (the real goal)**
- Applications sent, replies and interviews, logged weekly from launch.
- In each interview, ask whether they looked at the site and which page.
- Case study views and CV downloads compared with applications sent. How these are tracked is an open decision; see [roadmap.md](roadmap.md).

**Quality bars (checked in CI)**
- **First view:** name, role and a link to the work are visible on first paint. Lighthouse on phone: LCP under 2.5 s, CLS under 0.1.
- **One click to the work:** from every page, a visitor reaches a case study in one click.
- **Trust:** every featured project has a stated role, at least two real (or marked expected) metrics, a code link (or a marked reason there isn't one) and the evidence its case study promises.
- **Accessibility:** no axe violations, full keyboard path, reduced motion respected everywhere.
- **Guide:** passes its evaluation set of about 20 recruiter questions. Every answer cites a source, and anything outside the site and CV gets "I don't know".

## Sources of truth

- [Portfolio Redesign — Requirements](../../Portfolio%20Redesign%20—%20Requirements.md): requirement IDs G, A, S, C, V, AI, GD, P. Where it conflicts with the decisions log in [roadmap.md](roadmap.md), the log wins.
- [Habib Wasi Portfolio design system](https://claude.ai/artifact/P1shpLvwDNZziVVL3V3v4Y): tokens, components, voice
- [Portfolio Mockups](../../Portfolio%20Mockups.html): Home, Ridly case study, About, phone, AI guide
- [tech-stack.md](tech-stack.md) and [roadmap.md](roadmap.md)
