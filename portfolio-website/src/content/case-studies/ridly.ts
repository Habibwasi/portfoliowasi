import { placeholder } from "../placeholder";
import type { CaseStudy } from "../types";

/**
 * Facts come from the HOP-KMP repository (README, Agent.md, .github, apps/api/k6, Prisma
 * migrations; checked 2026-10-22) and the roadmap's decisions log. The k6 number is always
 * stated as p95 at the 300-user stage. Problem, decisions, screens, videos and the diagram
 * are supplied in Phase 7.
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
    src: placeholder("Ridly demo video"),
    caption: placeholder("Demo caption: one line on what the video shows"),
  },
  problem: {
    heading: "Why it needed to exist",
    body: [placeholder("Ridly problem: who needed a ride or had empty seats, how they arranged it before, and what that cost them")],
  },
  role: {
    heading: "What I built",
    body: [
      "I built Ridly alone: the shared Kotlin Multiplatform module, the Android app, the iOS app and the NestJS API. All 387 commits in the repository are mine.",
    ],
    points: [
      placeholder("A decision you made and why"),
      placeholder("A second decision, or a tradeoff you accepted"),
      placeholder("What you checked and how"),
    ],
  },
  aiInTheBuild: {
    heading: "AI in the build",
    body: [
      "Planning ran through my LangGraph workflow (AI_Workflow_Global). Agents draft each spec, and a human-in-the-loop gate stops at every step until I approve it or send it back.",
      "Claude Code and GitHub Copilot wrote code against rules kept in the repository. Agent.md records the architecture decisions and the verified library versions, and tells the agent to stop and ask when a request conflicts with them instead of inventing a change. A bug-audit skill gives Copilot a checklist of Ridly's own failure modes, such as missing Koin registrations, ViewModel idempotency guards and how money is displayed.",
      placeholder("Where you reviewed, rejected or corrected AI output on Ridly: one concrete example"),
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
    { kind: "screens", src: placeholder("Ridly screen: search results"), caption: "Search results" },
    { kind: "screens", src: placeholder("Ridly screen: trip detail"), caption: "Trip detail" },
    { kind: "screens", src: placeholder("Ridly screen: chat"), caption: "Chat" },
    { kind: "screens", src: placeholder("Ridly screen: post a trip"), caption: "Post a trip" },
    { kind: "screens", src: placeholder("Ridly screen: settlement"), caption: "Settlement" },
  ],
  architecture: {
    heading: "How it fits together",
    body: [
      "One Kotlin Multiplatform module holds the domain models, the repositories, Ktor networking and the ViewModels, wired with Koin. Android renders them in Compose Multiplatform, and the iOS app wraps the same ViewModels for SwiftUI, so the business logic is written once.",
      "The ViewModels follow MVI: the screen sends events, renders an immutable state, and handles one-shot effects such as navigation.",
      "The backend is a NestJS 11 API on PostgreSQL through Prisma. Supabase handles sign-in, Socket.IO carries the chat, and BullMQ queues the push notifications. Trip origins and destinations are PostGIS geography points with spatial indexes, which is what trip search runs on. Sentry reports errors from all three apps.",
    ],
  },
  architectureMedia: [
    {
      kind: "architecture",
      src: placeholder("Ridly architecture diagram"),
      caption: "The shared Kotlin module under both apps, and the NestJS API with PostgreSQL, Supabase, Socket.IO and BullMQ.",
    },
  ],
  testEvidence: {
    heading: "Proof it holds up",
    body: [
      "A k6 load test ramped from 300 to 600 to 1,500 virtual users against the API. At the 300-user stage, trip search had a p95 of 96 ms.",
      "A second k6 script attacks the API on purpose: missing fields, huge strings, broken tokens, unknown IDs and a burst of 50 requests a second on search. It fails if a single request gets a server error.",
      "CI runs the shared module's unit tests and builds both the Android and the iOS app on every push to main and every pull request into it.",
    ],
  },
  testRun: {
    kind: "test-run",
    src: placeholder("Ridly k6 run recording"),
    caption: "The k6 ramp from 300 to 1,500 virtual users.",
  },
  impact: [
    { value: "96 ms", label: "Trip search p95", note: "At 300 virtual users, in a k6 ramp to 1,500" },
    { value: "1,500", label: "Virtual users", note: "Peak of the k6 ramp" },
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
