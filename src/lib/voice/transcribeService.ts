import { isLlmError } from "@/lib/llm/types";
import {
  resolveAudioMimeType,
  sttLanguageCode,
  sttUploadFilename,
  validateAudioBuffer,
} from "./audioValidation";
import {
  getSttProvider,
  isSttConfigured,
  transcribeWithProvider,
} from "./stt";
import type { TranscribeAudioResult } from "@/types/voice";
import type { AppLanguage } from "@/types/safety";

export class VoiceError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "invalid_audio" | "empty_transcript" | "api"
  ) {
    super(message);
    this.name = "VoiceError";
  }
}

export interface TranscribeOptions {
  language?: AppLanguage;
  mimeType?: string;
  filename?: string;
}

export async function transcribeVoiceAudio(
  audio: Buffer,
  options: TranscribeOptions = {}
): Promise<TranscribeAudioResult> {
  const started = Date.now();
  const provider = getSttProvider();

  if (!isSttConfigured(provider)) {
    throw new VoiceError(
      `${provider} STT uchun API kalit sozlanmagan (AI_VOICE_PROVIDER / AI_STT_PROVIDER)`,
      "config"
    );
  }

  const validation = validateAudioBuffer(audio, options.mimeType);
  if (!validation.ok) {
    throw new VoiceError(validation.error, "invalid_audio");
  }

  const language = options.language ?? "uz";
  const mimeType = resolveAudioMimeType(validation.mimeType, options.filename);
  const filename = sttUploadFilename(mimeType, options.filename);

  try {
    const langCode = sttLanguageCode(language);
    const result = await transcribeWithProvider(provider, audio, {
      ...(langCode && provider === "openai" ? { language: langCode } : {}),
      mimeType,
      filename,
    });

    const trimmed = result.text.trim();
    if (!trimmed || trimmed.length < 2) {
      throw new VoiceError(
        "Ovozingizni tushunmadim. Iltimos, aniqroq va biroz sekinroq gapiring.",
        "empty_transcript"
      );
    }

    return {
      text: trimmed,
      language,
      durationMs: Date.now() - started,
    };
  } catch (error) {
    if (error instanceof VoiceError) throw error;
    if (isLlmError(error)) {
      if (error.code === "parse") {
        throw new VoiceError(
          "Ovozingizni tushunmadim. Iltimos, qayta gapiring.",
          "empty_transcript"
        );
      }
      throw new VoiceError(error.message, "api");
    }
    throw new VoiceError(
      error instanceof Error ? error.message : "STT xatolik",
      "api"
    );
  }
}
