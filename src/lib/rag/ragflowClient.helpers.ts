import type { RagChunk } from "@/types/figures";

/** Chunklardan LLM/LangFlow uchun kontekst matni */
export function buildRagContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map(
      (c, i) =>
        `[Manba ${i + 1}: ${c.source} (ishonchlilik: ${c.score.toFixed(2)})]\n${c.content}`
    )
    .join("\n\n---\n\n");
}

export function getSourceNames(chunks: RagChunk[]): string[] {
  return [...new Set(chunks.map((c) => c.source))];
}
