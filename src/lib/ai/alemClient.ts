import { generateChatCompletion, alemChatCompletionStream, isLlmError } from "@/lib/llm";
import { AI_CONFIG } from "@/lib/llm/config";
import {
  AlemlLmError,
  type ChatCompletionOptions,
  type ChatCompletionResult,
  type ChatMessage,
} from "@/types/chat";
import type { AppLanguage } from "@/types/safety";
import { getFallbackMessage } from "@/lib/safety/fallbacks";

function safeFallback(language: AppLanguage): string {
  return getFallbackMessage("output_blocked", language);
}

function toAlemlLmError(error: unknown): AlemlLmError {
  if (isLlmError(error)) {
    const code =
      error.code === "timeout"
        ? "timeout"
        : error.code === "network"
          ? "network"
          : error.code === "config"
            ? "config"
            : error.code === "parse"
              ? "parse"
              : "api";
    return new AlemlLmError(error.message, code);
  }
  return new AlemlLmError(
    error instanceof Error ? error.message : "Noma'lum xatolik",
    "network"
  );
}

/**
 * LLM chat completion — AI_CONFIG.text provayderi orqali (default: ALEMLLM).
 * Mavjud importlar buzilmaydi.
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
  language: AppLanguage = "uz"
): Promise<ChatCompletionResult> {
  try {
    return await generateChatCompletion(messages, options);
  } catch (error) {
    if (error instanceof AlemlLmError) {
      console.error("[alemClient]", error.code, error.message);
    } else if (isLlmError(error)) {
      const mapped = toAlemlLmError(error);
      console.error("[alemClient]", mapped.code, mapped.message);
    } else {
      console.error("[alemClient]", error);
    }
    return {
      content: safeFallback(language),
      finishReason: "error_fallback",
    };
  }
}

/**
 * Streaming javob — hozircha faqat ALEMLLM provayderi uchun.
 */
export async function* createChatCompletionStream(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
  language: AppLanguage = "uz"
): AsyncGenerator<string, ChatCompletionResult, undefined> {
  let fullContent = "";

  if (AI_CONFIG.text !== "alem") {
    const fallback = safeFallback(language);
    yield fallback;
    return { content: fallback, finishReason: "error_fallback" };
  }

  try {
    return yield* alemChatCompletionStream(messages, options);
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
