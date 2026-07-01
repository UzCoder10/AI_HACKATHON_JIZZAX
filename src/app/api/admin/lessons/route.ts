import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { listLessons } from "@/lib/db/lessonQueries";
import { FIGURE_CATALOG } from "@/lib/rag/figuresCatalog";
import type { ContentItem } from "@/lib/admin/types";
import type { LessonRecord } from "@/types/lesson";

function toContentItem(lesson: LessonRecord): ContentItem {
  return {
    id: lesson.id,
    title: lesson.title,
    type: "lesson",
    subject: lesson.subject,
    status: lesson.status,
    updatedAt: lesson.updatedAt ?? "",
    author: lesson.author ?? "",
    youtubeId: lesson.video?.youtubeId,
    videoTitle: lesson.video?.videoTitle,
    videoUrl: lesson.video?.videoUrl,
    videoDurationSeconds: lesson.video?.durationSeconds,
    pausePointCount: lesson.pausePoints?.length ?? 0,
  };
}

async function listFigureContentItems(): Promise<ContentItem[]> {
  try {
    const figures = await prisma.greatFigure.findMany({ orderBy: { slug: "asc" } });
    if (figures.length > 0) {
      return figures.map((f) => ({
        id: f.id,
        title: f.nameUz,
        type: "figure" as const,
        subject: f.field,
        status: f.isActive ? ("active" as const) : ("draft" as const),
        updatedAt: f.updatedAt.toISOString().slice(0, 10),
        author: "Tizim",
      }));
    }
  } catch (error) {
    console.error("[listFigureContentItems]", error);
  }

  return FIGURE_CATALOG.map((f) => ({
    id: f.slug,
    title: f.nameUz,
    type: "figure" as const,
    subject: f.field,
    status: "active" as const,
    updatedAt: new Date().toISOString().slice(0, 10),
    author: "Tizim",
  }));
}

export async function GET() {
  try {
    const lessons = await listLessons();
    const lessonItems = lessons.map(toContentItem);
    const figures = await listFigureContentItems();
    return NextResponse.json<{ success: boolean; data: ContentItem[] }>({
      success: true,
      data: [...lessonItems, ...figures],
    });
  } catch (error) {
    console.error("[GET /api/admin/lessons]", error);
    return NextResponse.json(
      { success: false, error: "Kontent yuklashda xatolik" },
      { status: 500 }
    );
  }
}
