import { RagflowError } from "@/types/figures";

export interface RagflowHttpConfig {
  apiUrl: string;
  apiKey: string;
}

export interface RagflowApiEnvelope<T = unknown> {
  code?: number;
  message?: string;
  data?: T;
}

export function normalizeRagflowBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** process.env dan to'g'ridan-to'g'ri — CLI skriptlar uchun (import vaqtidan keyin .env yuklangan bo'lishi kerak) */
export function getRagflowHttpConfig(): RagflowHttpConfig {
  const apiUrl = process.env.RAGFLOW_API_URL?.trim();
  const apiKey = process.env.RAGFLOW_API_KEY?.trim();
  if (!apiUrl || !apiKey) {
    throw new RagflowError("RAGFlow muhit o'zgaruvchilari sozlanmagan", "config");
  }
  return {
    apiUrl: normalizeRagflowBaseUrl(apiUrl),
    apiKey,
  };
}

export async function ragflowRequest<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { apiUrl, apiKey } = getRagflowHttpConfig();
  const timeoutMs = init.timeoutMs ?? 60_000;
  const { timeoutMs: _omit, ...fetchInit } = init;

  const response = await fetch(`${apiUrl}${path}`, {
    ...fetchInit,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(fetchInit.headers ?? {}),
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  const text = await response.text().catch(() => "");
  let json: RagflowApiEnvelope<T>;
  try {
    json = JSON.parse(text) as RagflowApiEnvelope<T>;
  } catch {
    if (!response.ok) {
      throw new RagflowError(
        `RAGFlow API xatolik: ${response.status} ${text.slice(0, 200)}`,
        "api"
      );
    }
    throw new RagflowError("RAGFlow javobi JSON emas", "parse");
  }

  if (!response.ok || (json.code !== undefined && json.code !== 0)) {
    throw new RagflowError(
      `RAGFlow: ${json.message ?? response.status} ${text.slice(0, 200)}`,
      "api"
    );
  }

  return json.data as T;
}

export function isRagflowAdminConfigured(): boolean {
  return Boolean(process.env.RAGFLOW_API_URL?.trim() && process.env.RAGFLOW_API_KEY?.trim());
}
