import type { AppLanguage } from "@/types/safety";

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AskAllomaParams {
  allomaId: string;
  question: string;
  conversationHistory?: ConversationTurn[];
  sessionId?: string;
  childId?: string;
  age?: number;
  name?: string;
  language?: AppLanguage;
}

export interface AskAllomaResult {
  allomaId: string;
  slug: string;
  figureName: string;
  reply: string;
  sessionId: string;
  filtered: boolean;
  crisis: boolean;
  grounded: boolean;
  sources: string[];
  ragError?: string;
}

export interface ApiAllomaChatBody {
  alloma_id?: string;
  question?: string;
  session_id?: string;
  child_id?: string;
  childId?: string;
  age?: number;
  name?: string;
  language?: AppLanguage;
}

export interface ApiAllomaChatResponse {
  success: boolean;
  data?: AskAllomaResult;
  error?: string;
}
