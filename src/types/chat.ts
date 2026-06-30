import type { AppLanguage } from "@/types/safety";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  timeoutMs?: number;
}

export interface ChatCompletionResult {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SendMessageParams {
  childId: string;
  message: string;
  age: number;
  name: string;
  language: AppLanguage;
  conversationId?: string;
}

export interface SendMessageResult {
  conversationId: string;
  reply: string;
  filtered: boolean;
  crisis: boolean;
  error?: string;
}

export interface ApiChatResponse {
  success: boolean;
  data?: SendMessageResult;
  error?: string;
}

export class AlemlLmError extends Error {
  constructor(
    message: string,
    public readonly code: "timeout" | "network" | "api" | "parse" | "config"
  ) {
    super(message);
    this.name = "AlemlLmError";
  }
}
