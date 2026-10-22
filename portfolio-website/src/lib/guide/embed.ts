import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FeatureExtractionPipeline } from "@huggingface/transformers";
import { EMBED_TIMEOUT_MS, EMBEDDING_MODEL } from "./config";

let embedder: Promise<FeatureExtractionPipeline> | undefined;

/**
 * gte-small through Transformers.js, loaded once per instance. The model files come from the
 * Hugging Face Hub on first use and are cached in the temp folder (the only writable place
 * in a Vercel function).
 */
function loadEmbedder(): Promise<FeatureExtractionPipeline> {
  embedder ??= (async () => {
    const { env, pipeline } = await import("@huggingface/transformers");
    env.cacheDir = join(tmpdir(), "transformers-cache");
    return pipeline("feature-extraction", EMBEDDING_MODEL, { dtype: "q8" });
  })().catch((error) => {
    embedder = undefined;
    throw error;
  });
  return embedder;
}

/** Normalised mean-pooled embeddings, the same settings for the index and for queries. */
export async function embed(texts: string[]): Promise<number[][]> {
  const extract = await loadEmbedder();
  const output = await extract(texts, { pooling: "mean", normalize: true });
  return output.tolist() as number[][];
}

/**
 * The question's embedding, or null if the model isn't ready within the budget or fails.
 * The caller then searches by keyword alone; loading carries on for the next request.
 */
export async function embedQuery(text: string, timeoutMs = EMBED_TIMEOUT_MS): Promise<number[] | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  try {
    return await Promise.race([embed([text]).then(([vector]) => vector), timeout]);
  } catch (error) {
    console.error("Guide embedding failed; using keyword search:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
