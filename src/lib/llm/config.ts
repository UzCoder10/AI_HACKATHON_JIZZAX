import type { AiProviderId } from "./types";

function parseProvider(raw: string | undefined): AiProviderId | null {
  const v = raw?.trim().toLowerCase();
  if (!v) return null;
  if (v === "claude" || v === "anthropic") return "anthropic";
  if (v === "openai" || v === "gpt") return "openai";
  if (v === "alem" || v === "alemlLm") return "alem";
  return null;
}

function hasAlem(): boolean {
  return Boolean(process.env.ALEMLLM_API_URL && process.env.ALEMLLM_API_KEY);
}

function hasOpenAi(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

function hasAnthropic(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function defaultTextProvider(): AiProviderId {
  const explicit = parseProvider(process.env.AI_TEXT_PROVIDER);
  if (explicit) return explicit;
  if (hasAlem()) return "alem";
  if (hasAnthropic()) return "anthropic";
  if (hasOpenAi()) return "openai";
  return "alem";
}

function defaultVoiceProvider(): AiProviderId {
  const explicit = parseProvider(process.env.AI_VOICE_PROVIDER);
  if (explicit) return explicit;
  if (hasOpenAi()) return "openai";
  return "openai";
}

function defaultImageProvider(): AiProviderId {
  const explicit = parseProvider(process.env.AI_IMAGE_PROVIDER);
  if (explicit) return explicit;
  if (hasAnthropic()) return "anthropic";
  if (hasOpenAi()) return "openai";
  return "openai";
}

function defaultModerationProvider(): AiProviderId {
  const explicit = parseProvider(process.env.AI_MODERATION_PROVIDER);
  if (explicit) return explicit;
  return defaultTextProvider();
}

/**
 * Har bir AI vazifasi uchun provayder — .env orqali almashtirish mumkin.
 * Matn: AI_TEXT_PROVIDER=anthropic
 * Ovoz/STT: AI_VOICE_PROVIDER=openai|elevenlabs|muxlisa (yoki AI_STT_PROVIDER)
 * TTS hozircha OpenAI (AI_TTS_PROVIDER=openai, ixtiyoriy)
 */
export const AI_CONFIG = {
  text: defaultTextProvider(),
  voice: defaultVoiceProvider(),
  image: defaultImageProvider(),
  moderation: defaultModerationProvider(),
} as const;

export type AiCapability = keyof typeof AI_CONFIG;

export function providerFor(capability: AiCapability): AiProviderId {
  return AI_CONFIG[capability];
}
