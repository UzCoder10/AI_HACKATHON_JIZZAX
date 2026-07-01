import type { TranscribeOptions } from "@/lib/llm/types";
import { LlmError } from "@/lib/llm/types";
import type { SttClient, SttTranscribeResult } from "./types";

const DEFAULT_MODEL = "scribe_v2";
const API_URL = "https://api.elevenlabs.io/v1/speech-to-text";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) {
    throw new LlmError("ELEVENLABS_API_KEY sozlanmagan", "openai", "config");
  }
  return key;
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

export const elevenLabsSttClient: SttClient = {
  id: "elevenlabs",

  isConfigured() {
    return isElevenLabsConfigured();
  },

  async transcribe(data: Buffer, options: TranscribeOptions = {}): Promise<SttTranscribeResult> {
    const started = Date.now();
    const apiKey = getApiKey();

    const form = new FormData();
    form.append("file", new Blob([data]), options.filename ?? "audio.mp3");
    form.append("model_id", process.env.ELEVENLABS_STT_MODEL?.trim() || DEFAULT_MODEL);
    // uzb — ISO 639-3; auto-detect ham mumkin
    const lang = options.language ?? process.env.ELEVENLABS_STT_LANGUAGE?.trim();
    if (lang) form.append("language_code", lang);

    const keyterms = process.env.ELEVENLABS_STT_KEYTERMS?.trim();
    if (keyterms) {
      for (const term of keyterms.split(",").map((t) => t.trim()).filter(Boolean)) {
        form.append("keyterms", term);
      }
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: form,
      signal: AbortSignal.timeout(120_000),
    });

    const body = await response.text();
    if (!response.ok) {
      throw new LlmError(
        `ElevenLabs Scribe xatolik: ${response.status} ${body.slice(0, 300)}`,
        "openai",
        "api"
      );
    }

    let json: { text?: string; language_code?: string };
    try {
      json = JSON.parse(body) as typeof json;
    } catch {
      throw new LlmError("ElevenLabs javobi noto'g'ri JSON", "openai", "parse");
    }

    const text = json.text?.trim();
    if (!text) {
      throw new LlmError("ElevenLabs bo'sh transkripsiya qaytardi", "openai", "parse");
    }

    return {
      text,
      provider: "elevenlabs",
      latencyMs: Date.now() - started,
    };
  },
};
