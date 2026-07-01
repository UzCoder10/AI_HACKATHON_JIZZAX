import type { ChatCompletionResult, ChatMessage } from "@/types/chat";
import type {
  ImageAnalysisOptions,
  LlmClient,
  SpeechSynthesisOptions,
  TextGenerationOptions,
  TranscribeOptions,
} from "./types";
import { LlmError } from "./types";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_VERSION = "2023-06-01";

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new LlmError("ANTHROPIC_API_KEY sozlanmagan", "anthropic", "config");
  }
  return key;
}

function modelName(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function toAnthropicMessages(messages: ChatMessage[]) {
  let system: string | undefined;
  const anthropicMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      system = system ? `${system}\n\n${msg.content}` : msg.content;
      continue;
    }
    anthropicMessages.push({ role: msg.role, content: msg.content });
  }

  if (anthropicMessages.length === 0) {
    anthropicMessages.push({ role: "user", content: "" });
  }

  return { system, messages: anthropicMessages };
}

async function chatCompletion(
  messages: ChatMessage[],
  options: TextGenerationOptions = {}
): Promise<ChatCompletionResult> {
  const apiKey = getApiKey();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { signal, clear } = timeoutSignal(timeoutMs);
  const { system, messages: anthropicMessages } = toAnthropicMessages(messages);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: modelName(),
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.7,
        system,
        messages: anthropicMessages,
      }),
      signal,
    });

    clear();

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new LlmError(
        `Anthropic API xatolik: ${response.status} ${body.slice(0, 200)}`,
        "anthropic",
        "api"
      );
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      stop_reason?: string;
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const textBlock = data.content?.find((b) => b.type === "text");
    const content = textBlock?.text?.trim();
    if (!content) {
      throw new LlmError("Anthropic bo'sh javob qaytardi", "anthropic", "parse");
    }

    const usage = data.usage;
    return {
      content,
      finishReason: data.stop_reason,
      usage: usage
        ? {
            promptTokens: usage.input_tokens ?? 0,
            completionTokens: usage.output_tokens ?? 0,
            totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
          }
        : undefined,
    };
  } catch (error) {
    clear();
    if (error instanceof LlmError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new LlmError("Anthropic so'rov vaqti tugadi", "anthropic", "timeout");
    }
    throw new LlmError(
      error instanceof Error ? error.message : "Tarmoq xatoligi",
      "anthropic",
      "network"
    );
  }
}

function toBase64(data: Buffer | Uint8Array): string {
  return Buffer.from(data).toString("base64");
}

function mediaType(mime?: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  if (mime === "image/png") return "image/png";
  if (mime === "image/gif") return "image/gif";
  if (mime === "image/webp") return "image/webp";
  return "image/jpeg";
}

export const claudeClient: LlmClient = {
  id: "anthropic",

  async generateText(prompt, system, options) {
    const messages: ChatMessage[] = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });
    return (await chatCompletion(messages, options)).content;
  },

  async generateChatCompletion(messages, options) {
    return chatCompletion(messages, options);
  },

  async transcribeAudio() {
    throw new LlmError(
      "Anthropic audio transkripsiya qo'llab-quvvatlamaydi — AI_VOICE_PROVIDER=openai ishlating",
      "anthropic",
      "unsupported"
    );
  },

  async synthesizeSpeech() {
    throw new LlmError(
      "Anthropic nutq sintezi qo'llab-quvvatlamaydi — AI_VOICE_PROVIDER=openai ishlating",
      "anthropic",
      "unsupported"
    );
  },

  async analyzeImage(image, prompt, options = {}) {
    const apiKey = getApiKey();
    const mime = options.mimeType ?? "image/jpeg";

    let source: { type: "base64"; media_type: typeof mime extends string ? string : "image/jpeg"; data: string };
    if (typeof image === "string") {
      if (image.startsWith("data:")) {
        const match = image.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) throw new LlmError("Noto'g'ri data URL", "anthropic", "parse");
        source = { type: "base64", media_type: match[1], data: match[2] };
      } else if (image.startsWith("http")) {
        // URL — Claude API to'g'ridan-to'g'ri URL qabul qilmaydi; fetch va base64
        const imgRes = await fetch(image);
        if (!imgRes.ok) {
          throw new LlmError("Rasm URL yuklanmadi", "anthropic", "network");
        }
        const buf = Buffer.from(await imgRes.arrayBuffer());
        source = { type: "base64", media_type: mime, data: toBase64(buf) };
      } else {
        source = { type: "base64", media_type: mime, data: image };
      }
    } else {
      source = { type: "base64", media_type: mime, data: toBase64(image) };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: modelName(),
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType(mime),
                  data: source.data,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new LlmError(
        `Anthropic Vision xatolik: ${response.status} ${body.slice(0, 200)}`,
        "anthropic",
        "api"
      );
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const textBlock = data.content?.find((b) => b.type === "text");
    const content = textBlock?.text?.trim();
    if (!content) {
      throw new LlmError("Anthropic Vision bo'sh javob", "anthropic", "parse");
    }
    return content;
  },
};

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/** Alias: claude_client */
export { claudeClient as anthropicClient };
