import { prisma } from "@/lib/db/client";
import type { LessonPausePoint, LessonRecord, UpdateLessonVideoInput } from "@/types/lesson";
import {
  findLessonInCatalog,
  getLessonCatalog,
  updateLessonInCatalog,
} from "@/lib/lessons/lessonCatalog";
import { buildYoutubeWatchUrl, parseYoutubeId, fetchYoutubeVideoMetadata } from "@/lib/youtube";

type DbLesson = Awaited<ReturnType<typeof fetchLessonFromDb>>;

function mapPausePoint(p: {
  id: string;
  timestampSeconds: number;
  label: string | null;
  taskType: string;
  taskPayload: unknown;
  sortOrder: number;
  isActive: boolean;
}): LessonPausePoint {
  return {
    id: p.id,
    timestampSeconds: p.timestampSeconds,
    label: p.label ?? undefined,
    taskType: p.taskType as LessonPausePoint["taskType"],
    taskPayload:
      p.taskPayload && typeof p.taskPayload === "object"
        ? (p.taskPayload as Record<string, unknown>)
        : undefined,
    sortOrder: p.sortOrder,
    isActive: p.isActive,
  };
}

function mapDbLesson(row: NonNullable<DbLesson>): LessonRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subject: row.subject,
    description: row.description ?? undefined,
    status: row.status === "ACTIVE" ? "active" : "draft",
    author: row.author ?? undefined,
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
    video: row.youtubeId
      ? {
          youtubeId: row.youtubeId,
          videoTitle: row.videoTitle ?? row.title,
          videoUrl: row.videoUrl ?? buildYoutubeWatchUrl(row.youtubeId),
          durationSeconds: row.videoDurationSeconds ?? undefined,
        }
      : undefined,
    pausePoints: row.pausePoints.map(mapPausePoint),
  };
}

async function fetchLessonFromDb(idOrSlug: string) {
  return prisma.lessonTopic.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      pausePoints: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function listLessons(): Promise<LessonRecord[]> {
  try {
    const rows = await prisma.lessonTopic.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        pausePoints: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    });
    if (rows.length > 0) return rows.map(mapDbLesson);
  } catch (error) {
    console.error("[listLessons] DB fallback:", error);
  }
  return getLessonCatalog();
}

export async function getLesson(idOrSlug: string): Promise<LessonRecord | null> {
  try {
    const row = await fetchLessonFromDb(idOrSlug);
    if (row) return mapDbLesson(row);
  } catch (error) {
    console.error("[getLesson] DB fallback:", error);
  }
  return findLessonInCatalog(idOrSlug);
}

export async function updateLessonVideo(
  idOrSlug: string,
  input: UpdateLessonVideoInput
): Promise<LessonRecord | null> {
  const rawId = input.youtubeId?.trim() || input.youtubeUrl?.trim() || "";
  const youtubeId = rawId ? parseYoutubeId(rawId) : null;

  if (rawId && !youtubeId) {
    throw new Error("Noto'g'ri YouTube link yoki ID");
  }

  let videoTitle = input.videoTitle?.trim();
  let duration = input.videoDurationSeconds;

  if (youtubeId && (!videoTitle || !duration)) {
    const meta = await fetchYoutubeVideoMetadata(youtubeId);
    if (meta) {
      if (!videoTitle) videoTitle = meta.title;
      if (!duration) duration = meta.durationSeconds;
    }
  }

  try {
    const existing = await fetchLessonFromDb(idOrSlug);
    if (existing) {
      const updated = await prisma.lessonTopic.update({
        where: { id: existing.id },
        data: {
          youtubeId: youtubeId ?? null,
          videoTitle: videoTitle ?? (youtubeId ? existing.title : null),
          videoUrl: youtubeId ? buildYoutubeWatchUrl(youtubeId) : null,
          videoDurationSeconds: duration ?? null,
        },
        include: {
          pausePoints: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        },
      });
      return mapDbLesson(updated);
    }
  } catch (error) {
    console.error("[updateLessonVideo] DB fallback:", error);
  }

  const catalogLesson = findLessonInCatalog(idOrSlug);
  if (!catalogLesson) return null;

  return updateLessonInCatalog(idOrSlug, {
    video: youtubeId
      ? {
          youtubeId,
          videoTitle: videoTitle ?? catalogLesson.title,
          videoUrl: buildYoutubeWatchUrl(youtubeId),
          durationSeconds: duration,
        }
      : null,
  });
}
