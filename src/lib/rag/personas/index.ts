import type { AppLanguage } from "@/types/safety";
import { buildAgeSystemPrompt } from "@/lib/safety/ageGuard";
import { beruniyPersona } from "./beruniy";
import { ulugbekPersona } from "./ulugbek";
import { ibnSinoPersona } from "./ibn_sino";
import { navoiyPersona } from "./navoiy";
import { xorazmiyPersona } from "./xorazmiy";
import { temurPersona } from "./temur";
import { buxoriyPersona } from "./buxoriy";
import type { AllomaPersona, BuildAllomaPromptParams } from "./types";

export type { AllomaPersona, BuildAllomaPromptParams } from "./types";

const PERSONA_REGISTRY: AllomaPersona[] = [
  beruniyPersona,
  ulugbekPersona,
  ibnSinoPersona,
  navoiyPersona,
  xorazmiyPersona,
  temurPersona,
  buxoriyPersona,
];

const bySlug = new Map(PERSONA_REGISTRY.map((p) => [p.slug, p]));
const byShortId = new Map(PERSONA_REGISTRY.map((p) => [p.shortId, p]));

export function getPersonaBySlug(slug: string): AllomaPersona | null {
  return bySlug.get(slug) ?? null;
}

export function getPersonaByAllomaId(allomaId: string): AllomaPersona | null {
  const key = allomaId.trim().toLowerCase();
  return byShortId.get(key) ?? bySlug.get(key) ?? null;
}

export function listAllomaPersonas(): AllomaPersona[] {
  return [...PERSONA_REGISTRY];
}

const GROUNDED_RULES_UZ = `
ANIQLIK KAFOLATI (buzish taqiqlangan):
1. Faqat senga berilgan MANBA KONTEKSTidagi faktlardan foydalan.
2. Manbada yo'q narsani o'ylab topma, taxmin qilma, to'qima hikoya qilma.
3. Agar savolga manbada javob bo'lmasa, halol ayting: "Bu haqda aniq bilmayman" yoki "Tekshirilgan manbalarimda bu haqda ma'lumot yo'q."
4. Companion emassan — ta'limiy tarixiy shaxs personasidasan.
5. Romantik, terapevtik yoki shaxsiy munosabat o'yin qilma.
6. Sen AI orqali yaratilgan ta'limiy persona ekaningni yashirma.
7. Muhim mavzularda zamonaviy ota-ona/o'qituvchiga murojaat qilishni eslat.
`.trim();

const GROUNDED_RULES_RU = `
ГАРАНТИЯ ТОЧНОСТИ (нарушать запрещено):
1. Используй ТОЛЬКО факты из предоставленного КОНТЕКСТА ИСТОЧНИКОВ.
2. Не выдумывай, не додумывай и не придумывай истории.
3. Если в источниках нет ответа, честно скажи: «Я точно не знаю об этом» или «В проверенных источниках нет такой информации».
4. Ты не друг — ты образовательная историческая персона.
5. Никакой романтики, терапии или личных отношений.
6. Не скрывай, что ты AI-образовательная персона.
7. По важным темам напоминай обратиться к родителям или учителю.
`.trim();

/** Manba yo'q bo'lganda — LLM chaqirilmaydi */
export function getNoSourceReply(figureName: string, language: AppLanguage): string {
  if (language === "uz") {
    return `Men ${figureName}man. Bu savol bo'yicha tekshirilgan manbalarimda aniq ma'lumot topilmadi. Boshqa savol bering yoki o'qituvchingiz bilan ham maslahatlashing.`;
  }
  return `Я ${figureName}. По этому вопросу у меня нет точных проверенных сведений в источниках. Задай другой вопрос или посоветуйся с учителем.`;
}

/** Persona + RAG kontekst + yosh qoidalari — LLM system prompt */
export function buildAllomaSystemPrompt(params: BuildAllomaPromptParams): string {
  const { persona, language, age, ragContext } = params;
  const rules = language === "uz" ? GROUNDED_RULES_UZ : GROUNDED_RULES_RU;
  const langNote =
    language === "uz"
      ? "Javob o'zbek tilida, tabiiy va ta'limiy ohangda bo'lsin."
      : "Ответ на русском языке, естественно и по-учительски.";
  const figureName = language === "uz" ? persona.nameUz : persona.nameRu;

  return [
    `Sen ${figureName} — ${persona.era} davrida ${persona.field} sohasida mashhur tarixiy shaxssan.`,
    persona.systemPersona,
    persona.voiceStyle,
    persona.offTopicGuidance,
    buildAgeSystemPrompt(age, language),
    rules,
    langNote,
    `\n=== MANBA KONTEKST (faqat shu faktlardan foydalan) ===\n${ragContext}`,
  ].join("\n\n");
}
