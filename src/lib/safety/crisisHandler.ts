import type {
  AppLanguage,
  CrisisHandlerResult,
  SafetyCategory,
} from "@/types/safety";
import { getCrisisMessageByAge } from "./fallbacks";
import { inputSummaryForLog } from "./inputFilter";

export interface CrisisHandlerOptions {
  childId?: string;
  sessionId?: string;
  age: number;
  language: AppLanguage;
  category?: SafetyCategory;
  originalText: string;
}

/**
 * Inqiroz aniqlanganda:
 * - Bolaga yoshga mos tinchlantiruvchi javob
 * - Ota-onaga HIGH severity SafetyEvent
 * Tashxis QO'YILMAYDI.
 */
export function handleCrisis(options: CrisisHandlerOptions): CrisisHandlerResult {
  const { childId, sessionId, age, language, category, originalText } = options;

  const childMessage = getCrisisMessageByAge(age, language);

  const categoryLabel = category ?? "crisis";
  const summary = `Inqiroz ishorasi (${categoryLabel}): ${inputSummaryForLog(originalText)}`;

  return {
    childMessage,
    event: {
      childId,
      sessionId,
      source: "crisis",
      severity: "high",
      category,
      summary,
    },
  };
}
