/**
 * Builds the AI guide's index (3.3): chunks the site's content and embeds each chunk with
 * gte-small, then writes src/generated/guide-index.json. Run `npm run guide:index` after any
 * content change; a unit test fails while the committed index is out of date.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildChunks } from "@/lib/guide/chunks";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/guide/config";
import { embed } from "@/lib/guide/embed";
import type { GuideIndex } from "@/lib/guide/search";

const round = (x: number) => Math.round(x * 1e5) / 1e5;

async function main() {
  const chunks = buildChunks();
  // One chunk at a time, as queries are embedded: in a batch every chunk is padded to the longest,
  // so editing one chunk shifted all the others' vectors (and the off-topic cut-off with them).
  const vectors: number[][] = [];
  for (const c of chunks) vectors.push(...(await embed([`${c.title}. ${c.text}`])));
  const index: GuideIndex = {
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    chunks: chunks.map((chunk, i) => ({ ...chunk, embedding: vectors[i].map(round) })),
  };
  const file = join(process.cwd(), "src", "generated", "guide-index.json");
  await writeFile(file, `${JSON.stringify(index)}\n`);
  console.log(`Wrote ${chunks.length} chunks to ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
