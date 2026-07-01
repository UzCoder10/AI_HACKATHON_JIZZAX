import { useChildMock } from "@/lib/config/dataMode";
import { getLessonQuiz } from "@/lib/lessons/lessonQuizzes";

export const USE_CHILD_MOCK = useChildMock();

export const mockChildProgress = {
  name: "Jasur",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDTEJ8vXKmCtGFu8KZMI7pHEv7mZ07UXMsHoPW3dIBe4GTy_QuIuZ_d8NRkke3FuQ5Lv7foKYemwIT7QoKalpmhhdIt9V0plsQaYyYYW5ZGvhQHTyKTtXXK8Co-631jvZlYjKSHwKlzRLyssLdkgW9ZYf9-L_Ojb3CoYyYBXpXSQzfae7ZHSfW7Xn7R7rSI69_CX8Iw1Hb-1FSSW4spe-njLpSEJhMIpz0bIIuOAMpCj2vCy8iTt8r_PxSwGEkCu3cZfMdvtJV9osw",
  xp: 1250,
  level: 5,
  streakDays: 5,
  xpCurrentLevel: 450,
  xpToNextLevel: 600,
  avgResponseSeconds: 12,
};

export const mockLessons = [
  {
    id: "english-1",
    title: "Ingliz tili",
    subject: "english" as const,
    icon: "language",
    color: "secondary" as const,
    totalSteps: 5,
    completedSteps: 3,
  },
  {
    id: "figures-1",
    title: "Buyuk Siymolar",
    subject: "figures" as const,
    icon: "auto_stories",
    color: "tertiary" as const,
    totalSteps: 5,
    completedSteps: 2,
  },
  {
    id: "games-1",
    title: "O'yinlar",
    subject: "games" as const,
    icon: "videogame_asset",
    color: "primary" as const,
    totalSteps: 4,
    completedSteps: 1,
  },
  {
    id: "l-001",
    title: "Ingliz tili: Salomlashish",
    subject: "english" as const,
    icon: "play_circle",
    color: "secondary" as const,
    totalSteps: 5,
    completedSteps: 0,
  },
  {
    id: "l-002",
    title: "Ingliz tili: Hayvonlar",
    subject: "english" as const,
    icon: "play_circle",
    color: "secondary" as const,
    totalSteps: 5,
    completedSteps: 0,
  },
  {
    id: "l-003",
    title: "Ingliz tili: Ranglar",
    subject: "english" as const,
    icon: "play_circle",
    color: "secondary" as const,
    totalSteps: 5,
    completedSteps: 0,
  },
  {
    id: "l-004",
    title: "Quyosh tizimi",
    subject: "figures" as const,
    icon: "play_circle",
    color: "primary" as const,
    totalSteps: 5,
    completedSteps: 1,
  },
];

const MOCK_LESSON_VIDEOS: Record<
  string,
  { youtubeId: string; title: string; durationSeconds: number }
> = {
  "l-001": {
    youtubeId: "fN1Cyr0ZK9M",
    title: "Hello Hello! Can You Clap Your Hands? | Super Simple Songs",
    durationSeconds: 152,
  },
  "l-002": {
    youtubeId: "DgJ2gDxjsmQ",
    title: "Wild Animals Vocabulary for Kids",
    durationSeconds: 480,
  },
  "l-003": {
    youtubeId: "jYAWf8Y91hA",
    title: "I See Something Blue | Colors Song for Children | Super Simple Songs",
    durationSeconds: 183,
  },
  "l-004": {
    youtubeId: "libKVRa01L8",
    title: "Solar System 101 | National Geographic",
    durationSeconds: 251,
  },
};

function buildMockLessonDetail(id: string) {
  const questions = getLessonQuiz(id);
  const first = questions[0];
  const video = MOCK_LESSON_VIDEOS[id];
  const fromList = mockLessons.find((l) => l.id === id);

  return {
    id,
    title: fromList?.title ?? "Dars",
    subject: fromList?.subject ?? ("english" as const),
    icon: fromList?.icon ?? "menu_book",
    color: fromList?.color ?? ("secondary" as const),
    totalSteps: questions.length || 5,
    completedSteps: fromList?.completedSteps ?? 0,
    video: video
      ? {
          youtubeId: video.youtubeId,
          title: video.title,
          durationSeconds: video.durationSeconds,
        }
      : undefined,
    pausePoints:
      id === "l-004"
        ? [
            { id: "pp-l004-1", timestampSeconds: 45, label: "Sayyoralar sanog'i", taskType: "ai_task" as const },
            { id: "pp-l004-2", timestampSeconds: 120, label: "Merkuriy haqida savol", taskType: "ai_task" as const },
          ]
        : undefined,
    mascotLine: video
      ? "Avval videoni tomosha qiling, keyin savollarga javob bering!"
      : "Savollarga javob ber va bilimingni sinab ko'r!",
    questions: questions.length > 0 ? questions : undefined,
    question: first?.question,
    choices: first?.choices,
  };
}

export const mockLessonDetails: Record<string, ReturnType<typeof buildMockLessonDetail>> = {
  "l-001": buildMockLessonDetail("l-001"),
  "l-002": buildMockLessonDetail("l-002"),
  "l-003": buildMockLessonDetail("l-003"),
  "l-004": buildMockLessonDetail("l-004"),
};

/** @deprecated mockLessonDetails ishlating */
export const mockLessonDetail = mockLessonDetails["l-004"];

export const mockBadges = [
  { id: "b1", title: "Beruniy shogirdi", subtitle: "10 ta dars", icon: "auto_stories", color: "#705d00" },
  { id: "b2", title: "5 kunlik Streak", subtitle: "To'xtovsiz!", icon: "local_fire_department", color: "#fd761a" },
  { id: "b3", title: "Oltin quloq", subtitle: "Yaxshi tinglovchi", icon: "hearing", color: "#005db8" },
  { id: "b4", title: "Matematik", subtitle: "Yaqinda...", icon: "lock", color: "#7e7761", locked: true },
];

export const mockTalkPersona = {
  name: "Abu Rayhon Beruniy",
  tagline: "Sizni tinglayapman, do'stim...",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBWfuPeetN2mqBjZxHBxe3Q02Zrq4lY53bNzsYdVIo9kY2KuSzkP7SWZUCEDFTDjHP1cuJk0vsdg_vbio9qURriGecyJrRl9zfFd7hrjJTXxGrnfywVlkw8dRfm9kFdxZ33QQCCKLkw42s_GkiiJX84aKTRLthWAGwkz-VSxnvLhnYNZFa91k_QiPQ2u5FQgg0jhoFaa7fjQSrpQo7vb36iXvqQ2lLwDQmAuqJFFmCCQxDsKrHzbZ_Nuwheg2t-76DVKBm_CIkQLvQ",
  sampleTranscript: "...va o'sha paytda yulduzlar qanday qilib o'z joyini o'zgartiradi?",
};
