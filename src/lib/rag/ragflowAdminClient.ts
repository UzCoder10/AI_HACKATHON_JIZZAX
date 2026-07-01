/**
 * RAGFlow admin API — knowledge base yaratish, hujjat yuklash, parse, query.
 * HTTP API: https://ragflow.io/docs/dev/http_api_reference
 *
 * Dataset = Knowledge Base
 * POST /api/v1/datasets — yaratish
 * POST /api/v1/datasets/{id}/documents — yuklash (multipart)
 * PUT  /api/v1/datasets/{id}/documents/{doc_id} — meta + parser_config
 * POST /api/v1/datasets/{id}/chunks — parse (document_ids)
 * POST /api/v1/retrieval — qidiruv
 */
import { readFileSync } from "fs";
import { basename, extname } from "path";
import type { RagChunk } from "@/types/figures";
import { RagflowError } from "@/types/figures";
import {
  getRagflowHttpConfig,
  ragflowRequest,
} from "./ragflowHttp";

/** O'zbek matn uchun tavsiya etilgan chunk sozlamalari */
export const UZBEK_PARSER_CONFIG = {
  chunk_method: "naive" as const,
  parser_config: {
    chunk_token_num: 512,
    delimiter: "\n\n",
    layout_recognize: "Plain Text",
    html4excel: false,
    auto_keywords: 0,
    auto_questions: 0,
    raptor: { use_raptor: false },
    graphrag: { use_graphrag: false },
  },
};

/** PDF uchun layout parser yoqiladi */
export const UZBEK_PDF_PARSER_CONFIG = {
  ...UZBEK_PARSER_CONFIG,
  parser_config: {
    ...UZBEK_PARSER_CONFIG.parser_config,
    layout_recognize: "DeepDOC" as const,
    task_page_size: 12,
  },
};

export interface KnowledgeBaseInfo {
  id: string;
  name: string;
  description?: string | null;
  documentCount?: number;
  chunkCount?: number;
  embeddingModel?: string;
}

export interface RagflowDocumentInfo {
  id: string;
  name: string;
  run?: string;
  progress?: number;
  chunkNum?: number;
  size?: number;
  metaFields?: Record<string, unknown>;
}

export interface UploadDocumentMetadata {
  figure_slug?: string;
  figure_name_uz?: string;
  figure_name_ru?: string;
  source?: string;
  [key: string]: string | undefined;
}

export interface UploadDocumentResult {
  documentId: string;
  name: string;
  datasetId: string;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit & { timeoutMs?: number },
  attempts = 3
): Promise<Response> {
  const timeoutMs = init.timeoutMs ?? 120_000;
  const { timeoutMs: _omit, ...fetchInit } = init;
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetch(url, {
        ...fetchInit,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      lastError = err;
      if (i + 1 < attempts) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      }
    }
  }
  throw lastError;
}

export interface QueryResult {
  chunks: RagChunk[];
  query: string;
  total?: number;
}

interface DatasetRecord {
  id: string;
  name: string;
  description?: string | null;
  document_count?: number;
  doc_num?: number;
  chunk_count?: number;
  chunk_num?: number;
  embedding_model?: string;
}

interface DocumentRecord {
  id: string;
  name?: string;
  location?: string;
  run?: string;
  progress?: number;
  chunk_num?: number;
  chunk_count?: number;
  size?: number;
  meta_fields?: Record<string, unknown>;
}

interface RetrievalChunk {
  content?: string;
  content_with_weight?: string;
  document_name?: string;
  docnm_kwd?: string;
  similarity?: number;
  vector_similarity?: number;
}

function parserConfigForFile(filePath: string) {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".pdf") return UZBEK_PDF_PARSER_CONFIG;
  return UZBEK_PARSER_CONFIG;
}

function mapDocument(d: DocumentRecord): RagflowDocumentInfo {
  return {
    id: d.id,
    name: d.name ?? d.location ?? d.id,
    run: d.run,
    progress: d.progress,
    chunkNum: d.chunk_num ?? d.chunk_count,
    size: d.size,
    metaFields: d.meta_fields,
  };
}

function mapChunk(c: RetrievalChunk, threshold: number): RagChunk | null {
  const content = (c.content_with_weight ?? c.content ?? "").trim();
  const score = c.similarity ?? c.vector_similarity ?? 0;
  if (!content || score < threshold) return null;
  return {
    content,
    source: c.document_name ?? c.docnm_kwd ?? "noma'lum manba",
    score,
  };
}

/**
 * Knowledge base (dataset) yaratish.
 * Agar RAGFLOW_DATASET_ID mavjud bo'lsa, seed skripti o'shani ishlatishi mumkin.
 */
export async function createKnowledgeBase(
  name: string,
  options: {
    description?: string;
    embeddingModel?: string;
    chunkMethod?: string;
    parserConfig?: Record<string, unknown>;
  } = {}
): Promise<KnowledgeBaseInfo> {
  const embeddingModel =
    options.embeddingModel ?? process.env.RAGFLOW_EMBEDDING_MODEL?.trim() ?? undefined;

  const body: Record<string, unknown> = {
    name,
    description: options.description ?? "Nihol — Buyuk Siymolar manbalari",
    permission: "me",
    chunk_method: options.chunkMethod ?? UZBEK_PARSER_CONFIG.chunk_method,
    parser_config: options.parserConfig ?? UZBEK_PARSER_CONFIG.parser_config,
  };

  if (embeddingModel) {
    body.embedding_model = embeddingModel;
  }

  const data = await ragflowRequest<DatasetRecord>("/api/v1/datasets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    documentCount: data.document_count ?? data.doc_num,
    chunkCount: data.chunk_count ?? data.chunk_num,
    embeddingModel: data.embedding_model,
  };
}

export async function getKnowledgeBase(datasetId: string): Promise<KnowledgeBaseInfo | null> {
  const list = await ragflowRequest<DatasetRecord[]>(
    `/api/v1/datasets?id=${encodeURIComponent(datasetId)}`,
    { method: "GET" }
  );
  const row = Array.isArray(list) ? list[0] : null;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    documentCount: row.document_count ?? row.doc_num,
    chunkCount: row.chunk_count ?? row.chunk_num,
    embeddingModel: row.embedding_model,
  };
}

export async function listDocuments(
  datasetId: string,
  page = 1,
  pageSize = 100
): Promise<RagflowDocumentInfo[]> {
  const data = await ragflowRequest<{ docs?: DocumentRecord[] } | DocumentRecord[]>(
    `/api/v1/datasets/${datasetId}/documents?page=${page}&page_size=${pageSize}&orderby=create_time&desc=true`,
    { method: "GET" }
  );

  const docs = Array.isArray(data) ? data : (data.docs ?? []);
  return docs.map(mapDocument);
}

/**
 * Hujjat yuklash + meta/parser sozlash + parse ishga tushirish.
 */
export async function uploadDocument(
  datasetId: string,
  filePath: string,
  metadata: UploadDocumentMetadata = {},
  options: { autoParse?: boolean; uploadName?: string } = {}
): Promise<UploadDocumentResult> {
  const { apiUrl, apiKey } = getRagflowHttpConfig();
  const fileName = options.uploadName ?? basename(filePath);
  const buffer = readFileSync(filePath);
  const parser = parserConfigForFile(filePath);

  const form = new FormData();
  form.append("file", new Blob([buffer]), fileName);

  const uploadRes = await fetchWithRetry(
    `${apiUrl}/api/v1/datasets/${datasetId}/documents`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      timeoutMs: 180_000,
    }
  );

  const uploadText = await uploadRes.text();
  let uploadJson: { code?: number; message?: string; data?: DocumentRecord[] };
  try {
    uploadJson = JSON.parse(uploadText) as typeof uploadJson;
  } catch {
    throw new RagflowError(
      `Yuklash javobi noto'g'ri: ${uploadRes.status} ${uploadText.slice(0, 200)}`,
      "parse"
    );
  }

  if (!uploadRes.ok || (uploadJson.code !== undefined && uploadJson.code !== 0)) {
    throw new RagflowError(
      uploadJson.message ?? `Yuklash xatolik HTTP ${uploadRes.status}`,
      "api"
    );
  }

  const uploaded = uploadJson.data?.[0];
  if (!uploaded?.id) {
    throw new RagflowError("Yuklangan hujjat ID qaytmadi", "parse");
  }

  const metaFields: Record<string, string> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (v) metaFields[k] = v;
  }

  await ragflowRequest(`/api/v1/datasets/${datasetId}/documents/${uploaded.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fileName,
      meta_fields: metaFields,
      chunk_method: parser.chunk_method,
      parser_config: parser.parser_config,
    }),
  });

  if (options.autoParse !== false) {
    await parseDocuments(datasetId, [uploaded.id]);
  }

  return {
    documentId: uploaded.id,
    name: fileName,
    datasetId,
  };
}

/** Hujjatlarni chunk qilish va indekslash */
export async function parseDocuments(datasetId: string, documentIds: string[]): Promise<void> {
  if (documentIds.length === 0) return;
  await ragflowRequest(`/api/v1/datasets/${datasetId}/chunks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_ids: documentIds }),
    timeoutMs: 120_000,
  });
}

/** Parse tugashini kutish (poll) */
export async function waitForDocumentsParsed(
  datasetId: string,
  documentIds: string[],
  options: { timeoutMs?: number; pollMs?: number; allowFailures?: boolean } = {}
): Promise<RagflowDocumentInfo[]> {
  const timeoutMs = options.timeoutMs ?? 600_000;
  const pollMs = options.pollMs ?? 4_000;
  const deadline = Date.now() + timeoutMs;
  const pending = new Set(documentIds);
  const failed: string[] = [];

  while (pending.size > 0 && Date.now() < deadline) {
    const docs = await listDocuments(datasetId, 1, 200);
    for (const doc of docs) {
      if (!pending.has(doc.id)) continue;
      const run = (doc.run ?? "").toUpperCase();
      const done = run === "DONE" || run === "3" || (doc.progress ?? 0) >= 1;
      const isFailed = run === "FAIL" || run === "CANCEL" || run === "4";
      if (done) pending.delete(doc.id);
      if (isFailed) {
        failed.push(doc.name);
        pending.delete(doc.id);
        if (!options.allowFailures) {
          throw new RagflowError(`Hujjat parse xatolik: ${doc.name} (${doc.run})`, "api");
        }
      }
    }
    if (pending.size > 0) {
      await new Promise((r) => setTimeout(r, pollMs));
    }
  }

  if (pending.size > 0) {
    throw new RagflowError(
      `Parse vaqti tugadi, kutilmoqda: ${[...pending].join(", ")}`,
      "network"
    );
  }

  if (failed.length > 0 && options.allowFailures) {
    console.warn(`  ⚠ Parse xatolik: ${failed.join(", ")}`);
  }

  const finalDocs = await listDocuments(datasetId, 1, 200);
  return finalDocs.filter((d) => documentIds.includes(d.id));
}

/**
 * Savol bo'yicha retrieval — mos parchalarni qaytaradi.
 */
export async function query(
  datasetId: string,
  question: string,
  options: {
    topK?: number;
    pageSize?: number;
    similarityThreshold?: number;
    figureKeyword?: string;
    documentIds?: string[];
    metadataCondition?: Record<string, unknown>;
  } = {}
): Promise<QueryResult> {
  const threshold = options.similarityThreshold ?? 0.35;
  const enrichedQuestion = options.figureKeyword
    ? `${options.figureKeyword}: ${question}`
    : question;

  const body: Record<string, unknown> = {
    question: enrichedQuestion,
    dataset_ids: [datasetId],
    page: 1,
    page_size: options.pageSize ?? options.topK ?? 5,
    top_k: options.topK ?? 5,
    similarity_threshold: threshold,
    keyword: true,
  };

  if (options.documentIds?.length) {
    body.document_ids = options.documentIds;
  }
  if (options.metadataCondition) {
    body.metadata_condition = options.metadataCondition;
  }

  const data = await ragflowRequest<{
    chunks?: RetrievalChunk[];
    total?: number;
  }>("/api/v1/retrieval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    timeoutMs: 30_000,
  });

  const chunks = (data.chunks ?? [])
    .map((c) => mapChunk(c, threshold))
    .filter((c): c is RagChunk => c !== null)
    .sort((a, b) => b.score - a.score);

  return {
    chunks,
    query: enrichedQuestion,
    total: data.total,
  };
}

export { isRagflowAdminConfigured } from "./ragflowHttp";

/** Alias — user naming */
export const create_knowledge_base = createKnowledgeBase;
export const upload_document = uploadDocument;

export async function listKnowledgeBases(page = 1, pageSize = 50): Promise<KnowledgeBaseInfo[]> {
  const data = await ragflowRequest<DatasetRecord[]>(
    `/api/v1/datasets?page=${page}&page_size=${pageSize}&orderby=create_time&desc=true`,
    { method: "GET" }
  );
  return (Array.isArray(data) ? data : []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    documentCount: row.document_count ?? row.doc_num,
    chunkCount: row.chunk_count ?? row.chunk_num,
    embeddingModel: row.embedding_model,
  }));
}

export async function deleteKnowledgeBase(datasetId: string): Promise<void> {
  await ragflowRequest(`/api/v1/datasets`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [datasetId] }),
  });
}

export async function deleteDocuments(datasetId: string, documentIds: string[]): Promise<void> {
  if (documentIds.length === 0) return;
  await ragflowRequest(`/api/v1/datasets/${datasetId}/documents`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: documentIds }),
  });
}

export async function deleteAllDocuments(datasetId: string): Promise<number> {
  const docs = await listDocuments(datasetId, 1, 500);
  if (docs.length === 0) return 0;
  await deleteDocuments(
    datasetId,
    docs.map((d) => d.id)
  );
  return docs.length;
}
