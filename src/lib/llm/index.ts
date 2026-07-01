import type { ChatCompletionResult, ChatMessage } from "@/types/chat";
import { alemClient } from "./alem_client";
import { claudeClient } from "./claude_client";
import { AI_CONFIG, providerFor, type AiCapability } from "./config";
import { openaiClient } from "./openai_client";
import type {
  AiProviderId,
  ImageAnalysisOptions,
  LlmClient,
  SpeechSynthesisOptions,
  TextGenerationOptions,
  TranscribeOptions,
} from "./types";
import { LlmError } from "./types";

export { AI_CONFIG, providerFor, type AiCapability } from "./config";
export type { AiProviderId, LlmClient, TextGenerationOptions, TranscribeOptions, SpeechSynthesisOptions, ImageAnalysisOptions } from "./types";
export { LlmError, isLlmError } from "./types";
export { alemClient, alemChatCompletionStream, isAlemConfigured } from "./alem_client";
export { openaiClient, isOpenAiConfigured } from "./openai_client";
export { claudeClient, anthropicClient, isAnthropicConfigured } from "./claude_client";

const CLIENTS: Record<AiProviderId, LlmClient> = {
  alem: alemClient,
  openai: openaiClient,
  anthropic: claudeClient,
};

export function getClient(provider: AiProviderId): LlmClient {
  return CLIENTS[provider];
}

export function clientFor(capability: AiCapability): LlmClient {
  return getClient(providerFor(capability));
}

/** Matn generatsiyasi — prompt + ixtiyoriy system */
export async function generateText(
  prompt: string,
  system?: string,
  options?: TextGenerationOptions
): Promise<string> {
  return clientFor("text").generateText(prompt, system, options);
}

/** Chat completion — tarixli suhbatlar uchun */
export async function generateChatCompletion(
  messages: ChatMessage[],
  options?: TextGenerationOptions
): Promise<ChatCompletionResult> {
  return clientFor("text").generateChatCompletion(messages, options);
}

/** STT — ovozni matnga (AI_CONFIG.voice) */
export async function transcribeAudio(
  file: Buffer | Uint8Array,
  options?: TranscribeOptions
): Promise<string> {
  return clientFor("voice").transcribeAudio(file, options);
}

/** TTS — matnni ovozga (AI_CONFIG.voice) */
export async function synthesizeSpeech(
  text: string,
  options?: SpeechSynthesisOptions
): Promise<Buffer> {
  return clientFor("voice").synthesizeSpeech(text, options);
}

/** Rasm tahlili (AI_CONFIG.image) */
export async function analyzeImage(
  image: Buffer | Uint8Array | string,
  prompt: string,
  options?: ImageAnalysisOptions
): Promise<string> {
  return clientFor("image").analyzeImage(image, prompt, options);
}

/** Moderatsiya uchun qisqa matn generatsiyasi */
export async function generateModerationText(
  prompt: string,
  system: string,
  options?: TextGenerationOptions
): Promise<string> {
  return clientFor("moderation").generateText(prompt, system, {
    temperature: 0,
    maxTokens: 200,
    ...options,
  });
}

export function describeAiConfig(): Record<AiCapability, AiProviderId> {
  return { ...AI_CONFIG };
}

export function assertProviderConfigured(provider: AiProviderId): void {
  if (provider === "openai" && !process.env.OPENAI_API_KEY?.trim()) {
    throw new LlmError("OPENAI_API_KEY sozlanmagan", "openai", "config");
  }
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY?.trim()) {
    throw new LlmError("ANTHROPIC_API_KEY sozlanmagan", "anthropic", "config");
  }
  if (provider === "alem" && !(process.env.ALEMLLM_API_URL && process.env.ALEMLLM_API_KEY)) {
    throw new LlmError("ALEMLLM muhit o'zgaruvchilari sozlanmagan", "alem", "config");
  }
}
