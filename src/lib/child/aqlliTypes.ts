export type LessonSubject = "english" | "figures" | "games" | "achievements";

export type LessonPausePointPreview = {
  id: string;
  timestampSeconds: number;
  label?: string;
  taskType: "ai_task" | "quiz" | "talk";
};

export type LessonQuizChoice = {
  id: string;
  label: string;
  correct?: boolean;
};

export type LessonQuizQuestion = {
  id: string;
  question: string;
  choices: LessonQuizChoice[];
};

export type ChildLesson = {
  id: string;
  title: string;
  subject: LessonSubject;
  icon: string;
  color: "secondary" | "tertiary" | "primary" | "neutral";
  totalSteps: number;
  completedSteps: number;
  /** Birinchi savol (orqaga moslik) */
  question?: string;
  choices?: LessonQuizChoice[];
  /** Barcha mock savollar */
  questions?: LessonQuizQuestion[];
  mascotLine?: string;
  /** YouTube dars videosi */
  video?: {
    youtubeId: string;
    title: string;
    durationSeconds?: number;
  };
  /** Fonus Kids — keyin AI topshiriq bilan to'xtash nuqtalari */
  pausePoints?: LessonPausePointPreview[];
};

export type ChildBadge = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  locked?: boolean;
};

export type ChildProgressData = {
  name: string;
  avatarUrl: string;
  xp: number;
  level: number;
  streakDays: number;
  xpToNextLevel: number;
  xpCurrentLevel: number;
  avgResponseSeconds: number;
};
