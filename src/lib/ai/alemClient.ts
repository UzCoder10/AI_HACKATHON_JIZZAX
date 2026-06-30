import { requireAlemlLm } from "@/lib/env";
import {
  AlemlLmError,
  type ChatCompletionOptions,
  type ChatCompletionResult,
  type ChatMessage,
} from "@/types/chat";
import type { AppLanguage } from "@/types/safety";
import { getFallbackMessage } from "@/lib/safety/fallbacks";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1024;

interface OpenAiCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

function safeFallback(language: AppLanguage): string {
  return getFallbackMessage("output_blocked", language);
}

function createTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal;
  clear: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function mapUsage(usage?: OpenAiCompletionResponse["usage"]) {
  if (!usage) return undefined;
  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
}

/**
 * ALEMLLM ga oddiy (non-stream) chat/completions so'rovi.
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
  language: AppLanguage = "uz"
): Promise<ChatCompletionResult> {
  try {
    const { apiUrl, apiKey, model } = requireAlemlLm();
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const { signal, clear } = createTimeoutSignal(timeoutMs);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? DEFAULT_TEMPERATURE,
          max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
          stream: false,
        }),
        signal,
      });

      clear();

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new AlemlLmError(
          `ALEMLLM API xatolik: ${response.status} ${body.slice(0, 200)}`,
          "api"
        );
      }

      const data = (await response.json()) as OpenAiCompletionResponse;
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new AlemlLmError("ALEMLLM bo'sh javob qaytardi", "parse");
      }

      return {
        content,
        finishReason: data.choices?.[0]?.finish_reason,
        usage: mapUsage(data.usage),
      };
    } catch (error) {
      clear();
      if (error instanceof AlemlLmError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new AlemlLmError("ALEMLLM so'rov vaqti tugadi", "timeout");
      }
      throw new AlemlLmError(
        error instanceof Error ? error.message : "Tarmoq xatoligi",
        "network"
      );
    }
  } catch (error) {
    if (error instanceof AlemlLmError) {
      console.error("[alemClient]", error.code, error.message);
    } else {
      console.error("[alemClient]", error);
    }
    return {
      content: safeFallback(language),
      finishReason: "error_fallback",
    };
  }
}

interface StreamChunk {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
}

/**
 * ALEMLLM streaming javob — SSE tokenlar generatori.
 * Xatolikda bitta fallback string qaytaradi va tugaydi.
 */
export async function* createChatCompletionStream(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
  language: AppLanguage = "uz"
): AsyncGenerator<string, ChatCompletionResult, undefined> {
  let fullContent = "";

  try {
    const { apiUrl, apiKey, model } = requireAlemlLm();
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const { signal, clear } = createTimeoutSignal(timeoutMs);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? DEFAULT_TEMPERATURE,
          max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
          stream: true,
        }),
        signal,
      });

      clear();

      if (!response.ok || !response.body) {
        const body = await response.text().catch(() => "");
        throw new AlemlLmError(
          `ALEMLLM stream xatolik: ${response.status} ${body.slice(0, 200)}`,
          "api"
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload) as StreamChunk;
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              yield delta;
            }
          } catch {
            // noto'g'ri SSE qator — o'tkazib yuboriladi
          }
        }
      }

      if (!fullContent.trim()) {
        throw new AlemlLmError("Stream bo'sh javob", "parse");
      }

      return { content: fullContent.trim(), finishReason: "stop" };
    } catch (error) {
      clear();
      throw error;
    }
  } catch (error) {
    console.error("[alemClient stream]", error);
    const fallback = safeFallback(language);
    if (!fullContent) {
      yield fallback;
      fullContent = fallback;
    }
    return { content: fullContent, finishReason: "error_fallback" };
  }
}
