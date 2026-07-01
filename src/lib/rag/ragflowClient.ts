import type { RagRetrievalOptions, RagRetrievalResult } from "@/types/figures";
import { RagflowError } from "@/types/figures";
import { env, requireRagflow } from "@/lib/env";
import { query as adminQuery } from "./ragflowAdminClient";

export { buildRagContext, getSourceNames } from "./ragflowClient.helpers";

const DEFAULT_TOP_K = 5;
const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SIMILARITY_THRESHOLD = 0.35;

/**
 * RAGFlow retrieval — tekshirilgan manba bazasidan kontent qidirish.
 * Admin client `query()` orqali ishlaydi.
 */
export async function retrieveFromKnowledgeBase(
  question: string,
  options: RagRetrievalOptions = {}
): Promise<RagRetrievalResult> {
  if (!env.ragflow.apiUrl || !env.ragflow.apiKey || !env.ragflow.datasetId) {
    throw new RagflowError("RAGFlow muhit o'zgaruvchilari sozlanmagan", "config");
  }

  const { datasetId } = requireRagflow();
  const threshold = options.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD;

  try {
    const result = await adminQuery(options.datasetId ?? datasetId, question, {
      topK: options.topK ?? DEFAULT_TOP_K,
      pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
      similarityThreshold: threshold,
      figureKeyword: options.figureKeyword,
    });

    return {
      chunks: result.chunks,
      hasRelevantContent: result.chunks.length > 0,
      query: result.query,
    };
  } catch (error) {
    if (error instanceof RagflowError) throw error;
    throw new RagflowError(
      error instanceof Error ? error.message : "RAGFlow tarmoq xatoligi",
      "network"
    );
  }
}

export function isRagflowConfigured(): boolean {
  return Boolean(
    env.ragflow.apiUrl && env.ragflow.apiKey && env.ragflow.datasetId
  );
}
