import type { RagChunk } from "@/types/figures";
import { getFigureFromCatalog } from "@/lib/rag/figuresCatalog";
import { resolveAllomaSlug } from "@/lib/rag/allomaIds";
import { query } from "@/lib/rag/ragflowAdminClient";
import { isRagflowAdminConfigured } from "@/lib/rag/ragflowHttp";
import { getSourceNames } from "@/lib/rag/ragflowClient.helpers";
import { getLocalAllomaContext, isLocalAllomaDataAvailable } from "@/lib/rag/localAllomaContext";
import { RagflowError } from "@/types/figures";

/** RAGFlow metadata `figure_slug` — ba'zi allomalar katalog slugidan farq qiladi */
export const RAG_FIGURE_SLUG: Record<string, string> = {
  "ibn-sino": "abu-ali-ibn-sino",
};

export function ragFigureSlug(catalogSlug: string): string {
  return RAG_FIGURE_SLUG[catalogSlug] ?? catalogSlug;
}

const DEFAULT_TOP_K = 5;
const DEFAULT_SIMILARITY_THRESHOLD = 0.25;

export interface AllomaContextOptions {
  topK?: number;
  similarityThreshold?: number;
  datasetId?: string;
}

export interface AllomaContextResult {
  /** Asl so'rov (beruniy, ibn_sino, ...) */
  allomaId: string;
  /** FIGURE_CATALOG slug */
  slug: string | null;
  /** O'zbekcha alloma nomi */
  figureName: string | null;
  question: string;
  /** Birlashtirilgan kontekst matni — LLM ga berish uchun tayyor */
  context: string;
  chunks: RagChunk[];
  sources: string[];
  /** Mos parcha topildimi */
  found: boolean;
  /** RAGFlow/xato — tizim qulamaydi, faqat izoh */
  error?: string;
}

function emptyResult(
  allomaId: string,
  question: string,
  partial: Pick<AllomaContextResult, "slug" | "figureName" | "error">
): AllomaContextResult {
  return {
    allomaId,
    slug: partial.slug ?? null,
    figureName: partial.figureName ?? null,
    question,
    context: "",
    chunks: [],
    sources: [],
    found: false,
    error: partial.error,
  };
}

/**
 * Parchalarni toza matn kontekstiga birlashtiradi (manba nomi bilan).
 */
export function buildAllomaContextText(chunks: RagChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map(
      (chunk, index) =>
        `[Manba ${index + 1}: ${chunk.source}]\n${chunk.content.trim()}`
    )
    .join("\n\n---\n\n");
}

function resolveDatasetId(explicit?: string): string | null {
  const id = explicit?.trim() || process.env.RAGFLOW_DATASET_ID?.trim();
  return id || null;
}

function formatRagflowError(error: unknown): string {
  if (error instanceof RagflowError) {
    if (error.code === "config") {
      return "RAGFlow sozlanmagan — ma'lumotlar bazasi ulanmagan";
    }
    if (error.code === "network") {
      return "RAGFlow vaqtincha ishlamayapti — keyinroq urinib ko'ring";
    }
    return `RAGFlow xatolik: ${error.message}`;
  }
  if (error instanceof Error) {
    return `RAGFlow xatolik: ${error.message}`;
  }
  return "RAGFlow bilan bog'lanishda noma'lum xatolik";
}

/**
 * Bola savoli uchun alloma bo'yicha RAGFlow kontekstini oladi.
 * AI javob generatsiya qilmaydi — faqat manba matn.
 */
export async function getAllomaContext(
  allomaId: string,
  question: string,
  options: AllomaContextOptions = {}
): Promise<AllomaContextResult> {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    return emptyResult(allomaId, question, { error: "Savol bo'sh bo'lmasligi kerak" });
  }

  const slug = resolveAllomaSlug(allomaId);
  if (!slug) {
    return emptyResult(allomaId, trimmedQuestion, {
      error: `Noma'lum alloma: "${allomaId}"`,
    });
  }

  const figure = getFigureFromCatalog(slug);
  if (!figure) {
    return emptyResult(allomaId, trimmedQuestion, {
      slug,
      error: `Alloma katalogda topilmadi: ${slug}`,
    });
  }

  const datasetId = resolveDatasetId(options.datasetId);
  if (!datasetId || !isRagflowAdminConfigured()) {
    return emptyResult(allomaId, trimmedQuestion, {
      slug,
      figureName: figure.nameUz,
      error: "RAGFlow sozlanmagan (RAGFLOW_API_URL, RAGFLOW_API_KEY, RAGFLOW_DATASET_ID)",
    });
  }

  try {
    const retrieval = await query(datasetId, trimmedQuestion, {
      topK: options.topK ?? DEFAULT_TOP_K,
      pageSize: options.topK ?? DEFAULT_TOP_K,
      similarityThreshold: options.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD,
      figureKeyword: figure.nameUz,
      metadataCondition: {
        figure_slug: ragFigureSlug(slug),
      },
    });

    if (retrieval.chunks.length === 0) {
      const local = tryLocalFallback(allomaId, slug, trimmedQuestion, "ragflow_empty");
      if (local) return local;

      return {
        allomaId,
        slug,
        figureName: figure.nameUz,
        question: trimmedQuestion,
        context: "",
        chunks: [],
        sources: [],
        found: false,
      };
    }

    const sources = getSourceNames(retrieval.chunks);
    const context = buildAllomaContextText(retrieval.chunks);

    return {
      allomaId,
      slug,
      figureName: figure.nameUz,
      question: trimmedQuestion,
      context,
      chunks: retrieval.chunks,
      sources,
      found: true,
    };
  } catch (error) {
    console.error("[getAllomaContext]", allomaId, error);
    const local = tryLocalFallback(allomaId, slug, trimmedQuestion, "ragflow_error");
    if (local) {
      local.error = formatRagflowError(error);
      return local;
    }
    return emptyResult(allomaId, trimmedQuestion, {
      slug,
      figureName: figure.nameUz,
      error: formatRagflowError(error),
    });
  }
}

function tryLocalFallback(
  allomaId: string,
  slug: string,
  question: string,
  reason: string
): AllomaContextResult | null {
  if (!isLocalAllomaDataAvailable(slug)) return null;

  const { chunks, sources } = getLocalAllomaContext(slug, question);
  if (chunks.length === 0) return null;

  const figure = getFigureFromCatalog(slug);
  const context = buildAllomaContextText(chunks);

  return {
    allomaId,
    slug,
    figureName: figure?.nameUz ?? null,
    question,
    context,
    chunks,
    sources,
    found: true,
  };
}

/** snake_case alias */
export const get_alloma_context = getAllomaContext;
