import type { AppLanguage, SafetyCategory } from "@/types/safety";
import {
  generateModerationText,
  isAlemConfigured,
  isAnthropicConfigured,
  isOpenAiConfigured,
} from "@/lib/llm";
import { AI_CONFIG } from "@/lib/llm/config";

export interface LlmModerationResult {
  safe: boolean;
  crisis: boolean;
  category?: SafetyCategory;
  reason?: string;
}

function isProviderConfigured(): boolean {
  switch (AI_CONFIG.moderation) {
    case "openai":
      return isOpenAiConfigured();
    case "anthropic":
      return isAnthropicConfigured();
    case "alem":
    default:
      return isAlemConfigured();
  }
}

export function isLlmModerationAvailable(): boolean {
  return isProviderConfigured();
}

/**
 * Ikkinchi bosqich: LLM-asoslangan moderatsiya.
 * AI_CONFIG.moderation provayderi orqali ishlaydi.
 */
export async function moderateWithLlm(
  text: string,
  direction: "input" | "output",
  language: AppLanguage
): Promise<LlmModerationResult> {
  if (!isLlmModerationAvailable()) {
    return {
      safe: false,
      crisis: false,
      category: "other",
      reason: "LLM moderatsiya sozlanmagan — shubha holatida bloklandi",
    };
  }

  const langLabel = language === "uz" ? "o'zbek" : "rus";
  const directionLabel =
    direction === "input" ? "bola yuborgan xabar" : "AI javobi";

  const systemPrompt = `Sen bolalar (7-12 yosh) xavfsizlik moderatorisan.
${directionLabel}ni tekshir. Faqat JSON qaytar:
{"safe":true/false,"crisis":true/false,"category":"violence|adult|self_harm|abuse|fear|personal_info|inappropriate|companion|diagnosis|other","reason":"..."}
Qoidalar: zo'ravonlik, kattalarga oid, o'z-o'ziga zarar, suiiste'mol, qo'rquv — blokla.
crisis=true faqat o'z-o'ziga zarar, suiiste'mol yoki jiddiy qo'rquv bo'lsa.
Til: ${langLabel}.`;

  try {
    const raw = await generateModerationText(text, systemPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        safe: false,
        crisis: false,
        category: "other",
        reason: "LLM javobi tahlil qilinmadi",
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      safe?: boolean;
      crisis?: boolean;
      category?: string;
      reason?: string;
    };

    return {
      safe: parsed.safe === true,
      crisis: parsed.crisis === true,
      category: (parsed.category as SafetyCategory) ?? "other",
      reason: parsed.reason,
    };
  } catch {
    return {
      safe: false,
      crisis: false,
      category: "other",
      reason: "LLM moderatsiya vaqtida xatolik",
    };
  }
}
