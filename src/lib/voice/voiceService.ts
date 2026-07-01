import { askAlloma } from "@/lib/rag/askAlloma";
import { getAllomaVoice } from "./allomaVoices";
import { transcribeVoiceAudio, VoiceError } from "./transcribeService";
import { synthesizeAllomaSpeech } from "./ttsService";
import type { AllomaVoiceChatParams, AllomaVoiceChatResult } from "@/types/voice";

export { VoiceError } from "./transcribeService";
export { transcribeVoiceAudio } from "./transcribeService";
export { synthesizeAllomaSpeech } from "./ttsService";
export { getAllomaVoice, listAllomaVoices } from "./allomaVoices";

/**
 * To'liq ovozli alloma oqimi: audio → STT → askAlloma → TTS.
 * TTS xatoligida ham matn javob qaytariladi.
 */
export async function runAllomaVoiceChat(
  params: AllomaVoiceChatParams
): Promise<AllomaVoiceChatResult> {
  const totalStart = Date.now();

  const sttResult = await transcribeVoiceAudio(params.audio, {
    language: params.language,
    mimeType: params.audioMimeType,
    filename: params.audioFilename,
  });

  const llmStart = Date.now();
  const chatResult = await askAlloma({
    allomaId: params.allomaId,
    question: sttResult.text,
    sessionId: params.sessionId,
    childId: params.childId,
    age: params.age,
    name: params.name,
    language: params.language,
  });
  const llmMs = Date.now() - llmStart;

  let audioBase64 = "";
  let audioMimeType = "audio/mpeg";
  let voice = getAllomaVoice(params.allomaId);
  let ttsMs = 0;

  try {
    const ttsResult = await synthesizeAllomaSpeech(chatResult.reply, params.allomaId);
    ttsMs = ttsResult.durationMs;
    audioBase64 = ttsResult.audio.toString("base64");
    audioMimeType = ttsResult.mimeType;
    voice = ttsResult.voice;
  } catch (error) {
    console.error("[runAllomaVoiceChat] TTS xatolik:", error);
  }

  return {
    ...chatResult,
    questionText: sttResult.text,
    audioBase64,
    audioMimeType,
    voice,
    timings: {
      sttMs: sttResult.durationMs,
      llmMs,
      ttsMs,
      totalMs: Date.now() - totalStart,
    },
  };
}
