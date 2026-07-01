import { synthesizeSpeech, isOpenAiConfigured } from "@/lib/llm";
import { isLlmError } from "@/lib/llm/types";
import { getAllomaVoice } from "./allomaVoices";
import type { OpenAiTtsVoice, SynthesizeSpeechResult } from "@/types/voice";
import { VoiceError } from "./transcribeService";

const MAX_TTS_CHARS = 1500;

export async function synthesizeAllomaSpeech(
  text: string,
  allomaId: string,
  voiceOverride?: OpenAiTtsVoice
): Promise<SynthesizeSpeechResult> {
  const started = Date.now();

  if (!isOpenAiConfigured()) {
    throw new VoiceError("OpenAI API kaliti sozlanmagan (TTS uchun kerak)", "config");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new VoiceError("Ovozga aylantirish uchun matn bo'sh", "invalid_audio");
  }

  const input = trimmed.length > MAX_TTS_CHARS ? `${trimmed.slice(0, MAX_TTS_CHARS)}…` : trimmed;
  const voice = voiceOverride ?? getAllomaVoice(allomaId);

  try {
    const audio = await synthesizeSpeech(input, { voice, format: "mp3" });
    return {
      audio,
      mimeType: "audio/mpeg",
      voice,
      durationMs: Date.now() - started,
    };
  } catch (error) {
    if (error instanceof VoiceError) throw error;
    if (isLlmError(error)) {
      throw new VoiceError(error.message, "api");
    }
    throw new VoiceError(
      error instanceof Error ? error.message : "TTS xatolik",
      "api"
    );
  }
}
