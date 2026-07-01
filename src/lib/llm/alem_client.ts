import { requireAlemlLm } from "@/lib/env";
import type { ChatCompletionOptions, ChatCompletionResult, ChatMessage } from "@/types/chat";
import type {
  ImageAnalysisOptions,
  LlmClient,
  SpeechSynthesisOptions,
  TextGenerationOptions,
  TranscribeOptions,
} from "./types";
import { LlmError } from "./types";

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

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function mapUsage(usage?: OpenAiCompletionResponse["usage"]) {
  if (!usage) return undefined;
  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
}

async function alemChatRequest(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult> {
  const { apiUrl, apiKey, model } = requireAlemlLm();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { signal, clear } = timeoutSignal(timeoutMs);

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
      throw new LlmError(
        `ALEMLLM API xatolik: ${response.status} ${body.slice(0, 200)}`,
        "alem",
        "api"
      );
    }

    const data = (await response.json()) as OpenAiCompletionResponse;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new LlmError("ALEMLLM bo'sh javob qaytardi", "alem", "parse");
    }

    return {
      content,
      finishReason: data.choices?.[0]?.finish_reason,
      usage: mapUsage(data.usage),
    };
  } catch (error) {
    clear();
    if (error instanceof LlmError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new LlmError("ALEMLLM so'rov vaqti tugadi", "alem", "timeout");
    }
    throw new LlmError(
      error instanceof Error ? error.message : "Tarmoq xatoligi",
      "alem",
      "network"
    );
  }
}

export const alemClient: LlmClient = {
  id: "alem",

  async generateText(prompt, system, options) {
    const messages: ChatMessage[] = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });
    const result = await alemChatRequest(messages, options);
    return result.content;
  },

  async generateChatCompletion(messages, options) {
    return alemChatRequest(messages, options);
  },

  async transcribeAudio() {
    throw new LlmError("ALEMLLM audio transkripsiya qo'llab-quvvatlamaydi", "alem", "unsupported");
  },

  async synthesizeSpeech() {
    throw new LlmError("ALEMLLM nutq sintezi qo'llab-quvvatlamaydi", "alem", "unsupported");
  },

  async analyzeImage() {
    throw new LlmError("ALEMLLM rasm tahlili qo'llab-quvvatlamaydi", "alem", "unsupported");
  },
};

/** Streaming — faqat ALEMLLM (mavjud alemClient stream oqimi) */
export async function* alemChatCompletionStream(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): AsyncGenerator<string, ChatCompletionResult, undefined> {
  const { apiUrl, apiKey, model } = requireAlemlLm();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { signal, clear } = timeoutSignal(timeoutMs);
  let fullContent = "";

  interface StreamChunk {
    choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
  }

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
      throw new LlmError(
        `ALEMLLM stream xatolik: ${response.status} ${body.slice(0, 200)}`,
        "alem",
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
          // invalid SSE line
        }
      }
    }

    if (!fullContent.trim()) {
      throw new LlmError("ALEMLLM stream bo'sh javob", "alem", "parse");
    }

    return { content: fullContent.trim(), finishReason: "stop" };
  } catch (error) {
    clear();
    throw error instanceof LlmError
      ? error
      : new LlmError(
          error instanceof Error ? error.message : "Stream xatolik",
          "alem",
          "network"
        );
  }
}

export function isAlemConfigured(): boolean {
  return Boolean(process.env.ALEMLLM_API_URL && process.env.ALEMLLM_API_KEY);
}

export type { TextGenerationOptions, TranscribeOptions, SpeechSynthesisOptions, ImageAnalysisOptions };
