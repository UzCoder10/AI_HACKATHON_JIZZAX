import type { ChatCompletionOptions, ChatCompletionResult, ChatMessage } from "@/types/chat";

export type AiProviderId = "openai" | "anthropic" | "alem";

export interface TextGenerationOptions extends ChatCompletionOptions {
  language?: "uz" | "ru";
}

export interface TranscribeOptions {
  language?: string;
  mimeType?: string;
  filename?: string;
  /** Whisper kontekst — o'zbekcha aniqlikni yaxshilash uchun */
  prompt?: string;
}

export interface SpeechSynthesisOptions {
  voice?: string;
  format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
}

export interface ImageAnalysisOptions {
  mimeType?: string;
}

export interface LlmClient {
  id: AiProviderId;
  generateText(prompt: string, system?: string, options?: TextGenerationOptions): Promise<string>;
  generateChatCompletion(
    messages: ChatMessage[],
    options?: TextGenerationOptions
  ): Promise<ChatCompletionResult>;
  transcribeAudio(data: Buffer | Uint8Array, options?: TranscribeOptions): Promise<string>;
  synthesizeSpeech(text: string, options?: SpeechSynthesisOptions): Promise<Buffer>;
  analyzeImage(
    image: Buffer | Uint8Array | string,
    prompt: string,
    options?: ImageAnalysisOptions
  ): Promise<string>;
}

export class LlmError extends Error {
  constructor(
    message: string,
    public readonly provider: AiProviderId,
    public readonly code: "config" | "api" | "parse" | "timeout" | "network" | "unsupported"
  ) {
    super(message);
    this.name = "LlmError";
  }
}

export function isLlmError(error: unknown): error is LlmError {
  return error instanceof LlmError;
}
