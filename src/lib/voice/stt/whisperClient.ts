import { openaiClient, isOpenAiConfigured } from "@/lib/llm/openai_client";
import type { TranscribeOptions } from "@/lib/llm/types";
import type { SttClient, SttTranscribeResult } from "./types";

const UZ_WHISPER_PROMPT =
  "O'zbek tilida bola savoli. Kalit so'zlar: Beruniy, Ibn Sino, yulduzlar, matematika, shifokor, savol.";

export const whisperSttClient: SttClient = {
  id: "openai",

  isConfigured() {
    return isOpenAiConfigured();
  },

  async transcribe(data: Buffer, options: TranscribeOptions = {}): Promise<SttTranscribeResult> {
    const started = Date.now();
    const text = await openaiClient.transcribeAudio(data, {
      ...options,
      language: options.language ?? undefined,
      prompt: options.prompt ?? (options.language ? undefined : UZ_WHISPER_PROMPT),
    });
    return {
      text,
      provider: "openai",
      latencyMs: Date.now() - started,
    };
  },
};
