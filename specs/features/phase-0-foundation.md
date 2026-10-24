# Spec: Phase 0 — Foundation

Roadmap items 0.1–0.8 · Status: done (see CHANGELOG.md) · 2026-10-21

## Goal

Make the codebase ready for Phase 1: design tokens, fonts, a typed content layer, the base components, tests, CI and the site shell. Visitors see no new content yet. The site must stay deployable at every step.

## Out of scope

- New page sections. Hero, featured work and case studies are Phase 1.
- The contact form fixes (1.9) and rate limiting code (written with 1.9).
- Animation. Only the `motion` migration happens here.

## Acceptance criteria

### 0.1 Dependency clean-up
- `next` and `eslint-config-next` are on 16.4.x.
- `framer-motion` is replaced by `motion`. Every import uses `motion/react`.
- `next-themes`, `theme-toggle.tsx`, `nodemailer` and `@types/nodemailer` are gone.
- There is no `.dark` palette, no `dark` custom variant and no `suppressHydrationWarning` added for theming.
- The legacy sections still render and build. They keep their `dark:` utility classes, which now have no effect.

### 0.2 Tokens and fonts
- Every token from the design system's `tokens.json` exists as a CSS variable and a Tailwind utility:
  - 13 colours
  - `space-1`…`space-7`
  - `radius-sm/md/pill`
  - `shadow-letter`, `shadow-lift`
- Type style utilities exist, with the phone sizes below 640px: `text-display-xl`, `text-display-l`, `text-heading`, `text-title`, `text-body`, `text-small`, `text-label`.
- Fonts come from `next/font/google`: Fraunces (`--font-display`, the only preloaded font), Instrument Sans (`--font-sans`) and IBM Plex Mono 400/500 (`--font-mono`). All use the latin subset.
- `body` is `paper` with `ink` text. The legacy shadcn variables (`--background`, `--primary`…) are mapped onto the paper palette so the old sections stay coherent until they're replaced.
- A unit test checks that every design system token is defined in `globals.css`.

### 0.3 Content layer
- `src/content/types.ts` defines `Project`, `CaseStudy`, `Metric`, `Link`, `MediaItem`, `Placeholder` and `Content<T> = T | Placeholder`.
- `src/content/projects.ts` lists the featured three in order (TopicTrail, Ridly, Validation Portal) plus the five "More projects", with the facts decided in the roadmap:
  - Ridly: 387 commits, built solo, p95 96 ms at 300 VUs.
  - Validation Portal: `gpt-oss-20b`.
  - Undershelf and Heat.IT: the unproven claims are dropped.
  - Deskinct, TopicTrail and Medication Adherence App: no public link.
- `src/content/site.ts` holds the identity, intro, availability, links, QA record and testimonial placeholder.
- `src/content/anchors.ts` holds stable section IDs: `work`, `ai`, `proof`, `stack`, `contact`.
- `placeholder("Ridly screens")` creates a placeholder value. `isPlaceholder()` narrows it, and `listPlaceholders()` returns every placeholder label in the content.
- `<Placeholder label="…" />` renders a visible slot in the design system style, labelled with "[…]".
- Tests cover:
  - the featured order and count (3)
  - unique slugs
  - unique anchors
  - the 20-word limit on the intro
  - no `"Hop"`, `"Llama 3.3"` or `"Justit"` anywhere in the content
  - placeholder detection

### 0.4 Base components (`src/components/hw/`)
- `Button` (primary, secondary, text; renders `<a>` when given `href`), `Tag` (incl. `ai`), `Metric` and `Metrics`, `MediaFrame`, `ProjectCard`, `Testimonial`.
- Markup and class names follow the design system component READMEs. Styles live in `src/styles/components.css` as `hw-` classes using the tokens.
- Content props accept placeholders and render `<Placeholder>` for them.
- Component tests cover:
  - Button variants and `href`
  - `Tag ai`
  - `ProjectCard` is one link, with at most 2 metrics and 3 tags
  - `MediaFrame` has its label and caption
  - `Testimonial` renders a placeholder

### 0.5 Tests
- `npm test` runs Vitest (jsdom, Testing Library, jest-dom).
- `npm run test:e2e` runs Playwright (Chromium, desktop and phone) with axe on `/`.
- `lighthouserc.json` asserts on phone: LCP ≤ 2500 ms, CLS ≤ 0.1.
- E2E checks:
  - the page has the `paper` background and no dark class
  - the skip link and nav work by keyboard
  - axe reports no critical or serious violations on `/`

### 0.6 CI and config
- `.github/workflows/ci.yml` (repo root) runs on push and PR: install, lint, typecheck, unit tests, build, then Playwright against the production build.
- Lighthouse CI is a separate job against the build (Vercel preview wiring follows when the Vercel project is connected).
- `.env.example` lists every variable from tech-stack.md.
- `next.config.ts` sends a static Content Security Policy and basic security headers.

### 0.7 Site shell
- `SiteHeader`: wordmark, text nav (Work, About, CV, Contact) with `aria-current`, and a skip link.
- `SiteFooter`: GitHub and LinkedIn as text links (secondary, G5), the repo link and the CI badge, and the copyright.
- The global `:focus-visible` ring is a 2px `cobalt` outline with a 3px offset.
- A global `prefers-reduced-motion` rule shortens transitions and animations.
- The shell is used on `/`. The legacy navbar and footer are removed.

### 0.8 Design system corrections
Done in the design system artifact:
- ProjectCard order is TopicTrail, Ridly, Validation Portal.
- "Justit" → Just Eat.
- "Hop" → Ridly in samples.
- Llama 3.3 is out of the AI ring (gpt-oss on Groq instead).
- Testimonial placement follows the Home order.
- Commit counts are updated.
- ProjectCard uses "built solo".
