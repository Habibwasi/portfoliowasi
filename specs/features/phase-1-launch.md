# Spec: Phase 1 — Launch

Roadmap items 1.1–1.13 · Status: done (closed 2026-10-22; missing content tracked in roadmap Phase 7) · 2026-10-21

## Goal

Replace the live site with the smallest site that passes the 10-second scan and lets a tech lead click into real work. Home becomes Hero → Featured work → Proof → Contact. TopicTrail and Validation Portal get case study pages; Ridly's card says "Case study coming" until 2.1.

Missing content (CV, Calendly, screens, videos, quotes, role text) stays as a visible, labelled placeholder. Nothing is invented to fill a gap.

## Out of scope

- "How I build with AI" (4.1) and the Stack section (4.3). Home has no `#ai` or `#stack` section yet.
- The About page (4.4). The About nav item is hidden until it exists, the same way CV is hidden until the PDF exists.
- Object navigation, hero illustration, name animation and physics (Phase 5). The hero is static text.
- Video facade (2.3) and per-page OG images (2.2). A demo video renders as a plain link to YouTube until 2.3.
- 1.13 (CV, LinkedIn and GitHub profiles) happens outside the codebase. It is listed under "Left for you".

## Acceptance criteria

### 1.1 Hero
- Mono role line ("Software engineer · AI-native · Denmark"), the name as the only `h1`, the 20-word intro with "AI-native and test-driven" in the marker highlight, and the availability line (Kolding, Denmark · open now, full-time from February 2027 · English, learning Danish).
- "View case studies" (primary, to `#work`) and "Download CV" (secondary).
- Server-rendered, no animation, no client JavaScript. The name is visible with JavaScript disabled.
- The portrait slot from the mockup is a placeholder ("Line-art portrait") on desktop and hidden on phones, so the first view on a phone is name, intro and actions.

### 1.2 Featured work
- `#work` section: "01 / Selected work", "Three projects, end to end", the subline from the mockup.
- Cards in order: TopicTrail, Ridly, Validation Portal. TopicTrail shows its status note.
- TopicTrail and Validation Portal are links to `/work/<slug>`. Ridly is not a link and says "Case study coming".

### 1.3 More projects
- A list under the cards: title, one-line summary (which states his part on team projects where known), tags, and a GitHub link where one exists. Projects without a public repo show no link (Deskinct, Medication Adherence App).
- "All repositories on GitHub" link.

### 1.4 Case study template (`/work/[slug]`)
- Statically generated for every featured project with `caseStudyReady: true`; any other slug is a 404.
- Order: header (eyebrow "Case study 0n / 03 · …", title, context line, facts row), hero media, then numbered sections: Problem → My role → AI in the build → Solution (screens) → Architecture → Test evidence → Impact (metrics, stack tags, code and live links).
- Ends with "Next project" (primary, the next published case study) and "Download CV" (secondary).
- Each section heading is an `h2`; the page has one `h1`.
- Content comes from `src/content/case-studies/<slug>.ts`, typed as `CaseStudy`. Any field can be a placeholder.
- `generateMetadata` gives each page its own title, description and canonical URL.

### 1.5 TopicTrail case study
- Marked "Bachelor project · in progress · due Jan 2027" in the header.
- Problem, role, architecture diagrams, evaluation plan and progress notes are placeholders until supplied. The planned pipeline (keyword + semantic search over vector embeddings, local-first opt-in capture) is stated as planned, not as a result.
- Screens and demo are placeholders. No numbers are shown as results; the 0.1 threshold is labelled as a design parameter.

### 1.6 Validation Portal case study
- Facts from the repository: React 19 + Vite + TypeScript SPA, Supabase (PostgreSQL, Auth, row-level security), Groq `openai/gpt-oss-20b` called from a Vercel serverless function so the key never reaches the browser, Resend notifications, Cloudflare Turnstile, guest accounts that expire after 7 days, the AI verdict rules.
- 111 commits; the live demo link.
- Test evidence states plainly that the project has no automated tests or CI, and that the evidence is the live demo, the video and the diagrams (the C11 exception).
- Demo video, screens and architecture diagrams are placeholders until handed over. The role text is a placeholder until confirmed.

### 1.7 Proof
- `#proof` section on `paper-sunk`: "02 / Proof from others", the testimonial (placeholder quote and name, "Team leader, Just Eat"), and the one-line QA record with Silver, 92.26%, 268 test cycles and 46 issues reported.

### 1.8 Contact section
- `#contact`: "03 / Contact", "Have a role in mind?", the graduation line.
- Email me (`mailto:`), Download CV and Book a call as secondary buttons, plus the email address as a text link.
- The form sits below on `paper-raised`; its submit button is the only primary button in the section.
- Book a call uses `NEXT_PUBLIC_CALENDLY_URL` and opens in a new tab. Until the URL or the CV exists, its button is a visible placeholder.

### 1.9 Contact form
- Fields: name, email, message, and a hidden honeypot field.
- Server (`/api/contact`):
  - Zod validation: name 1–100 characters, a valid email up to 200, message 10–5,000. Returns 400 with field errors.
  - A filled honeypot gets a 200 and sends nothing.
  - Rate limit per IP through Upstash (5 per 10 minutes). Over the limit returns 429. If Upstash isn't configured or fails, the form still works (fails open, as tech-stack.md says).
  - The email body is HTML-escaped; the subject has no line breaks.
  - `replyTo` is the sender's address.
  - `{ error }` from `resend.emails.send` is checked; a failure returns 502, not 200.
  - Missing `RESEND_API_KEY` returns 503.
- Client: native validation plus server field errors next to each field, a pending state (button disabled, "Sending…"), a success message that replaces the form, and an error message with the email address as a fallback. Status messages are announced (`role="status"` / `role="alert"`).

### 1.10 CV
- `site.cv` points at `/cv/Habib-Ahmed-Wasi-CV.pdf` once the file is in `public/cv/`. Until then every CV button is a visible placeholder and the nav hides CV.

### 1.11 Metadata
- Title "Habib Ahmed Wasi · Software engineer", description from the intro, `metadataBase` from `NEXT_PUBLIC_SITE_URL`, Open Graph and Twitter card.
- A default OG image (`opengraph-image.tsx`, 1200×630, paper and ink).
- `sitemap.xml` with Home and every published case study; `robots.txt` allowing everything and pointing at the sitemap.

### 1.12 Phone layout
- Every section above works at 390 px with no horizontal scroll. Buttons stack full width; the contact section shows all three actions.

### Clean-up
- The six legacy sections, `src/components/ui`, `components.json`, the shadcn colour mapping, `tw-animate-css` and the legacy lint exception are removed.

## Tests (written first)

- Unit (`content`): case studies exist for exactly the published featured projects; each has every section; Validation Portal names `gpt-oss-20b` and states that it has no automated tests; TopicTrail shows no results as measured numbers; "Next project" order wraps.
- Unit (`contact`): schema accepts valid input and rejects each bad field; HTML is escaped; the route returns 400, 200 (honeypot), 429, 502 and 503 in the right cases and passes `replyTo`.
- Component: Hero has one `h1` and the two actions; ContactForm shows pending, success, field errors and error states; CV and Calendly buttons render placeholders when missing.
- E2E (desktop and phone):
  - Home → case study: click the Validation Portal card, land on `/work/validation-portal` with its `h1`, follow "Next project".
  - Home → contact → CV: "Contact" in the nav reaches `#contact`, which shows Email me, Download CV and Book a call (or their placeholders).
  - The contact form shows success and error states (network mocked).
  - The name is visible with JavaScript disabled.
  - `/work/ridly` is a 404.
  - axe: no violations on `/` and both case studies.
- Lighthouse on phone: LCP ≤ 2.5 s is an error again; both `/` and `/work/validation-portal` are measured.

## Done when

The roadmap's Phase 1 "done when" list passes, except that "Home → contact → CV" checks for the CV placeholder until the PDF is supplied.
