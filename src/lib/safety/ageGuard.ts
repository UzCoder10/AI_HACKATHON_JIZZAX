import type { AgeGuardConfig, AgeRegister, AppLanguage } from "@/types/safety";

const REGISTER_CONFIG: Record<AgeRegister, Omit<AgeGuardConfig, "register">> = {
  simple: {
    maxSentenceWords: 12,
    vocabularyLevel: "juda sodda, qisqa gaplar",
    systemHint:
      "7–8 yosh: juda sodda so'zlar, qisqa gaplar (1-2 gap), murakkab atamalardan qoch.",
  },
  moderate: {
    maxSentenceWords: 18,
    vocabularyLevel: "o'rtacha sodda",
    systemHint:
      "9–10 yosh: sodda tushuntirish, 2-3 qisqa gap, misollar bilan.",
  },
  advanced: {
    maxSentenceWords: 25,
    vocabularyLevel: "biroz boyroq, lekin bolaga mos",
    systemHint:
      "11–12 yosh: biroz murakkabroq tushuntirish, 3-4 gap, mantiqiy izoh.",
  },
};

export function getAgeRegister(age: number): AgeRegister {
  if (age <= 8) return "simple";
  if (age <= 10) return "moderate";
  return "advanced";
}

export function getAgeGuardConfig(age: number): AgeGuardConfig {
  const register = getAgeRegister(age);
  return { register, ...REGISTER_CONFIG[register] };
}

export function buildAgeSystemPrompt(age: number, language: AppLanguage): string {
  const config = getAgeGuardConfig(age);
  const langNote =
    language === "uz"
      ? "Javob o'zbek tilida bo'lsin."
      : "Ответ должен быть на русском языке.";

  return [
    `Bola yoshi: ${age}. Registr: ${config.register}.`,
    config.systemHint,
    `Har bir javob maksimum ${config.maxSentenceWords} so'zdan oshmasin.`,
    langNote,
  ].join(" ");
}

/** Chiqish uzunligini yoshga mos qisqartirish (qoidaviy) */
export function trimToAgeRegister(text: string, age: number): string {
  const { maxSentenceWords } = getAgeGuardConfig(age);
  const words = text.trim().split(/\s+/);
  if (words.length <= maxSentenceWords * 4) return text.trim();

  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let result = "";
  let wordCount = 0;

  for (const sentence of sentences) {
    const sWords = sentence.trim().split(/\s+/).length;
    if (wordCount + sWords > maxSentenceWords * 3) break;
    result += sentence;
    wordCount += sWords;
  }

  return result.trim() || text.trim().split(/\s+/).slice(0, maxSentenceWords * 2).join(" ");
}
