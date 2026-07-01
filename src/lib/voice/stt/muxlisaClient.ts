import type { TranscribeOptions } from "@/lib/llm/types";
import { LlmError } from "@/lib/llm/types";
import { resolveAudioMimeType, sttUploadFilename } from "@/lib/voice/audioValidation";
import type { SttClient, SttTranscribeResult } from "./types";

const DEFAULT_URL = "https://service.muxlisa.uz/api/v2/stt";

function getApiKey(): string {
  const key = process.env.MUXLISA_API_KEY?.trim();
  if (!key) {
    throw new LlmError("MUXLISA_API_KEY sozlanmagan", "openai", "config");
  }
  return key;
}

function apiUrl(): string {
  return process.env.MUXLISA_STT_URL?.trim() || DEFAULT_URL;
}

export function isMuxlisaConfigured(): boolean {
  return Boolean(process.env.MUXLISA_API_KEY?.trim());
}

export const muxlisaSttClient: SttClient = {
  id: "muxlisa",

  isConfigured() {
    return isMuxlisaConfigured();
  },

  async transcribe(data: Buffer, options: TranscribeOptions = {}): Promise<SttTranscribeResult> {
    const started = Date.now();
    const apiKey = getApiKey();
    const mime = resolveAudioMimeType(options.mimeType, options.filename);
    const filename = sttUploadFilename(mime, options.filename);

    const form = new FormData();
    form.append("audio", new Blob([data], { type: mime }), filename);

    const response = await fetch(apiUrl(), {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: form,
      signal: AbortSignal.timeout(120_000),
    });

    const body = await response.text();
    if (!response.ok) {
      throw new LlmError(
        `Muxlisa STT xatolik: ${response.status} ${body.slice(0, 300)}`,
        "openai",
        "api"
      );
    }

    let json: { text?: string; message?: string; detail?: string };
    try {
      json = JSON.parse(body) as typeof json;
    } catch {
      throw new LlmError(`Muxlisa javobi noto'g'ri: ${body.slice(0, 200)}`, "openai", "parse");
    }

    const text = json.text?.trim();
    if (!text) {
      const msg = json.message ?? json.detail ?? body.slice(0, 200);
      throw new LlmError(`Muxlisa bo'sh javob: ${msg}`, "openai", "parse");
    }

    return {
      text,
      provider: "muxlisa",
      latencyMs: Date.now() - started,
    };
  },
};
