import type { AppLanguage } from "@/types/safety";

export interface RagChunk {
  content: string;
  source: string;
  score: number;
}

export interface RagRetrievalOptions {
  datasetId?: string;
  topK?: number;
  pageSize?: number;
  similarityThreshold?: number;
  /** Shaxs nomi — qidiruvni aniqlashtirish uchun */
  figureKeyword?: string;
}

export interface RagRetrievalResult {
  chunks: RagChunk[];
  hasRelevantContent: boolean;
  query: string;
}

export interface LangflowRunInput {
  question: string;
  ragContext: string;
  figureName: string;
  personaPrompt: string;
  language: AppLanguage;
  age: number;
  sessionId?: string;
}

export interface LangflowRunResult {
  content: string;
  sessionId?: string;
  source: "langflow" | "fallback";
}

export interface SendFigureMessageParams {
  slug: string;
  childId: string;
  message: string;
  age: number;
  name: string;
  language: AppLanguage;
  conversationId?: string;
}

export interface SendFigureMessageResult {
  conversationId: string;
  figureSlug: string;
  figureName: string;
  reply: string;
  filtered: boolean;
  crisis: boolean;
  grounded: boolean;
  sources: string[];
}

export interface ApiFigureChatResponse {
  success: boolean;
  data?: SendFigureMessageResult;
  error?: string;
}

export class RagflowError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "network" | "api" | "parse"
  ) {
    super(message);
    this.name = "RagflowError";
  }
}

export class LangflowError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "network" | "api" | "parse"
  ) {
    super(message);
    this.name = "LangflowError";
  }
}
