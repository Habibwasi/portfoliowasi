# Footage capture (M.3)

One Playwright script per shot in `shots/`. The runner builds nothing; it films the site's local production build:

```
cd portfolio-website && npm run build
cd ../video && npm run capture -- <shot> [--takes 3] [--send]
```

For each run, the runner starts `next start` on port 3300 with the shot's environment. Variables set there win over `portfolio-website/.env.local`, and an empty one switches a key off. Each take records in a fresh browser context, so the name animation and the tour offer play as on a first visit. Frames come from Chrome's DevTools screencast, not Playwright's video, which is VP8 at about 0.8 Mbit/s and 25 fps. They are encoded to 30 fps H.264 with Remotion's ffmpeg in `public/footage/<shot>-<take>.mp4` (git-ignored). Desktop shots get a drawn mouse pointer, since a headless browser shows none. Pick the best take by eye.

| Shot | Scene | Shows | Environment | Guide questions per take |
| --- | --- | --- | --- | --- |
| `hook` | 1 | The name scramble, the tiles dropping in, a throw and a poke | — | 0 |
| `tour` | 2, 3 | Home, the Ridly case study, the guide answering "How fast is Ridly's trip search?" | `GROQ_API_KEY` and Upstash in `.env.local` | 1 (+1 warm-up, no model call) |
| `break-off-topic` | 4 | "What is the capital of France?" gets the fixed "I don't know" | — | 1 (no model call) |
| `break-injection` | 4 | A prompt injection gets a refusal | `GROQ_API_KEY` and Upstash | 1 (+1 warm-up) |
| `outage-busy` | 5 | The busy message with matching pages and excerpts | `GROQ_API_KEY=""` (set by the shot) | 1 (+1 warm-up) |
| `outage-limiter-guide` | 5 | Limiter down: the guide fails closed and says it is busy | `KV_REST_API_URL` unreachable (set by the shot) | 0 counted |
| `outage-limiter-contact` | 5 | Limiter down: the contact form fails open and sends | `KV_REST_API_URL` unreachable; needs `--send` | 0 (sends a real email to Habib per take) |
| `phones-motion` | 6 | Home with motion on (left of the split) | — | 0 |
| `phones-reduced` | 6 | Home with reduced motion (right of the split) | — (context `reducedMotion: "reduce"`) | 0 |
| `phones-phone` | 6 | The phone layout (Pixel 7) and the guide's sheet | — | 0 |

**Limits.** Guide questions count against the real limits: 10 per 10 minutes per visitor (every take is the same visitor, localhost) and 90 a day for the site, shared with production. The runner refuses a run of more than 10 questions. Leave 10 minutes between guide runs.

**The answer for scene 3.** Each `tour` take saves the raw streamed answer and its sources to `public/footage/tour-<take>-answer.json`. Copy the chosen take's file to `video/data/answer.json` and run `npm run export:retrieval`. The script checks that the answer's sources are the exported hits, in order, and that every citation points at one.

**Phone footage** comes out at 412×839 px. Under phone emulation, Chrome's screencast sends CSS pixels. Scene 6 is in the README cut only, where the phone shows at about that height, so it isn't upscaled much.
