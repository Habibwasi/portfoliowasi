# Spec: Phase 6 — Polish

Roadmap items 6.1–6.2 · Status: done (closed 2026-10-22; CI and Vercel pass on `redesign`, merge commit `65a7871`) · Branch `phase-6-polish`, merged into `redesign` through PR #1

## Goal

Make sure every visitor can use the whole site, whatever they browse with, and start measuring whether the site does its job: do people open the case studies, take the CV, email or book a call (G4).

The accessibility pass (6.1) proves the site meets WCAG 2.2 AA, fixes what falls short, and turns the checks into tests so later phases can't regress. Analytics (6.2) adds Umami Cloud for the three G4 actions, with no cookies and no consent banner.

## Out of scope

- Real content (Phase 7). The CV and Calendly links only become trackable once they exist; nothing here waits for them.
- A cookie banner. Umami sets no cookies and stores no personal data, so none is needed.
- Replacing Vercel Analytics. Its page views stay (tech stack); Umami adds the events Vercel only offers on Pro.
- Funnels and dashboards in Umami. They are set up in the Umami UI once data arrives, not in code.

## Audit (2026-10-22, production build, desktop Chrome and Pixel 7)

| Check | How | Result |
| --- | --- | --- |
| axe, WCAG 2.0/2.1/2.2 A + AA and best practice | Every page: `/`, `/about`, `/guide`, the three case studies, a 404 | No violations. axe left contrast "incomplete" on text over gradients (marker highlight, placeholders); checked by hand below |
| Contrast | Every text token on every background token | All text pairs pass 4.5:1; lowest are `signal` on `paper` (4.61) and `ink-muted` on `marker` (4.93). `signal` on `paper-sunk` (4.11) is used only for the quote marks (28 px, large text, 3:1) |
| Keyboard | Tab through every page | Every stop has the 2 px `cobalt` ring, none is covered by the header or the guide tile, no trap; the object nav is skipped as designed |
| Reduced motion | `reducedMotion: 'reduce'`, load and scroll Home, About, a case study | No animation running |
| Reflow (1.4.10) | 320 px wide, every page | No horizontal scroll, no clipped text |
| Text spacing (1.4.12) | The WCAG text-spacing overrides, every page | No horizontal scroll, no clipped text |
| Screen reader structure | Accessibility tree of Home, a case study, the 404 | Landmarks, headings and form labels are right. **Found:** each featured card's link is named by the whole card (placeholder text, metrics, tags, "Read the case study"), so a links list reads a paragraph per card. **Found:** the 404 is Next's default (an `h1` "404" and no way onward) |

## Decisions made in this spec

| Question | Decision | Why |
| --- | --- | --- |
| Analytics tool | **Umami Cloud** (free Hobby plan), decided by Habib on 2026-10-22 | Custom events on the free plan, no cookies, small script. Plausible is paid; Vercel custom events need Pro. Closes the open decision |
| How events are sent | One click listener on `document` (`AnalyticsEvents`) sorts links by their target: the CV path → `CV download`, a `mailto:` → `Email click`, the Calendly URL → `Calendly click`. It calls `window.umami.track(name, { place })` | Umami's own `data-umami-event` cancels the click and sets `location.href`, which breaks `download` on the CV link. Sorting by target also covers every CV link (hero, nav, object nav, About, case studies, the guide's offer) without marking each one, including the ones that only appear in Phase 7 |
| `place` | The nearest of: the guide panel (`guide`), the header (`header`), the footer (`footer`), else the `id` of the enclosing section or `article` (`hero`, `contact`, …), else `page`. Umami records the page URL itself | Tells which button works without a property per button |
| Case study views | Umami page views of `/work/<slug>`; no extra event | The tracker already records each page view with its path (and client-side navigation); a second event would count every view twice |
| Where tracking runs | The script loads only when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set, with `data-domains` set to the production host from `NEXT_PUBLIC_SITE_URL` | Previews, CI and local runs never count as visits. The ID is set in Phase 7 (7.9) with the other accounts |
| Loading | `next/script` with `strategy="afterInteractive"` from `https://cloud.umami.is/script.js` | About 3 KB, loaded after hydration, so the first view is untouched (P1). CSP adds `cloud.umami.is` to `script-src` and `gateway.umami.is` (the tracker's endpoint) to `connect-src` |
| Card link names | The card link is named by its title (`aria-labelledby`) and described by its summary (`aria-describedby`) | The whole card stays one click target (design system ProjectCard); screen readers hear "TopicTrail, a memory for what you browse, link" |
| 404 page | A `not-found.tsx` in the site's style: "This page doesn't exist", a line, and links to the work, About and Home. `noindex` | A dead end is the one page with no route to the work (G4) |

## Acceptance criteria

### 6.1 Accessibility

- axe (WCAG 2.2 AA tags plus best practice) reports nothing on every page, including the 404 and Home with the guide panel open, on desktop and phone.
- Tabbing through each page reaches every interactive element; each stop shows a visible ring and isn't hidden behind the header or the guide tile (2.4.7, 2.4.11).
- With reduced motion, no animation runs on any page after load and a scroll.
- At 320 px and with the text-spacing overrides, no page scrolls sideways.
- Each featured card link's accessible name is its project title.
- The colour pairs the design uses meet 4.5:1 for text and 3:1 for the focus ring and input borders; a unit test reads them from `globals.css`.
- An unknown URL shows the styled 404 with a link to the work, inside the normal header and footer.

### 6.2 Analytics

- Without `NEXT_PUBLIC_UMAMI_WEBSITE_ID` no Umami script is requested.
- With it, one `cloud.umami.is/script.js` script carries the website ID and `data-domains` set to the production host.
- Clicking "Email me", the address link, "Book a call" or any CV link calls `umami.track` once with the right event name and place. Other links don't.
- The CV still downloads and Calendly still opens in a new tab: the listener never cancels a click.
- No error when the tracker isn't loaded.

## Tests (written first)

- Unit (`analytics`): `linkEvent` maps the CV path, `mailto:` and the Calendly URL to their events and returns nothing for other links and while the CV or Calendly is a placeholder; `placeOf` finds guide, header, footer, a section id, then `page`.
- Unit (tokens): contrast of every text pair, the focus ring and the input border, parsed from `globals.css`.
- Component: `AnalyticsEvents` tracks a mailto click with its place and ignores other links; it does nothing without `window.umami`. The Umami script renders only with the env var. `ProjectCard` link is named by its title.
- E2E (`a11y.spec.ts`, desktop and phone): axe on every page and with the guide open; the keyboard walk; reduced motion; reflow at 320 px and text spacing; card link names; the 404.
- E2E (`analytics.spec.ts`): with a stubbed `window.umami`, "Email me" and "Book a call" in Contact record `Email click` / `Calendly click` with place `contact`; the Calendly page still opens.
- Lighthouse CI: unchanged gates.

## Done when

- All of the above pass locally (Vitest in CI) and in CI on `redesign`, and the Vercel preview builds.
- The roadmap marks 6.1–6.2 done, closes the analytics decision, and lists the Umami website ID as 7.9; the tech stack names Umami.
- Manual check left to Habib, because it needs a real screen reader: NVDA with Firefox on Home and a case study, and VoiceOver on an iPhone. It is roadmap item 7.10, so it happens on the real content before launch.
