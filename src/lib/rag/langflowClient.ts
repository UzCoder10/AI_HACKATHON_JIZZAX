import { env, requireLangflow } from "@/lib/env";
import type { LangflowRunInput, LangflowRunResult } from "@/types/figures";
import { LangflowError } from "@/types/figures";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** LangFlow javobidan matn ajratish */
export function extractLangflowText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const obj = payload as Record<string, unknown>;

  // To'g'ridan-to'g'ri message maydonlari
  if (typeof obj.message === "string") return obj.message;
  if (typeof obj.text === "string") return obj.text;
  if (typeof obj.output === "string") return obj.output;

  // outputs[].outputs[].results.message.text
  if (Array.isArray(obj.outputs)) {
    for (const output of obj.outputs) {
      const text = extractLangflowText(output);
      if (text) return text;

      if (output && typeof output === "object") {
        const out = output as Record<string, unknown>;
        if (Array.isArray(out.outputs)) {
          for (const nested of out.outputs) {
            const nestedText = extractLangflowText(nested);
            if (nestedText) return nestedText;

            if (nested && typeof nested === "object") {
              const n = nested as Record<string, unknown>;
              const results = n.results as Record<string, unknown> | undefined;
              const message = results?.message as Record<string, unknown> | undefined;
              if (typeof message?.text === "string") return message.text;
              if (typeof message?.data === "string") return message.data;
            }
          }
        }
      }
    }
  }

  // artifacts
  const artifacts = obj.artifacts as Record<string, unknown> | undefined;
  if (typeof artifacts?.message === "string") return artifacts.message;

  return null;
}

function buildFlowInput(input: LangflowRunInput): string {
  return JSON.stringify({
    question: input.question,
    rag_context: input.ragContext,
    figure_name: input.figureName,
    persona_prompt: input.personaPrompt,
    language: input.language,
    age: input.age,
    rules: [
      "Faqat rag_context dagi faktlardan foydalan",
      "Companion emas — ta'limiy persona",
      "Ma'lumot yetarli emas bo'lsa o'ylab topma",
    ],
  });
}

/**
 * LangFlow flow: retrieval konteksti + shaxs persona -> javob generatsiyasi.
 */
export async function runFigureFlow(input: LangflowRunInput): Promise<LangflowRunResult> {
  if (!env.langflow.apiUrl || !env.langflow.flowId) {
    throw new LangflowError("LangFlow muhit o'zgaruvchilari sozlanmagan", "config");
  }

  const { apiUrl, flowId, apiKey } = requireLangflow();
  const baseUrl = normalizeBaseUrl(apiUrl);
  const url = `${baseUrl}/api/v1/run/${flowId}?stream=false`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  const payload = {
    input_value: buildFlowInput(input),
    input_type: "chat",
    output_type: "chat",
    session_id: input.sessionId,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new LangflowError(
        `LangFlow API xatolik: ${response.status} ${text.slice(0, 200)}`,
        "api"
      );
    }

    const data = await response.json();
    const content = extractLangflowText(data);

    if (!content?.trim()) {
      throw new LangflowError("LangFlow bo'sh javob qaytardi", "parse");
    }

    const sessionId =
      typeof data === "object" && data !== null && "session_id" in data
        ? String((data as Record<string, unknown>).session_id)
        : input.sessionId;

    return { content: content.trim(), sessionId, source: "langflow" };
  } catch (error) {
    if (error instanceof LangflowError) throw error;
    throw new LangflowError(
      error instanceof Error ? error.message : "LangFlow tarmoq xatoligi",
      "network"
    );
  }
}

export function isLangflowConfigured(): boolean {
  return Boolean(env.langflow.apiUrl && env.langflow.flowId);
}
