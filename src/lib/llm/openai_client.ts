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
const DEFAULT_MODEL = "gpt-4o-mini";
const WHISPER_MODEL = "whisper-1";
const TTS_MODEL = "tts-1";
const DEFAULT_TTS_VOICE = "nova";

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new LlmError("OPENAI_API_KEY sozlanmagan", "openai", "config");
  }
  return key;
}

function modelName(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function chatCompletion(
  messages: ChatMessage[],
  options: TextGenerationOptions = {}
): Promise<ChatCompletionResult> {
  const apiKey = getApiKey();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { signal, clear } = timeoutSignal(timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName(),
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
      }),
      signal,
    });

    clear();

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new LlmError(
        `OpenAI API xatolik: ${response.status} ${body.slice(0, 200)}`,
        "openai",
        "api"
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new LlmError("OpenAI bo'sh javob qaytardi", "openai", "parse");
    }

    const usage = data.usage;
    return {
      content,
      finishReason: data.choices?.[0]?.finish_reason,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens ?? 0,
            completionTokens: usage.completion_tokens ?? 0,
            totalTokens: usage.total_tokens ?? 0,
          }
        : undefined,
    };
  } catch (error) {
    clear();
    if (error instanceof LlmError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new LlmError("OpenAI so'rov vaqti tugadi", "openai", "timeout");
    }
    throw new LlmError(
      error instanceof Error ? error.message : "Tarmoq xatoligi",
      "openai",
      "network"
    );
  }
}

function toBase64(data: Buffer | Uint8Array): string {
  return Buffer.from(data).toString("base64");
}

export const openaiClient: LlmClient = {
  id: "openai",

  async generateText(prompt, system, options) {
    const messages: ChatMessage[] = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });
    return (await chatCompletion(messages, options)).content;
  },

  async generateChatCompletion(messages, options) {
    return chatCompletion(messages, options);
  },

  async transcribeAudio(data, options = {}) {
    const apiKey = getApiKey();
    const form = new FormData();
    const blob = new Blob([Buffer.from(data)], {
      type: options.mimeType ?? "audio/webm",
    });
    form.append("file", blob, options.filename ?? "audio.webm");
    form.append("model", WHISPER_MODEL);
    if (options.language) form.append("language", options.language);
    if (options.prompt) form.append("prompt", options.prompt);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new LlmError(
        `OpenAI Whisper xatolik: ${response.status} ${body.slice(0, 200)}`,
        "openai",
        "api"
      );
    }

    const json = (await response.json()) as { text?: string };
    if (!json.text?.trim()) {
      throw new LlmError("Whisper bo'sh transkripsiya qaytardi", "openai", "parse");
    }
    return json.text.trim();
  },

  async synthesizeSpeech(text, options = {}) {
    const apiKey = getApiKey();
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: text,
        voice: options.voice ?? DEFAULT_TTS_VOICE,
        response_format: options.format ?? "mp3",
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new LlmError(
        `OpenAI TTS xatolik: ${response.status} ${body.slice(0, 200)}`,
        "openai",
        "api"
      );
    }

    return Buffer.from(await response.arrayBuffer());
  },

  async analyzeImage(image, prompt, options = {}) {
    const apiKey = getApiKey();
    const mime = options.mimeType ?? "image/jpeg";
    const imageUrl =
      typeof image === "string"
        ? image
        : `data:${mime};base64,${toBase64(image)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName(),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new LlmError(
        `OpenAI Vision xatolik: ${response.status} ${body.slice(0, 200)}`,
        "openai",
        "api"
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new LlmError("OpenAI Vision bo'sh javob", "openai", "parse");
    }
    return content;
  },
};

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
