export type AppLanguage = "uz" | "ru";

export type SafetyCategory =
  | "violence"
  | "adult"
  | "self_harm"
  | "abuse"
  | "fear"
  | "personal_info"
  | "inappropriate"
  | "companion"
  | "diagnosis"
  | "other";

export type SafetySeverity = "low" | "medium" | "high";

export type SafetySource = "input" | "output" | "crisis";

export type FilterStage = "rule" | "llm";

export interface InputFilterResult {
  safe: boolean;
  crisis: boolean;
  category?: SafetyCategory;
  reason?: string;
  stage: FilterStage;
}

export interface OutputFilterResult {
  safe: boolean;
  content: string;
  category?: SafetyCategory;
  reason?: string;
  stage: FilterStage;
}

export interface SafetyEventPayload {
  childId?: string;
  sessionId?: string;
  source: SafetySource;
  severity: SafetySeverity;
  category?: SafetyCategory;
  summary: string;
}

export interface CrisisHandlerResult {
  childMessage: string;
  event: SafetyEventPayload;
}

export type AgeRegister = "simple" | "moderate" | "advanced";

export interface AgeGuardConfig {
  register: AgeRegister;
  maxSentenceWords: number;
  vocabularyLevel: string;
  systemHint: string;
}

export interface SafetyPipelineInput {
  text: string;
  direction: "input" | "output";
  age: number;
  language: AppLanguage;
  childId?: string;
  sessionId?: string;
  /** LLM ikkinchi bosqich moderatsiyasi (default: true) */
  useLlmModeration?: boolean;
}

export interface SafetyPipelineOutput {
  allowed: boolean;
  crisis: boolean;
  content: string;
  category?: SafetyCategory;
  eventLogged: boolean;
}
