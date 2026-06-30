export type ChildLanguage = "uz" | "ru";

export interface ChildProfile {
  childId: string;
  name: string;
  age: number;
  language: ChildLanguage;
}

export interface ChildProgress {
  stars: number;
  level: number;
  lastMoodDate: string | null;
  lastMoodEmoji: string | null;
  dailyTaskDate: string | null;
  dailyTaskDone: boolean;
}

export const FIGURE_EMOJIS: Record<string, string> = {
  "mirzo-ulugbek": "🔭",
  "abu-rayhon-beruniy": "🌍",
  "ibn-sino": "⚕️",
  "alisher-navoiy": "📜",
  "al-xorazmiy": "🔢",
  "amir-temur": "🏛️",
  "imom-al-buxoriy": "📖",
};

export const MOOD_OPTIONS = ["😊", "🙂", "😐", "😔", "😢"] as const;
