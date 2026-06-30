import type { AppLanguage } from "@/types/safety";

type FallbackKey =
  | "input_blocked"
  | "output_blocked"
  | "crisis"
  | "crisis_simple"
  | "crisis_moderate"
  | "crisis_advanced";

const MESSAGES: Record<FallbackKey, Record<AppLanguage, string>> = {
  input_blocked: {
    uz: "Bu savol hozircha mos emas. Boshqa narsa haqida so'rab ko'ramizmi?",
    ru: "Этот вопрос сейчас не подходит. Может, спросим о чём-то другом?",
  },
  output_blocked: {
    uz: "Kechirasiz, bu savolga hozir javob bera olmayman. Boshqa savol bering!",
    ru: "Извини, я не могу ответить на это сейчас. Задай другой вопрос!",
  },
  crisis: {
    uz: "Sen juda muhim narsa haqida gapiryapsan. Iltimos, bu haqda ishonchli kattang — ota-onang, o'qituvching yoki yaqining bilan gaplash. Agar xavf bo'lsa, 112 raqamiga qo'ng'iroq qil. Men tashxis qo'ymayman, lekin senga yordam kerak.",
    ru: "Ты говоришь об очень важном. Пожалуйста, расскажи об этом взрослому, которому доверяешь — родителям, учителю или близкому. Если есть опасность, позвони 112. Я не ставлю диагноз, но тебе нужна помощь.",
  },
  crisis_simple: {
    uz: "Bu juda muhim. Iltimos, hozir ota-onang yoki ishonchli kattang bilan gaplash. Sen yolg'iz emassan. Agar yordam kerak bo'lsa — 112.",
    ru: "Это очень важно. Пожалуйста, сейчас поговори с родителями или взрослым, которому доверяешь. Ты не один. Если нужна помощь — 112.",
  },
  crisis_moderate: {
    uz: "Sen muhim narsa haqida gapiryapsan. Bu haqda ishonchli kattang bilan gaplashish juda muhim — ota-onang yoki o'qituvching. Men shifokor emasman va tashxis qo'ymayman. Agar xavf bo'lsa, 112 ga qo'ng'iroq qil.",
    ru: "Ты говоришь о чём-то важном. Очень важно поговорить об этом со взрослым — родителями или учителем. Я не врач и не ставлю диагноз. Если есть опасность, позвони 112.",
  },
  crisis_advanced: {
    uz: "Bu haqda gapirganing uchun rahmat — bu juda muhim. Iltimos, ishonchli kattang (ota-ona, o'qituvchi yoki yaqining) bilan bu haqda gaplash. Men AI yordamchiman, tashxis qo'ya olmayman. Agar o'zingni xavfda his qilsang yoki yordam kerak bo'lsa — 112 yoki yaqining kattaga murojaat qil.",
    ru: "Спасибо, что рассказал — это очень важно. Пожалуйста, поговори об этом со взрослым (родители, учитель или близкий). Я AI-помощник и не могу ставить диагноз. Если чувствуешь опасность — 112 или обратись к взрослому.",
  },
};

export function getFallbackMessage(key: FallbackKey, language: AppLanguage): string {
  return MESSAGES[key][language];
}

export function getCrisisMessageByAge(
  age: number,
  language: AppLanguage
): string {
  if (age <= 8) return getFallbackMessage("crisis_simple", language);
  if (age <= 10) return getFallbackMessage("crisis_moderate", language);
  return getFallbackMessage("crisis_advanced", language);
}
