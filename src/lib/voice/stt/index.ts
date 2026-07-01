import type { TranscribeOptions } from "@/lib/llm/types";
import { elevenLabsSttClient } from "./elevenlabsClient";
import { muxlisaSttClient } from "./muxlisaClient";
import type { SttClient, SttPricingInfo, SttProviderId, SttTranscribeResult } from "./types";
import { whisperSttClient } from "./whisperClient";

export type { SttProviderId, SttTranscribeResult, SttPricingInfo } from "./types";
export { normalizeSttText, wordRecall, approximateWordErrorRate, accuracyPercent } from "./metrics";
export { isElevenLabsConfigured } from "./elevenlabsClient";
export { isMuxlisaConfigured } from "./muxlisaClient";

const CLIENTS: Record<SttProviderId, SttClient> = {
  openai: whisperSttClient,
  elevenlabs: elevenLabsSttClient,
  muxlisa: muxlisaSttClient,
};

export function parseSttProvider(raw: string | undefined): SttProviderId | null {
  const v = raw?.trim().toLowerCase();
  if (!v) return null;
  if (v === "openai" || v === "whisper" || v === "gpt") return "openai";
  if (v === "elevenlabs" || v === "scribe" || v === "eleven") return "elevenlabs";
  if (v === "muxlisa") return "muxlisa";
  return null;
}

export function getSttProvider(): SttProviderId {
  return (
    parseSttProvider(process.env.AI_STT_PROVIDER) ??
    parseSttProvider(process.env.AI_VOICE_PROVIDER) ??
    "openai"
  );
}

export function getSttClient(provider: SttProviderId = getSttProvider()): SttClient {
  return CLIENTS[provider];
}

export function isSttConfigured(provider: SttProviderId = getSttProvider()): boolean {
  return CLIENTS[provider].isConfigured();
}

export async function transcribeWithProvider(
  provider: SttProviderId,
  data: Buffer,
  options?: TranscribeOptions
): Promise<SttTranscribeResult> {
  const client = getSttClient(provider);
  if (!client.isConfigured()) {
    throw new Error(`${provider} STT uchun API kalit sozlanmagan`);
  }
  return client.transcribe(data, options);
}

export const STT_PRICING: Record<SttProviderId, SttPricingInfo> = {
  openai: {
    usdPerMinute: 0.006,
    note: "OpenAI Whisper-1 — $0.006/daq",
  },
  elevenlabs: {
    usdPerMinute: 0.0067,
    note: "ElevenLabs Scribe v2 — ~$0.40/soat (Creator) yoki $0.0067/daq",
  },
  muxlisa: {
    uzsPerMinute: 40,
    note: "Muxlisa STT — ~40 token/daq (kabinet balansi, muxlisa.uz narxlar)",
  },
};

export function estimateSttCostUsd(
  provider: SttProviderId,
  audioDurationSec: number
): number | null {
  const minutes = audioDurationSec / 60;
  const info = STT_PRICING[provider];
  if (info.usdPerMinute) return minutes * info.usdPerMinute;
  if (info.uzsPerMinute) {
    const uzsPerUsd = Number(process.env.UZS_PER_USD ?? 12500);
    return (minutes * info.uzsPerMinute) / uzsPerUsd;
  }
  return null;
}

export const ALL_STT_PROVIDERS: SttProviderId[] = ["openai", "elevenlabs", "muxlisa"];
