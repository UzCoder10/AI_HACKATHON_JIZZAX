import { USE_CHILD_MOCK } from "@/lib/child/mockData";
import type { ChildBadge, ChildLesson, ChildProgressData } from "@/lib/child/aqlliTypes";
import { lessonRecordToChildLesson } from "@/lib/lessons/lessonMappers";
import { findLessonInCatalog } from "@/lib/lessons/lessonCatalog";
import { fetchJson, ApiError } from "@/lib/api/fetchJson";
import type { LessonRecord } from "@/types/lesson";
import { getFigureFromCatalog } from "@/lib/rag/figuresCatalog";
import { getFigureAvatar } from "@/lib/design/avatars";

export type { ChildBadge, ChildLesson, ChildProgressData } from "@/lib/child/aqlliTypes";

export type ChildProfileApi = {
  childId: string;
  name: string;
  age: number;
  language: "uz" | "ru";
};

function qs(childId: string): string {
  return `childId=${encodeURIComponent(childId)}`;
}

export async function fetchChildProfile(childId: string): Promise<ChildProfileApi | null> {
  try {
    return await fetchJson<ChildProfileApi>(`/api/child/profile?${qs(childId)}`);
  } catch {
    return null;
  }
}

export async function getChildProgress(childId?: string): Promise<ChildProgressData | null> {
  if (USE_CHILD_MOCK) {
    const { mockChildProgress } = await import("@/lib/child/mockData");
    return mockChildProgress;
  }
  if (!childId) return null;
  try {
    return await fetchJson<ChildProgressData>(`/api/child/progress?${qs(childId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getLessons(): Promise<ChildLesson[]> {
  if (USE_CHILD_MOCK) {
    const { mockLessons } = await import("@/lib/child/mockData");
    return mockLessons;
  }
  try {
    return await fetchJson<ChildLesson[]>("/api/lessons");
  } catch {
    return [];
  }
}

export async function getLessonById(id: string): Promise<ChildLesson | null> {
  try {
    const record = await fetchJson<LessonRecord>(`/api/lessons/${encodeURIComponent(id)}`);
    return lessonRecordToChildLesson(record);
  } catch {
    const catalog = findLessonInCatalog(id);
    if (catalog?.status === "active") {
      return lessonRecordToChildLesson(catalog);
    }
    if (USE_CHILD_MOCK) {
      const { mockLessons, mockLessonDetails } = await import("@/lib/child/mockData");
      const detail = mockLessonDetails[id];
      if (detail) return detail;
      const fromList = mockLessons.find((l) => l.id === id);
      if (fromList) return { ...mockLessonDetails["l-004"], ...fromList, id };
      return null;
    }
    return null;
  }
}

export async function getBadges(childId?: string): Promise<ChildBadge[]> {
  if (USE_CHILD_MOCK) {
    const { mockBadges } = await import("@/lib/child/mockData");
    return mockBadges;
  }
  if (!childId) return [];
  try {
    return await fetchJson<ChildBadge[]>(`/api/child/badges?${qs(childId)}`);
  } catch {
    return [];
  }
}

export async function getTalkPersona(slug?: string | null) {
  if (slug) {
    const figure = getFigureFromCatalog(slug);
    if (figure) {
      return {
        slug: figure.slug,
        name: figure.nameUz,
        tagline: figure.field,
        avatarUrl: getFigureAvatar(figure.slug) ?? "",
        sampleTranscript: `${figure.nameUz} bilan suhbat boshlang — savolingizni ayting!`,
      };
    }
  }

  if (USE_CHILD_MOCK) {
    const { mockTalkPersona } = await import("@/lib/child/mockData");
    return { slug: "abu-rayhon-beruniy", ...mockTalkPersona };
  }

  return null;
}

/** Figure slug → alloma_id (API uchun) */
export function figureSlugToAllomaId(slug: string): string {
  const map: Record<string, string> = {
    "abu-rayhon-beruniy": "beruniy",
    "mirzo-ulugbek": "ulugbek",
    "ibn-sino": "ibn_sino",
    "alisher-navoiy": "navoiy",
    "al-xorazmiy": "xorazmiy",
    "amir-temur": "temur",
    "imom-al-buxoriy": "buxoriy",
  };
  return map[slug] ?? slug;
}

const SESSION_KEY = "nihol_alloma_session";

export function getAllomaSessionId(allomaId: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[allomaId];
  } catch {
    return undefined;
  }
}

export function saveAllomaSessionId(allomaId: string, sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[allomaId] = sessionId;
    localStorage.setItem(SESSION_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export interface AllomaVoiceResult {
  questionText: string;
  reply: string;
  sessionId: string;
  audioBase64: string;
  audioMimeType: string;
}

export async function postAllomaVoiceChat(params: {
  allomaId: string;
  audio: Blob;
  childId: string;
  age: number;
  name: string;
  language: "uz" | "ru";
  sessionId?: string;
  filename?: string;
}): Promise<AllomaVoiceResult> {
  const form = new FormData();
  form.append("audio", params.audio, params.filename ?? "recording.webm");
  form.append("alloma_id", params.allomaId);
  form.append("child_id", params.childId);
  form.append("age", String(params.age));
  form.append("name", params.name);
  form.append("language", params.language);
  if (params.sessionId) form.append("session_id", params.sessionId);

  const res = await fetch("/api/chat/alloma/voice", { method: "POST", body: form });
  const json = (await res.json()) as {
    success: boolean;
    error?: string;
    data?: AllomaVoiceResult & { reply: string; sessionId: string };
  };

  if (!res.ok || !json.success || !json.data) {
    throw new ApiError(json.error ?? "Ovozli suhbat xatolik", res.status);
  }

  saveAllomaSessionId(params.allomaId, json.data.sessionId);

  return {
    questionText: json.data.questionText,
    reply: json.data.reply,
    sessionId: json.data.sessionId,
    audioBase64: json.data.audioBase64,
    audioMimeType: json.data.audioMimeType,
  };
}
