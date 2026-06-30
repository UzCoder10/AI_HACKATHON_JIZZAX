import type { ChildLanguage } from "@/types/childUI";

type Strings = Record<string, { uz: string; ru: string }>;

const UI: Strings = {
  appName: { uz: "Smart Edu UZ", ru: "Smart Edu UZ" },
  assistant: { uz: "Yordamchi", ru: "Помощник" },
  home: { uz: "Bosh", ru: "Главная" },
  chat: { uz: "Suhbat", ru: "Чат" },
  figures: { uz: "Buyuk Siymolar", ru: "Великие личности" },
  moodTitle: { uz: "Bugun kayfiyating qanday?", ru: "Как настроение сегодня?" },
  moodDone: { uz: "Bugun kayfiyat saqlandi ✓", ru: "Настроение сохранено ✓" },
  moodSave: { uz: "Saqlash", ru: "Сохранить" },
  dailyTask: { uz: "Kunlik mashg'ulot", ru: "Задание дня" },
  dailyDone: { uz: "Bajarildi!", ru: "Готово!" },
  dailyStart: { uz: "Boshlash", ru: "Начать" },
  stars: { uz: "Yulduzcha", ru: "Звёзды" },
  level: { uz: "Daraja", ru: "Уровень" },
  send: { uz: "Yuborish", ru: "Отправить" },
  placeholder: { uz: "Savolingizni yozing...", ru: "Напиши вопрос..." },
  figurePlaceholder: { uz: "Savol bering...", ru: "Задай вопрос..." },
  greeting: { uz: "Salom! Men yordamchiman.", ru: "Привет! Я помощник." },
  greetingHint: { uz: "Savol berishing mumkin 📚", ru: "Можешь задать вопрос 📚" },
  figureGreeting: { uz: "Men bilan gaplashishing mumkin!", ru: "Можешь поговорить со мной!" },
  loading: { uz: "...", ru: "..." },
  error: { uz: "Xatolik yuz berdi", ru: "Произошла ошибка" },
  pickFigure: { uz: "Shaxsni tanlang", ru: "Выбери личность" },
  pickFigureHint: {
    uz: "Tarixiy shaxslar bilan ta'limiy suhbat",
    ru: "Учебный разговор с историческими личностями",
  },
  welcome: { uz: "Salom", ru: "Привет" },
  goChat: { uz: "Suhbatga o'tish", ru: "Перейти в чат" },
  goFigures: { uz: "Siymolar", ru: "Личности" },
};

export function t(key: keyof typeof UI, lang: ChildLanguage): string {
  return UI[key][lang];
}

export const DAILY_TASKS: Array<{ uz: string; ru: string; emoji: string }> = [
  { uz: "3 ta yangi so'z o'rgan", ru: "Выучи 3 новых слова", emoji: "📝" },
  { uz: "Bir kitobdan 5 daqiqa o'qi", ru: "Читай книгу 5 минут", emoji: "📚" },
  { uz: "Bir savol ber va javob top", ru: "Задай вопрос и найди ответ", emoji: "❓" },
  { uz: "Bugun bir odamga yaxshilik qil", ru: "Сделай добро одному человеку", emoji: "💛" },
  { uz: "10 daqiqa chizish yoki yaratish", ru: "10 минут рисуй или твори", emoji: "🎨" },
  { uz: "Ota-onang bilan 5 daqiqa gaplash", ru: "Поговори с родителями 5 минут", emoji: "👨‍👩‍👧" },
  { uz: "Yangi narsa haqida bilib ol", ru: "Узнай что-то новое", emoji: "🔍" },
];

export function getDailyTask(lang: ChildLanguage): { text: string; emoji: string } {
  const day = new Date().getDay();
  const task = DAILY_TASKS[day % DAILY_TASKS.length];
  return { text: task[lang], emoji: task.emoji };
}

export function figureFieldLabel(field: string): string {
  return field;
}
