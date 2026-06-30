import type { AppLanguage } from "@/types/safety";
import { buildAgeSystemPrompt } from "@/lib/safety/ageGuard";

export interface FigurePersonaContext {
  figureName: string;
  field: string;
  personaPrompt: string;
  language: AppLanguage;
  age: number;
  ragContext: string;
  question: string;
}

const GROUNDED_RULES_UZ = `
ANIQLIK KAFOLATI (buzish taqiqlangan):
1. Faqat senga berilgan MANBA KONTEKSTidagi faktlardan foydalan.
2. Manbada yo'q narsani o'ylab topma, taxmin qilma, to'qima hikoya qilma.
3. Agar savolga manbada javob bo'lmasa, aniq ayting: "Bu haqda tekshirilgan manbalarimda aniq ma'lumot yo'q."
4. Companion emassan — ta'limiy tarixiy shaxs personasidasan, "do'st" emas.
5. Romantik, terapevtik yoki shaxsiy munosabat o'yin qilma.
6. Sen AI orqali yaratilgan ta'limiy persona ekaningni yashirma.
7. Muhim mavzularda zamonaviy ota-ona/o'qituvchiga murojaat qilishni eslat.
`.trim();

const GROUNDED_RULES_RU = `
ГАРАНТИЯ ТОЧНОСТИ (нарушать запрещено):
1. Используй ТОЛЬКО факты из предоставленного КОНТЕКСТА ИСТОЧНИКОВ.
2. Не выдумывай, не додумывай и не придумывай истории.
3. Если в источниках нет ответа, честно скажи: «У меня нет точных проверенных сведений об этом».
4. Ты не друг — ты образовательная историческая персона.
5. Никакой романтики, терапии или личных отношений.
6. Не скрывай, что ты AI-образовательная персона.
7. По важным темам напоминай обратиться к родителям или учителю.
`.trim();

/** Manba yo'q bo'lganda — LLM chaqirilmaydi, shaxs ovozida tayyor javob */
export function getNoSourceReply(figureName: string, language: AppLanguage): string {
  if (language === "uz") {
    return `Men ${figureName}man. Bu savol bo'yicha tekshirilgan manbalarimda aniq ma'lumot topilmadi. Boshqa savol bering yoki o'qituvchingiz bilan ham maslahatlashing.`;
  }
  return `Я ${figureName}. По этому вопросу у меня нет точных проверенных сведений в источниках. Задай другой вопрос или посоветуйся с учителем.`;
}

export function buildFigureSystemPrompt(ctx: FigurePersonaContext): string {
  const rules = ctx.language === "uz" ? GROUNDED_RULES_UZ : GROUNDED_RULES_RU;
  const langNote =
    ctx.language === "uz"
      ? "Javob o'zbek tilida, tabiiy va ta'limiy ohangda bo'lsin."
      : "Ответ на русском языке, естественно и по-учительски.";

  return [
    `Sen ${ctx.figureName} — ${ctx.field} sohasidagi tarixiy shaxssan.`,
    ctx.personaPrompt,
    buildAgeSystemPrompt(ctx.age, ctx.language),
    rules,
    langNote,
    `\n=== MANBA KONTEKST (faqat shu faktlardan foydalan) ===\n${ctx.ragContext}`,
  ].join("\n\n");
}

export function buildFigureUserMessage(question: string): string {
  return question;
}
