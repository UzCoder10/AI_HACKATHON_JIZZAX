import type { TranscribeOptions } from "@/lib/llm/types";

export type SttProviderId = "openai" | "elevenlabs" | "muxlisa";

export interface SttTranscribeResult {
  text: string;
  provider: SttProviderId;
  latencyMs: number;
  /** Taxminiy audio davomiyligi (ms) — narx hisobi uchun */
  audioDurationMs?: number;
}

export interface SttClient {
  id: SttProviderId;
  isConfigured(): boolean;
  transcribe(data: Buffer, options?: TranscribeOptions): Promise<SttTranscribeResult>;
}

export interface SttPricingInfo {
  /** USD daqiqasi uchun (taxminiy) */
  usdPerMinute?: number;
  /** UZS daqiqasi uchun (Muxlisa) */
  uzsPerMinute?: number;
  note: string;
}
