import type { AppLanguage } from "@/types/safety";
import type { InputFilterResult } from "@/types/safety";
import {
  BLOCK_PATTERNS,
  CRISIS_PATTERNS,
  MAX_INPUT_LENGTH,
  SUSPICIOUS_PATTERNS,
  summarizeForLog,
} from "./patterns";
import { moderateWithLlm } from "./llmModeration";

function matchPatterns(
  text: string,
  rules: typeof BLOCK_PATTERNS
): InputFilterResult | null {
  const normalized = text.toLowerCase().trim();
  for (const { pattern, category, crisis } of rules) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        crisis,
        category,
        reason: `Qoidaviy filtr: ${category}`,
        stage: "rule",
      };
    }
  }
  return null;
}

function isSuspicious(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return SUSPICIOUS_PATTERNS.some(({ pattern }) => pattern.test(normalized));
}

export interface FilterInputOptions {
  language?: AppLanguage;
  useLlmModeration?: boolean;
}

/**
 * Bola yuborgan matnni tekshiradi.
 * 1-bosqich: qoidaviy pattern
 * 2-bosqich: shubhali yoki noaniq holatda LLM moderatsiya (fail-closed)
 */
export async function filterInput(
  text: string,
  options: FilterInputOptions = {}
): Promise<InputFilterResult> {
  const { language = "uz", useLlmModeration = true } = options;

  if (!text.trim()) {
    return {
      safe: false,
      crisis: false,
      category: "other",
      reason: "Bo'sh xabar",
      stage: "rule",
    };
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return {
      safe: false,
      crisis: false,
      category: "other",
      reason: "Xabar juda uzun",
      stage: "rule",
    };
  }

  // Inqiroz — eng yuqori ustuvorlik
  const crisisMatch = matchPatterns(text, CRISIS_PATTERNS);
  if (crisisMatch) return crisisMatch;

  // Aniq xavfli kontent
  const blockMatch = matchPatterns(text, BLOCK_PATTERNS);
  if (blockMatch) return blockMatch;

  // Shubhali — LLM yoki fail-closed
  if (isSuspicious(text)) {
    if (useLlmModeration) {
      const llm = await moderateWithLlm(text, "input", language);
      return {
        safe: llm.safe,
        crisis: llm.crisis,
        category: llm.category,
        reason: llm.reason ?? "Shubhali kontent (LLM tekshiruvi)",
        stage: "llm",
      };
    }
    return {
      safe: false,
      crisis: false,
      category: "inappropriate",
      reason: "Shubhali kontent — bloklandi",
      stage: "rule",
    };
  }

  return { safe: true, crisis: false, stage: "rule" };
}

/** Log uchun qisqa xulosa */
export function inputSummaryForLog(text: string): string {
  return summarizeForLog(text);
}
