import { resolveAllomaSlug } from "@/lib/rag/allomaIds";
import type { OpenAiTtsVoice } from "@/types/voice";

/** Har alloma uchun OpenAI TTS ovozi — turli xarakter */
const VOICES_BY_SLUG: Record<string, OpenAiTtsVoice> = {
  "abu-rayhon-beruniy": "onyx",
  "mirzo-ulugbek": "echo",
  "ibn-sino": "fable",
  "alisher-navoiy": "shimmer",
  "al-xorazmiy": "alloy",
  "amir-temur": "onyx",
  "imom-al-buxoriy": "echo",
};

const DEFAULT_VOICE: OpenAiTtsVoice = "nova";

export function getAllomaVoice(allomaIdOrSlug: string): OpenAiTtsVoice {
  const slug = resolveAllomaSlug(allomaIdOrSlug) ?? allomaIdOrSlug;
  return VOICES_BY_SLUG[slug] ?? DEFAULT_VOICE;
}

export function listAllomaVoices(): Record<string, OpenAiTtsVoice> {
  return { ...VOICES_BY_SLUG };
}
