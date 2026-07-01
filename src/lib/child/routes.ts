/** Bola interfeysi marshrutlari — tashqi havola/parent yo'qligi uchun yagona manba */
export const CHILD_ROUTES = {
  home: "/child",
  talk: "/child/talk",
  talkWithFigure: (slug: string) => `/child/talk?figure=${encodeURIComponent(slug)}`,
  lesson: (id: string) => `/child/lesson/${id}`,
  achievements: "/child/achievements",
  timeLimit: "/child/time-limit",
} as const;

export type ChildNavTab = "lessons" | "talk" | "achievements" | "profile";
