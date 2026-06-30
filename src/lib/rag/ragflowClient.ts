import { env, requireRagflow } from "@/lib/env";
import type { RagChunk, RagRetrievalOptions, RagRetrievalResult } from "@/types/figures";
import { RagflowError } from "@/types/figures";

const DEFAULT_TOP_K = 5;
const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SIMILARITY_THRESHOLD = 0.35;

interface RagflowApiChunk {
  content?: string;
  content_with_weight?: string;
  document_name?: string;
  docnm_kwd?: string;
  similarity?: number;
  vector_similarity?: number;
}

interface RagflowApiResponse {
  code?: number;
  message?: string;
  data?: {
    chunks?: RagflowApiChunk[];
    total?: number;
  };
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function extractContent(chunk: RagflowApiChunk): string {
  return (chunk.content_with_weight ?? chunk.content ?? "").trim();
}

function extractSource(chunk: RagflowApiChunk): string {
  return chunk.document_name ?? chunk.docnm_kwd ?? "noma'lum manba";
}

function extractScore(chunk: RagflowApiChunk): number {
  return chunk.similarity ?? chunk.vector_similarity ?? 0;
}

/**
 * RAGFlow retrieval — tekshirilgan manba bazasidan kontent qidirish.
 * Hallusinatsiyani kamaytirish uchun faqat yuqori o'xshashlikdagi chunklar qaytariladi.
 */
export async function retrieveFromKnowledgeBase(
  question: string,
  options: RagRetrievalOptions = {}
): Promise<RagRetrievalResult> {
  if (!env.ragflow.apiUrl || !env.ragflow.apiKey || !env.ragflow.datasetId) {
    throw new RagflowError("RAGFlow muhit o'zgaruvchilari sozlanmagan", "config");
  }

  const { apiUrl, apiKey, datasetId } = requireRagflow();
  const baseUrl = normalizeBaseUrl(apiUrl);
  const threshold = options.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD;

  const enrichedQuestion = options.figureKeyword
    ? `${options.figureKeyword}: ${question}`
    : question;

  const body = {
    question: enrichedQuestion,
    dataset_ids: [options.datasetId ?? datasetId],
    page: 1,
    page_size: options.pageSize ?? DEFAULT_PAGE_SIZE,
    top_k: options.topK ?? DEFAULT_TOP_K,
    similarity_threshold: threshold,
    keyword: true,
  };

  try {
    const response = await fetch(`${baseUrl}/api/v1/retrieval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new RagflowError(
        `RAGFlow API xatolik: ${response.status} ${text.slice(0, 200)}`,
        "api"
      );
    }

    const data = (await response.json()) as RagflowApiResponse;

    if (data.code !== undefined && data.code !== 0) {
      throw new RagflowError(
        `RAGFlow javob xatolik: ${data.message ?? data.code}`,
        "api"
      );
    }

    const rawChunks = data.data?.chunks ?? [];
    const chunks: RagChunk[] = rawChunks
      .map((c) => ({
        content: extractContent(c),
        source: extractSource(c),
        score: extractScore(c),
      }))
      .filter((c) => c.content.length > 0 && c.score >= threshold)
      .sort((a, b) => b.score - a.score);

    return {
      chunks,
      hasRelevantContent: chunks.length > 0,
      query: enrichedQuestion,
    };
  } catch (error) {
    if (error instanceof RagflowError) throw error;
    throw new RagflowError(
      error instanceof Error ? error.message : "RAGFlow tarmoq xatoligi",
      "network"
    );
  }
}

/** Chunklardan LLM/LangFlow uchun kontekst matni */
export function buildRagContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map((c, i) => `[Manba ${i + 1}: ${c.source} (ishonchlilik: ${c.score.toFixed(2)})]\n${c.content}`)
    .join("\n\n---\n\n");
}

export function getSourceNames(chunks: RagChunk[]): string[] {
  return [...new Set(chunks.map((c) => c.source))];
}

export function isRagflowConfigured(): boolean {
  return Boolean(
    env.ragflow.apiUrl && env.ragflow.apiKey && env.ragflow.datasetId
  );
}
