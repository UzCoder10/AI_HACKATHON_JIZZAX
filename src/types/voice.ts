import type { AppLanguage } from "@/types/safety";
import type { AskAllomaResult } from "@/types/alloma";

export type OpenAiTtsVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

export interface TranscribeAudioResult {
  text: string;
  language: string;
  durationMs: number;
}

export interface SynthesizeSpeechResult {
  audio: Buffer;
  mimeType: string;
  voice: OpenAiTtsVoice;
  durationMs: number;
}

export interface AllomaVoiceChatParams {
  allomaId: string;
  audio: Buffer;
  audioMimeType?: string;
  audioFilename?: string;
  sessionId?: string;
  childId: string;
  age: number;
  name?: string;
  language: AppLanguage;
}

export interface AllomaVoiceChatResult extends AskAllomaResult {
  questionText: string;
  audioBase64: string;
  audioMimeType: string;
  voice: OpenAiTtsVoice;
  timings: {
    sttMs: number;
    llmMs: number;
    ttsMs: number;
    totalMs: number;
  };
}

export interface ApiTranscribeResponse {
  success: boolean;
  data?: TranscribeAudioResult;
  error?: string;
}

export interface ApiAllomaVoiceChatResponse {
  success: boolean;
  data?: AllomaVoiceChatResult;
  error?: string;
}
