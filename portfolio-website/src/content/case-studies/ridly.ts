import type { CaseStudy } from "../types";

/**
 * Facts come from the HOP-KMP repository (README, Agent.md, CODEBASE_EXPLORATION_REPORT.md,
 * hop-dataflow.drawio, .github, apps/api/k6, git history; checked 2026-10-22) and the roadmap's
 * decisions log. The k6 number is always stated as p95 at the 300-user stage. The problem and
 * the reasons behind the decisions were drafted from the repository for Habib to review (7.3).
 * Screens are the README gallery's Compose previews; the diagram is drawn from hop-dataflow.drawio.
 */
export const ridly: CaseStudy = {
  slug: "ridly",
  contextLine:
    "A carpooling app for Denmark: drivers post trips, passengers book seats, and both chat in real time, on Android and iOS from one Kotlin codebase.",
  facts: [
    { label: "My role", value: "Built solo" },
    { label: "Started", value: "April 2026" },
    { label: "Platforms", value: "Android and iOS" },
    { label: "Commits", value: "387" },
  ],
  hero: {
    kind: "demo",
    src: "GB39N2Kh7Jk",
    caption: "A three-minute film: a passenger and a driver, from searching for a ride to paying in MobilePay.",
    poster: "/work/ridly/film-poster.jpg",
  },
  problem: {
    heading: "Why it needed to exist",
    body: [
      "Plenty of cars in Denmark drive the same commute every weekday, or a long trip between cities, with empty seats. The people who could fill them usually find out through group chats and posts: no search by route and date, no agreed price, and no record of who has paid.",
      "Ridly puts both sides in one app. A passenger searches a route and a date, books a seat at a price worked out from the distance, and knows the trip is on. A driver fills seats on a drive they were making anyway and splits its cost.",
    ],
  },
  role: {
    heading: "What I built",
    body: [
      "I built Ridly alone: the shared Kotlin Multiplatform module, the Android app, the iOS app and the NestJS API. All 387 commits in the repository are mine.",
    ],
    points: [
      "Money stays between the two riders. After the ride the passenger pays the driver in MobilePay, and the app records “paid”, “received” or a dispute. Leaving out a payment provider kept the first version free of fees and contracts; the cost is that payment rests on trust, which ratings and the dispute flow back up.",
      "Prices follow SKAT’s rate of 2.28 kr per kilometre, split across the seats, so a seat costs a share of the drive, not a fare. Every amount is stored as whole øre and only turned into kroner on screen, so no rounding creeps in.",
      "Two kinds of trip, because commutes and long journeys behave differently. A daily commute keeps 30 days of trips ahead of itself. A one-off long trip only runs if enough passengers book before a deadline: a background job checks at the deadline, and if the minimum isn’t met it cancels the bookings and tells everyone.",
    ],
  },
  aiInTheBuild: {
    heading: "AI in the build",
    body: [
      "Planning ran through my LangGraph workflow (AI_Workflow_Global). Agents draft each spec, and a human-in-the-loop gate stops at every step until I approve it or send it back.",
      "Claude Code and GitHub Copilot wrote code against rules kept in the repository. Agent.md records the architecture decisions and the verified library versions, and tells the agent to stop and ask when a request conflicts with them instead of inventing a change. A bug-audit skill gives Copilot a checklist of Ridly's own failure modes, such as missing Koin registrations, ViewModel idempotency guards and how money is displayed.",
      "One correction shows why those rules exist. To run database migrations on Railway, the agent added the connection URLs to the Prisma schema, the way Prisma 6 did it. Ridly runs Prisma 7, which moved that setting out of the schema, so the change broke the deploy. I reverted it within minutes and kept the connection in prisma.config.ts, and the verified-versions list in Agent.md now tells the agent which version it is writing for.",
    ],
  },
  solution: {
    heading: "From empty seat to settled trip",
    body: [
      "Drivers post a trip and review its price. Passengers search by route and date, book a seat, and chat with the driver in real time before the ride. Saved search alerts tell passengers when a matching trip appears.",
      "After the ride, the passenger pays the driver directly with MobilePay, and the app tracks each settlement until it is marked as paid. Driver and passenger rate each other, and drivers get a dashboard and a downloadable report of what they earned, for their taxes.",
    ],
  },
  screens: [
    {
      kind: "screens",
      shape: "phone",
      src: "/work/ridly/search-results.png",
      caption: "Search results",
      alt: "Three rides from Copenhagen H to Aarhus C with departure times and prices, sortable by earliest or cheapest and filterable by trip type.",
    },
    {
      kind: "screens",
      shape: "phone",
      src: "/work/ridly/trip-detail.png",
      caption: "Trip detail",
      alt: "A long-distance trip: the driver's rating, 304 km, DKK 173.28 per seat at the SKAT-suggested rate, and 2 of 4 seats needed to confirm it.",
    },
    {
      kind: "screens",
      shape: "phone",
      src: "/work/ridly/chat.png",
      caption: "Chat",
      alt: "A chat between passenger and driver about meeting at the main entrance.",
    },
    {
      kind: "screens",
      shape: "phone",
      src: "/work/ridly/post-a-trip.png",
      caption: "Post a trip",
      alt: "The driver chooses between a daily commute on a weekly schedule and a one-off long-distance trip with a minimum number of passengers.",
    },
    {
      kind: "screens",
      shape: "phone",
      src: "/work/ridly/settlement.png",
      caption: "Settlement",
      alt: "Pay your driver: DKK 173 to send, the driver's MobilePay number to copy, and buttons to open MobilePay and to mark the payment as sent.",
    },
  ],
  architecture: {
    heading: "How it fits together",
    body: [
      "One Kotlin Multiplatform module holds the domain models, the repositories, Ktor networking and the ViewModels, wired with Koin. Android renders them in Compose Multiplatform, and the iOS app wraps the same ViewModels for SwiftUI, so the business logic is written once.",
      "The ViewModels follow MVI: the screen sends events, renders an immutable state, and handles one-shot effects such as navigation.",
      "The backend is a NestJS 11 API on PostgreSQL through Prisma. Supabase handles sign-in, and the API checks the token on every request. Socket.IO carries the chat, Mapbox turns addresses into routes and distances for pricing, and push notifications go out through Firebase Cloud Messaging and Apple’s push service. BullMQ on Redis runs the background jobs: deadline checks for one-off trips, extending recurring trips and matching search alerts. Trip origins and destinations are PostGIS geography points with spatial indexes, which is what trip search runs on. Sentry reports errors from all three apps.",
    ],
  },
  architectureMedia: [
    {
      kind: "architecture",
      src: "/work/ridly/architecture.svg",
      caption: "The shared Kotlin module under both apps, the NestJS API and the services around it. MobilePay sits outside the app.",
      alt: "Android (Compose Multiplatform) and iOS (SwiftUI) apps on a shared Kotlin Multiplatform module, which calls a NestJS API over REST and a WebSocket for chat. The API uses Supabase Auth, Mapbox, FCM and APNs, PostgreSQL with PostGIS, and Redis with BullMQ. Passengers pay drivers directly in MobilePay, outside the app.",
    },
  ],
  testEvidence: {
    heading: "Proof it holds up",
    body: [
      "k6 load tests ramp the API up in stages. The largest adds users every two minutes until 1,200 are active at once: 800 searching for trips and 400 signed in. At 300 virtual users, trip search had a p95 of 96 ms.",
      "A second k6 script attacks the API on purpose: missing fields, huge strings, broken tokens, unknown IDs and a burst of 50 requests a second on search. It fails if a single request gets a server error.",
      "CI runs the shared module's unit tests and builds the Android app on every push to main and every pull request into it. It builds the iOS app too, but that step can't fail the run yet, so an iOS build error would slip through.",
      "A review of the whole codebase lists what isn't solved yet, and that is the next work: two people booking the last seat at the same moment can both get it, completing a trip can fail halfway through creating the payment records, and creating the same recurring trip twice isn't fully prevented. The backend's own tests don't run in CI yet either.",
    ],
  },
  testRun: {
    kind: "test-run",
    src: "/work/ridly/k6-ramp.svg",
    caption: "The breakpoint ramp as configured in load-test.js, up to 1,200 virtual users.",
    alt: "A chart of the k6 breakpoint profile: searching users rise to 800 and signed-in users to 400 over 16 minutes, 1,200 in total, then ramp down. At 300 users, trip search had a p95 of 96 ms.",
  },
  impact: [
    { value: "96 ms", label: "Trip search p95", note: "At 300 virtual users, in a k6 ramp to 1,200" },
    { value: "1,200", label: "Virtual users", note: "Peak of the k6 breakpoint ramp" },
    { value: "387", label: "Commits, built solo" },
    { value: "2", label: "Platforms", note: "Android and iOS from one Kotlin codebase" },
  ],
  stack: [
    "Kotlin Multiplatform",
    "Compose Multiplatform",
    "SwiftUI",
    "Ktor",
    "Koin",
    "NestJS",
    "PostgreSQL",
    "PostGIS",
    "Prisma",
    "Supabase",
    "Socket.IO",
    "BullMQ",
    "k6",
  ],
};
