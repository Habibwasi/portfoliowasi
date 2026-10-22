# Spec: Phase 5 — Delight

Roadmap items 5.1–5.6 · Status: built (2026-10-22); closes once CI, the guide evaluation and the Vercel preview pass on `redesign` · Branch `phase-5-delight`, to merge into `redesign`

## Goal

Make the site feel alive without slowing the first view. The name reveals and scrambles once, letter tiles drop beside it and can be pushed around, the skills orbit, hand-drawn objects lead to the sections, and the guide gets its full body language and can act on the page: scroll, open a case study, point at things.

Every effect is an extra on top of a page that already works. The name, role and route to the work are server-rendered and visible on first paint (C1, P1). Nothing here may delay them, block scrolling or clicks (P2), or run for visitors who prefer reduced motion (P4).

Missing assets (the portrait, drawings of Habib's own objects, the demo videos, the CV) stay visible placeholders or stand-ins until Phase 7.

## Out of scope

- Letters that spring back, skill words as debris, tilt-to-move on phones, personal objects falling with the letters (requirements C4 options; roadmap "Later").
- A Rive version of the guide (roadmap "Later"). This phase uses SVG and CSS, as the design system allows "for a first version".
- Objects in the page header. The header keeps the text menu; the objects sit on Home only.
- Real drawings, portrait and videos (7.3, 7.5). The CV (7.1): `download_cv` exists in code but isn't offered to the model until the PDF does.

## Sources

| What | Source |
| --- | --- |
| Name sequence, timing, glyphs | Design system AnimatedName: 30 ms stagger, scramble through mono glyphs in `signal-ink`, about 400 ms |
| Physics tiles | Design system AnimatedName and Guide: `hw-letter` tiles (`radius-md`, `paper-raised`, `shadow-letter`), exactly one `hw-letter--signal`; shadow grows while a tile falls; a hit tile scrambles. Mockup Home: H (rotated −9°) and W (6°) tiles at the foot of the portrait |
| Orbit | Design system SkillOrbit: AI ring outermost, two inner rings, a dark "STACK" core; rings turn once per 90 s (AI), 60 s and 40 s (inner, reversed); tags stay upright; selected tag in `signal`; tag row on phones. Mockup Home "04 / Stack" subline |
| Object nav | Mockup Home: a row under the hero with a laptop (Work), stopwatch (About), sheet (CV) and envelope (Contact), 1.5 px `ink` line art with one `signal` detail, `hw-label` under each. Design system ObjectNav: objects `aria-hidden` and out of the tab order; hover lifts and tilts |
| Guide states and poke | Mockup "AI guide playground" keyframes (breathe, perk, wobble, chatter, arrive, nudge, jelly) and its captions; design system Guide (pointing leader, 3 px `cobalt` target outline) |
| Page tools | Mockup character sheet "Tools the model can call"; GD6; tech stack "Page tools" |

## Decisions made in this spec

| Question | Decision | Why |
| --- | --- | --- |
| Which letters are physical | **Five tiles beside the name**, not the name itself: a vermilion H, then W, A, S, I. They replace today's static H and W tiles in the hero's art column. The `h1` never moves (decided by Habib, 2026-10-22) | The name stays readable for the 10-second scan (C1, P1). The H is the guide's body (GD1), so the guide visibly "comes from" the hero. |
| How the name animates without hiding it | The letters are visible from the server. The reveal is a short lift wave, never from `opacity: 0`: each **word** rises 0.12 em and settles, 90 ms apart. Letters stay plain inline spans; only a word that is lifting is `inline-block`, and only a letter that is scrambling is `position: relative`. The scramble draws its glyphs in a `::after` layer over the letter while the letter itself turns transparent; the text nodes never change. The sequence waits for `load` and for the fonts | Overrides the design system preview, which reveals letter by letter from `opacity: 0`. Found while building: `inline-block` letters lose Fraunces' kerning ("W asi"); `inline-block` words are taller with the fallback font, so they would shift the page if Fraunces swapped in late; and positioned letter spans take the text away from the `h1` for Largest Contentful Paint, which then falls to the next heading. |
| When the name animates | Once per browser tab session on Home, starting after `load` (and a frame). Client-side navigation back to Home doesn't replay it | A replay on every return to Home gets in the way. |
| Where physics runs | Only where the art column shows (≥ 640 px, as today) **and** the pointer is fine with hover (`(hover: hover) and (pointer: fine)`). Elsewhere the tiles rest as a static pile | Dragging on touch fights scrolling (P2). Phones hide the art column already. |
| Physics engine | `matter-js` 0.20.0 (+ `@types/matter-js`), imported with `await import()` on `requestIdleCallback` after the scramble ends. Never imported under reduced motion or without a fine pointer | Tech stack. `planck` stays the fallback. |
| Orbit contents | All 21 skills from `skills.ts`, in three rings: AI tools (9, outer), "Languages and data" (Kotlin, Swift, TypeScript, Python, C#, PostgreSQL), "Frameworks and tools" (React, Next.js, NestJS, Supabase, k6, TDD). Each tech skill gets a `family` in `skills.ts` | The design system caps the rings at 6/5/3, but C14 and the one-list decision (Phase 4) say the orbit shows the same skills as the row. Six per inner ring fits at the radii below. |
| Orbit and row are one set of buttons | One list of toggle buttons. CSS lays them out as rings from 1200 px up and as three labelled rows below that. No second copy of any button | Two copies would mean duplicate IDs and two `aria-pressed` states to keep in sync. |
| Moving buttons and WCAG 2.2.2 | Rotation pauses while the mouse is over the orbit or focus is inside it, and a "Pause rotation" toggle sits under the orbit. It keeps its name and uses `aria-pressed` | Content that moves for more than 5 s needs a way to stop it. A tag that moves while you aim at it can't be clicked. |
| Object nav and the accessibility tree | The objects are a `div` with `aria-hidden="true"`, and each link has `tabindex="-1"`. The header's text menu is the keyboard and screen reader route (P4) | Design system ObjectNav. A `nav` landmark with only hidden content would be an empty landmark. |
| Object drawings | The mockup's four drawings ship as stand-ins; 7.5 swaps in Habib's own objects. The CV object follows the CV nav rule (hidden while the CV is a placeholder) | Real drawings are content (Phase 7). |
| Guide state animations | CSS keyframes on the SVG, taken from the mockup playground. No Motion | The playground already defines them; CSS costs no JavaScript. Overrides tech stack "Motion for the state animations". `motion` stays installed but unused; removing it is a separate cleanup. |
| Where the states show | On the panel header character, which grows from 28 px to 48 px. The collapsed tile keeps idle and blink. Opening the panel pokes the header character once; clicking it pokes it again | The tile is hidden from the moment it is clicked, so a poke on it would never be seen; the header is where the visitor looks. |
| Pointing | The header character leans in place while pointing (a hop there would cover the title). After a page tool runs, a 40 px copy of the H appears beside the target, hops in (`g-arrive`) and keeps nudging (`g-nudge`), and the target gets the 3 px `cobalt` outline the tour already uses. It leaves on the next tool call, on closing the panel, or after 8 s. Reduced motion: it fades in and out, no hop or nudge | GD2, GD6, GD8. |
| Tool calls cost no extra model request | The model writes its short answer **and** calls at most one tool in the same step. The browser runs the tool and records its output, but the conversation does **not** go back to the model (no `sendAutomaticallyWhen`) | A second round trip would double Groq requests against the 90-a-day cap. Overrides tech stack "sendAutomaticallyWhen". |
| Tool parts in the history | The request accepts tool parts in earlier assistant messages, and the server drops them before calling the model; only text reaches it. An assistant message left empty is removed | The browser must keep complete tool calls in `useChat`, but client-sent tool data is never trusted (tech stack, "Client-sent `system` and `tool` roles are ignored"). |
| Navigation questions that retrieve nothing | A new chunk, "Getting around this site", lists the sections, the case studies and what the guide can do. "Take me to contact" retrieves it, so the model is called with the tools | Today a question with no retrieved chunk gets "I don't know" without a model call. This keeps that rule and still lets navigation requests through. |
| Tool arguments | `z.enum` over known values only: Home sections; published case study slugs; a list of highlight targets built from the anchors; case studies with a demo. The browser re-checks the input against the same schema and ignores anything else | Tech stack. |
| `play_demo` before the videos exist | It opens the case study and points at the demo slot. If the video is real it starts it (muted, through the facade); while it's a placeholder it only points | Videos arrive in 7.3. |
| `download_cv` | Left out of the tool list while `site.cv` is a placeholder. Once it exists, the tool shows a confirm card in the chat ("Download Habib's CV (PDF)?", Download / No thanks); the download only happens on the visitor's click | GD6 "asks first". |
| Phones and tools | On phones the sheet closes before the page moves (like the jumps today); the conversation is kept and reopening the guide shows it | The sheet would cover the target. |

## Acceptance criteria

### 5.1 Name animation (`AnimatedName`)
- The server renders `<h1 id="hero-name" class="hw-hero__name" aria-label="Habib Ahmed Wasi">` with one `span.hw-name__ch` per character (`aria-hidden`), on two lines as today. With JavaScript off it looks exactly as now.
- After `load` and the fonts, on the first Home view of the tab session: the lift wave runs (90 ms between words, each word 360 ms, whole wave under 1 s), then the scramble (each letter shows 6–8 random glyphs from `ABCDEFGHJKLMNPRSTUVWXYZ#/<>{}*+=` in IBM Plex Mono, `signal-ink`, 45 ms apart, letters starting 18 ms apart, about 600 ms in all) and ends on the real letter.
- Only `transform` and the overlay's content change. Home's CLS stays under 0.01 from the start of the sequence (`data-started-at` on the `h1`), and the `h1` stays Home's LCP element.
- When it ends, the hero dispatches `hw:name-settled`; the physics (5.2) waits for it.
- Reduced motion, a repeat view in the same session, or JavaScript off: no animation, and `hw:name-settled` fires at once (if JavaScript runs).

### 5.2 Physics tiles
- Five `hw-letter` tiles in the art column (`aria-hidden`): H (`hw-letter--signal`), W, A, S, I. Server-rendered as a resting pile at the foot of the portrait, rotated a few degrees each, so no-JS, reduced motion, touch and phones all see the same still pile.
- Where physics runs (see decisions): after `hw:name-settled` and an idle callback, `matter-js` loads, the tiles jump to the top of the art column and fall in, spread out so none starts overlapping another. They fall in front of the portrait slot (as in the mockup), not onto it; the art column's sides and floor are walls; the top is open. They turn less easily than a real tile (six times the inertia), so they tilt and tumble a little but mostly land upright.
- Tiles keep their resting layout position; the engine moves them by transform only, so physics causes no layout shift.
- Material feel: the shadow grows with a tile's height above the floor; a landing faster than a threshold squashes the tile for 120 ms (scale ≈ 1.12 × 0.88) and scrambles its letter for about 200 ms.
- The mouse can drag and flick tiles. A click without a drag is a poke (a jelly wobble). The engine must not capture the mouse wheel: the page scrolls over the hero as usual.
- The runner stops when the hero leaves the viewport (IntersectionObserver), when the tab is hidden, and when every body is asleep. The art column carries `data-physics="running" | "paused" | "off"` for tests.
- Switching to reduced motion while it runs stops the engine and returns the tiles to the still pile.
- First view: `matter-js` isn't in the initial JavaScript; Lighthouse on Home keeps LCP under 2.5 s, CLS under 0.1 and TBT under 300 ms.

### 5.3 Skills orbit
- `skills.ts`: every `tech` skill has `family: "language" | "framework"` (shown as "Languages and data" and "Frameworks and tools"). The Stack has three labelled groups: AI tools, Languages and data, Frameworks and tools.
- From 1200 px: the groups become rings around a dark "STACK" core in a 640 px square. AI ring radius 260 px, languages 175 px, frameworks 100 px; each ring's tags are evenly spaced by `--a` and `--r`. Rings turn once per 90 s, 60 s and 40 s (reversed); tags stay upright. Ring lines are drawn in CSS and `aria-hidden`. The proofs panel sits beside the orbit.
- Below 1200 px: three rows of tags, as today plus the third group. No horizontal scroll at 320 px.
- The tags are the same toggle buttons as in Phase 4 (`aria-pressed`, `aria-controls="stack-proofs"`), in DOM order AI, languages, frameworks. Selected tag: `signal` fill. The first AI tool is selected on load.
- Rotation pauses on hover or focus inside the orbit, and with the "Pause rotation" toggle (`aria-pressed`; the name stays the same). Reduced motion: no rotation and no button.
- The subline must read true as rings and as rows, so it doesn't name the outer ring (the mockup's "The outer ring is…" only fits the orbit): "The AI toolkit I work with every day, and the languages and frameworks behind the projects above. Pick one to see where I used it."

### 5.4 Object navigation
- Under the hero on Home: a row of hand-drawn objects, each a link with its drawing (inline SVG, about 72 px tall) and a `hw-label`: Work → `#work`, About → `/about`, CV → the PDF (only once it exists), Contact → `#contact`.
- The row is `aria-hidden="true"`; every link in it has `tabindex="-1"`. axe reports no `aria-hidden-focus` violation.
- Hover: the object lifts 4 px and tilts 3–4°, with `shadow-lift` on the drawing; reduced motion: no tilt or lift.
- Phones: the same four in one row at 48 px, no horizontal scroll.
- The drawings live in one component (`object-drawings.tsx`) with a comment pointing at 7.5.

### 5.5 Hero illustration slot
- `site.hero.portrait` is `Content<{ src: string; alt: string }>`. As a placeholder it renders today's labelled "Line-art portrait" slot; once supplied it renders `next/image` (4:5, `sizes` for the art column, not `priority`: the name is the LCP).
- The slot keeps its 4:5 box either way, so swapping it in causes no layout shift.
- 7.5 says where the portrait goes (`site.hero.portrait`).
- About's three photo slots (4.4) are unchanged.

### 5.6 Guide: states, poke and page tools
**States**
- `GuideCharacter` takes `state: "idle" | "listening" | "thinking" | "talking" | "pointing"` and an optional `poke` flag, and gains pupils, a mouth and three thinking dots as separate SVG parts. Keyframes from the playground: breathe (2.6 s), perk and glance (1.4 s), wobble and roll (1.8 s, dots pulse), chatter and talk (0.36 s), arrive (0.8 s) then nudge (1.3 s), jelly (0.65 s).
- The panel maps chat activity to a state: typing in the field (or within 1.5 s of the last key) → listening; request sent → thinking; answer streaming → talking; a tool ran → pointing for as long as the pointer shows; otherwise idle.
- Poke: opening the panel plays the jelly on the header character; clicking the header character plays it again in any state, then the state carries on.
- Reduced motion: no keyframes; the face still changes per state (pupils up for thinking, mouth open for talking).

**Page tools** (server-defined, no `execute`; the browser runs them)

| Tool | Input | In the browser |
| --- | --- | --- |
| `scroll_to` | `section`: work, ai, proof, stack, contact | Go to Home if needed, scroll to the section, point |
| `open_case_study` | `slug`: a published case study | Go to `/work/<slug>`, point at its title |
| `highlight` | `target`: one of the listed targets, e.g. `/#work-ridly`, `/work/ridly#cs-test-evidence`, `/about#qa-record` | Go to the page if needed, scroll, outline and point |
| `play_demo` | `slug`: a case study with a demo slot | Open the case study, point at the demo; start it muted if the video exists |
| `start_tour` | none | Start the 30-second tour |
| `download_cv` | none | Only offered once the CV exists; show the confirm card |

- The instructions add: call at most one tool, only when the visitor asks to be shown, taken to, or given something; always write the short answer too; never claim a tool did something the answer can't see.
- The new chunk "Getting around this site" is in the index; the index is rebuilt and the staleness test passes.
- A tool call with an input outside its enum, or a tool the browser doesn't know, does nothing on the page.
- Tool calls show in the chat log as one plain line ("Showing: Contact"), so screen readers hear what moved.

## Tests (written first)

- Unit (`skills`): every tech skill has a family; six skills per inner ring; the Phase 4 checks still pass.
- Unit (name): the scramble sequence for a letter has 6–8 glyphs from the set and ends on the letter; spaces are skipped.
- Unit (physics helpers, without the engine): impact speed → squash and scramble only above the threshold; shadow size grows with height; tile list is exactly H, W, A, S, I with H the only signal tile.
- Unit (guide): tool input schemas match the anchors, slugs and targets; `download_cv` is absent while the CV is a placeholder; tool parts in the request are accepted and stripped before the model; an assistant message with only a tool part is dropped; the instructions mention tools; the "Getting around this site" chunk exists.
- Component: `AnimatedName` keeps `aria-label` and one span per character, and skips the animation under reduced motion; `Stack` renders three groups, the pause toggle flips `aria-pressed`; `ObjectNav` is `aria-hidden` with `tabindex="-1"` links and hides CV while it's a placeholder; `GuideCharacter` gets the class for each state and the poke; the panel goes listening → thinking → talking with a mocked chat; a mocked `scroll_to` tool call scrolls to `#contact`, outlines it and shows the pointer; `download_cv` shows the confirm card and downloads nothing until clicked; an invalid tool input does nothing.
- E2E (desktop and phone):
  - The name is visible with JavaScript off (kept); with JavaScript the `h1` is still "Habib Ahmed Wasi" after the sequence; layout shift on Home stays under 0.01 from the start of the sequence; the `h1` is Home's LCP element.
  - Desktop: the `matter-js` chunk is requested only after `load`, and the art column reaches `data-physics="running"`; scrolled past the hero it becomes `paused`.
  - Reduced motion and phone: no `matter-js` request, `data-physics="off"`, tiles visible.
  - At 1280 px the orbit shows; the mouse on a tag pauses it (tests aim the mouse with `e2e/orbit.ts`, because Playwright waits for moving elements to stop); Pause rotation works; picking a tag still shows its proofs. At 375 px the three rows show with no horizontal scroll.
  - Object nav links reach `#work`, `/about` and `#contact`; Tab skips them.
  - Guide with a mocked route: "Take me to contact" → `#contact` in view with the outline and pointer; the chat says "Showing: Contact".
  - axe: Home with the orbit, the object row and the pointer showing; no violations.
- Eval: tool cases, each asserting the tool and its input: "Take me to the contact form" → `scroll_to(contact)`; "Show me his best project" → `open_case_study(ridly)`; "Can I see the Ridly demo?" → `play_demo(ridly)`; "Give me the tour" → `start_tour`. `download_cv` joins once the CV exists.
- Lighthouse CI: unchanged gates on every URL.

## Done when

- All of the above pass locally and in CI on `redesign`, the guide evaluation passes, and the Vercel preview builds.
- The roadmap marks 5.1–5.6 done; 7.5 lists `site.hero.portrait` and the object drawings in `object-drawings.tsx`; the decisions log has this spec's overrides.

## Build notes (2026-10-22)

- **Lighthouse locally:** Home's LCP is 2.58–2.63 s on this machine, against 2.53–2.56 s for Phase 4 on the same machine. So Home already missed the 2.5 s budget here before this phase; CI passed it on its own hardware. Phase 5 adds about 50 ms. TBT went down (median 192 ms, from 247 ms). Home's CLS is 0.034 (Phase 4: 0.017), all of it web fonts swapping in: the object nav's mono labels above Selected work, and the name's letters now being separate elements. The budget is 0.1.
- **Video facade:** `play_demo` starts a real video through a `hw:play-demo` event on the facade, muted (`mute=1`), because browsers block sound without the visitor's own click. Only the visitor's own click moves focus into the player.
- **Case studies** have two new stable IDs for the tools: `cs-title` (the `h1`) and `cs-demo` (the media under the header).
