import type { AppLanguage, SafetyCategory } from "@/types/safety";
import { env } from "@/lib/env";

export interface LlmModerationResult {
  safe: boolean;
  crisis: boolean;
  category?: SafetyCategory;
  reason?: string;
}

export function isLlmModerationAvailable(): boolean {
  return Boolean(env.alemlLm.apiUrl && env.alemlLm.apiKey);
}

/**
 * Ikkinchi bosqich: LLM-asoslangan moderatsiya.
 * API mavjud bo'lmasa — xavfsizlik uchun safe=false (fail-closed).
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
    const response = await fetch(env.alemlLm.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.alemlLm.apiKey}`,
      },
      body: JSON.stringify({
        model: env.alemlLm.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      return {
        safe: false,
        crisis: false,
        category: "other",
        reason: `LLM moderatsiya xatolik: ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
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
