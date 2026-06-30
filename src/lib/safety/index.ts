import type { SafetyPipelineInput, SafetyPipelineOutput } from "@/types/safety";
import { filterInput, inputSummaryForLog } from "./inputFilter";
import { filterOutput } from "./outputFilter";
import { handleCrisis } from "./crisisHandler";
import { getFallbackMessage } from "./fallbacks";
import { logSafetyEvent, severityForCategory } from "./safetyEvent";

export interface FilterChildInputParams {
  text: string;
  age: number;
  language: SafetyPipelineInput["language"];
  childId?: string;
  sessionId?: string;
  useLlmModeration?: boolean;
}

export interface FilterChildInputResult {
  allowed: boolean;
  crisis: boolean;
  content: string;
  category?: SafetyPipelineOutput["category"];
  eventLogged: boolean;
}

/**
 * Bola kirishini to'liq xavfsizlik qatlamidan o'tkazadi.
 */
export async function filterChildInput(
  params: FilterChildInputParams
): Promise<FilterChildInputResult> {
  const { text, age, language, childId, sessionId, useLlmModeration } = params;

  const inputResult = await filterInput(text, { language, useLlmModeration });

  if (inputResult.safe) {
    return { allowed: true, crisis: false, content: text, eventLogged: false };
  }

  if (inputResult.crisis) {
    const crisis = handleCrisis({
      childId,
      sessionId,
      age,
      language,
      category: inputResult.category,
      originalText: text,
    });
    const eventLogged = await logSafetyEvent(crisis.event);
    return {
      allowed: false,
      crisis: true,
      content: crisis.childMessage,
      category: inputResult.category,
      eventLogged,
    };
  }

  const eventLogged = await logSafetyEvent({
    childId,
    sessionId,
    source: "input",
    severity: severityForCategory(false, "input"),
    category: inputResult.category,
    summary: `Kirish bloklandi (${inputResult.category ?? "other"}): ${inputSummaryForLog(text)}`,
  });

  return {
    allowed: false,
    crisis: false,
    content: getFallbackMessage("input_blocked", language),
    category: inputResult.category,
    eventLogged,
  };
}

export interface FilterAiOutputParams {
  text: string;
  age: number;
  language: SafetyPipelineInput["language"];
  childId?: string;
  sessionId?: string;
  useLlmModeration?: boolean;
}

/**
 * AI chiqishini xavfsizlik qatlamidan o'tkazadi.
 */
export async function filterAiOutput(
  params: FilterAiOutputParams
): Promise<FilterChildInputResult> {
  const { text, age, language, childId, sessionId, useLlmModeration } = params;

  const outputResult = await filterOutput(text, { age, language, useLlmModeration });

  if (outputResult.safe) {
    return {
      allowed: true,
      crisis: false,
      content: outputResult.content,
      eventLogged: false,
    };
  }

  const eventLogged = await logSafetyEvent({
    childId,
    sessionId,
    source: "output",
    severity: severityForCategory(false, "output"),
    category: outputResult.category,
    summary: `Chiqish bloklandi (${outputResult.category ?? "other"}): ${outputResult.reason ?? ""}`,
  });

  return {
    allowed: false,
    crisis: false,
    content: outputResult.content,
    category: outputResult.category,
    eventLogged,
  };
}

/**
 * To'liq suhbat oqimi: kirish → (AI) → chiqish
 * Har bir AI muloqotida shu funksiyalar chaqiriladi.
 */
export { filterInput } from "./inputFilter";
export { filterOutput } from "./outputFilter";
export { handleCrisis } from "./crisisHandler";
export { getAgeGuardConfig, getAgeRegister, buildAgeSystemPrompt } from "./ageGuard";
export { logSafetyEvent } from "./safetyEvent";
