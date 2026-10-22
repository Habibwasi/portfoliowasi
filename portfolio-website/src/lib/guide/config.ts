/**
 * The guide's tunables in one place (spec: phase-3-guide.md, "Decisions made in this spec").
 * Swapping the model is a change to GUIDE_MODEL only.
 */
export const GUIDE_MODEL = "openai/gpt-oss-120b";

export const EMBEDDING_MODEL = "Xenova/gte-small";
export const EMBEDDING_DIMENSIONS = 384;

/** Chunks sent to the model as sources. */
export const TOP_K = 4;
/** Below this cosine, and with no keyword hit, a question counts as off-topic. */
export const MIN_COSINE = 0.76;
/** If no chunk reaches this cosine, the question is off-topic even with a stray keyword hit ("write a poem"). */
export const MIN_TOPIC_COSINE = 0.74;
/** Reciprocal rank fusion constant. */
export const RRF_K = 60;

/** Time the query embedding gets before the request falls back to keyword search. */
export const EMBED_TIMEOUT_MS = 4000;

export const MAX_QUESTION_LENGTH = 500;
export const MAX_MESSAGES = 20;
/** Messages actually sent to the model. */
export const HISTORY_MESSAGES = 6;
/** Length of the excerpt each source carries for the busy fallback (3.6). */
export const EXCERPT_LENGTH = 160;
/** gpt-oss counts its reasoning tokens in this limit. */
export const MAX_OUTPUT_TOKENS = 700;
