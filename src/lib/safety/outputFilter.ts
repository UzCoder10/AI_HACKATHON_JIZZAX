import type { AppLanguage } from "@/types/safety";
import type { OutputFilterResult } from "@/types/safety";
import {
  BLOCK_PATTERNS,
  CRISIS_PATTERNS,
  MAX_OUTPUT_LENGTH,
  SUSPICIOUS_PATTERNS,
} from "./patterns";
import { getFallbackMessage } from "./fallbacks";
import { trimToAgeRegister } from "./ageGuard";
import { moderateWithLlm } from "./llmModeration";

function matchOutputPatterns(text: string): OutputFilterResult | null {
  const normalized = text.toLowerCase().trim();
  const allRules = [...CRISIS_PATTERNS, ...BLOCK_PATTERNS];

  for (const { pattern, category } of allRules) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        content: "",
        category,
        reason: `Chiqish filtri: ${category}`,
        stage: "rule",
      };
    }
  }
  return null;
}

function isSuspiciousOutput(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return SUSPICIOUS_PATTERNS.some(({ pattern }) => pattern.test(normalized));
}

export interface FilterOutputOptions {
  age: number;
  language: AppLanguage;
  useLlmModeration?: boolean;
}

/**
 * AI javobini tekshiradi va kerak bo'lsa fallback bilan almashtiradi.
 */
export async function filterOutput(
  text: string,
  options: FilterOutputOptions
): Promise<OutputFilterResult> {
  const { age, language, useLlmModeration = true } = options;

  if (!text.trim()) {
    return {
      safe: false,
      content: getFallbackMessage("output_blocked", language),
      category: "other",
      reason: "Bo'sh javob",
      stage: "rule",
    };
  }

  if (text.length > MAX_OUTPUT_LENGTH) {
    return {
      safe: false,
      content: getFallbackMessage("output_blocked", language),
      category: "other",
      reason: "Javob juda uzun",
      stage: "rule",
    };
  }

  const ruleMatch = matchOutputPatterns(text);
  if (ruleMatch) {
    return {
      ...ruleMatch,
      content: getFallbackMessage("output_blocked", language),
    };
  }

  if (isSuspiciousOutput(text)) {
    if (useLlmModeration) {
      const llm = await moderateWithLlm(text, "output", language);
      if (!llm.safe) {
        return {
          safe: false,
          content: getFallbackMessage("output_blocked", language),
          category: llm.category,
          reason: llm.reason ?? "Shubhali javob (LLM tekshiruvi)",
          stage: "llm",
        };
      }
    } else {
      return {
        safe: false,
        content: getFallbackMessage("output_blocked", language),
        category: "inappropriate",
        reason: "Shubhali javob — bloklandi",
        stage: "rule",
      };
    }
  }

  const trimmed = trimToAgeRegister(text, age);
  return { safe: true, content: trimmed, stage: "rule" };
}
