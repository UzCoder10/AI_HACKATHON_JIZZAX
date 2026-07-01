import type { LessonPausePoint, LessonRecord } from "@/types/lesson";
import { buildYoutubeWatchUrl } from "@/lib/youtube";

/** Boshlang'ich darslar — DB bo'lmasa fallback */
export const LESSON_SEED: LessonRecord[] = [
  {
    id: "l-001",
    slug: "l-001",
    title: "Ingliz tili: Salomlashish",
    subject: "Ingliz tili",
    status: "active",
    author: "Jasur Rahimov",
    updatedAt: "2026-07-01",
    video: {
      youtubeId: "fN1Cyr0ZK9M",
      videoTitle: "Hello Hello! Can You Clap Your Hands? | Super Simple Songs",
      videoUrl: buildYoutubeWatchUrl("fN1Cyr0ZK9M"),
      durationSeconds: 152,
    },
  },
  {
    id: "l-002",
    slug: "l-002",
    title: "Ingliz tili: Hayvonlar",
    subject: "Ingliz tili",
    status: "active",
    author: "Jasur Rahimov",
    updatedAt: "2026-07-01",
    video: {
      youtubeId: "DgJ2gDxjsmQ",
      videoTitle: "Wild Animals Vocabulary for Kids",
      videoUrl: buildYoutubeWatchUrl("DgJ2gDxjsmQ"),
      durationSeconds: 480,
    },
  },
  {
    id: "l-003",
    slug: "l-003",
    title: "Ingliz tili: Ranglar",
    subject: "Ingliz tili",
    status: "active",
    author: "Jasur Rahimov",
    updatedAt: "2026-07-01",
    video: {
      youtubeId: "jYAWf8Y91hA",
      videoTitle: "I See Something Blue | Colors Song for Children | Super Simple Songs",
      videoUrl: buildYoutubeWatchUrl("jYAWf8Y91hA"),
      durationSeconds: 183,
    },
  },
  {
    id: "l-004",
    slug: "l-004",
    title: "Quyosh tizimi",
    subject: "Astronomiya",
    description: "Sayyoralar va Quyosh haqida qisqa dars videosi.",
    status: "active",
    author: "Jasur Rahimov",
    updatedAt: "2026-07-01",
    video: {
      youtubeId: "libKVRa01L8",
      videoTitle: "Solar System 101 | National Geographic",
      videoUrl: buildYoutubeWatchUrl("libKVRa01L8"),
      durationSeconds: 251,
    },
    pausePoints: [
      {
        id: "pp-l004-1",
        timestampSeconds: 45,
        label: "Sayyoralar sanog'i",
        taskType: "ai_task",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: "pp-l004-2",
        timestampSeconds: 120,
        label: "Merkuriy haqida savol",
        taskType: "ai_task",
        sortOrder: 2,
        isActive: true,
      },
    ],
  },
];

let catalog: LessonRecord[] = LESSON_SEED.map((l) => ({
  ...l,
  pausePoints: l.pausePoints?.map((p) => ({ ...p })),
  video: l.video ? { ...l.video } : undefined,
}));

export function getLessonCatalog(): LessonRecord[] {
  return catalog;
}

export function findLessonInCatalog(idOrSlug: string): LessonRecord | null {
  const key = idOrSlug.trim();
  return (
    catalog.find((l) => l.id === key || l.slug === key) ??
    null
  );
}

export function updateLessonInCatalog(
  idOrSlug: string,
  patch: Partial<Pick<LessonRecord, "video" | "title" | "status">> & {
    video?: LessonRecord["video"] | null;
  }
): LessonRecord | null {
  const idx = catalog.findIndex((l) => l.id === idOrSlug || l.slug === idOrSlug);
  if (idx < 0) return null;

  const current = catalog[idx];
  const next: LessonRecord = {
    ...current,
    ...patch,
    video: patch.video === null ? undefined : patch.video ?? current.video,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  catalog[idx] = next;
  return next;
}

export function resetLessonCatalog(): void {
  catalog = LESSON_SEED.map((l) => ({
    ...l,
    pausePoints: l.pausePoints?.map((p) => ({ ...p })),
    video: l.video ? { ...l.video } : undefined,
  }));
}

export type { LessonPausePoint, LessonRecord };
