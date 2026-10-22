import { createGroq, type GroqLanguageModelChatOptions } from "@ai-sdk/groq";
import { ipAddress } from "@vercel/functions";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai";
import { guide } from "@/content/guide";
import index from "@/generated/guide-index.json";
import { GUIDE_MODEL, MAX_OUTPUT_TOKENS } from "@/lib/guide/config";
import { embedQuery } from "@/lib/guide/embed";
import { guideInstructions, guideRequest, questionOf, sourcesOf, trimHistory } from "@/lib/guide/prompt";
import type { GuideSource } from "@/lib/guide/answer";
import { createSearcher, type GuideIndex } from "@/lib/guide/search";
import { allowGuide } from "@/lib/rate-limit";

export const maxDuration = 30;

const search = createSearcher((index as GuideIndex).chunks);

/** A fixed answer streamed like a model answer, so the panel handles every reply the same way. */
function fixedAnswer(id: string, text: string, metadata: { sources: GuideSource[]; busy?: true }) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start", messageMetadata: metadata });
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
      writer.write({ type: "finish" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

/** Busy, with the matching parts of the site as a search-only fallback (3.6). */
const busy = (sources: GuideSource[]) => fixedAnswer("busy", guide.messages.busy, { sources, busy: true });

/** The client IP from Vercel; the forwarded header locally. */
function clientIp(request: Request): string {
  return ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * The AI guide's chat (3.3): validate, rate-limit, retrieve, then answer from the sources.
 * With no relevant source the answer is a fixed "I don't know" and the model isn't called.
 * When busy (over a limit or no key) it says so and lists the matches instead (3.6).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request couldn't be read." }, { status: 400 });
  }
  const parsed = guideRequest.safeParse(body);
  if (!parsed.success) return Response.json({ error: "The question couldn't be read." }, { status: 400 });

  const { messages } = parsed.data;
  const question = questionOf(messages);

  // Over a limit: keyword search only, so a limited visitor costs next to nothing.
  if (!(await allowGuide(clientIp(request)))) return busy(sourcesOf(search(question, null)));

  const hits = search(question, await embedQuery(question));
  const sources = sourcesOf(hits);

  if (hits.length === 0) return fixedAnswer("dont-know", guide.messages.dontKnow, { sources });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set");
    return busy(sources);
  }

  const result = streamText({
    model: createGroq({ apiKey })(GUIDE_MODEL),
    instructions: guideInstructions(hits),
    messages: await convertToModelMessages(trimHistory(messages)),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    maxRetries: 1,
    providerOptions: { groq: { reasoningEffort: "low", reasoningFormat: "hidden" } satisfies GroqLanguageModelChatOptions },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      messageMetadata: ({ part }) => (part.type === "start" ? { sources } : undefined),
      // A Groq limit or outage shows the busy state and the sources as matches; details stay in the logs.
      onError: (error) => {
        console.error("Guide model failed:", error);
        return "busy";
      },
    }),
  });
}
