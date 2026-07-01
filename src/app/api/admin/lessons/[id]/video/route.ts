import { NextRequest, NextResponse } from "next/server";
import { getLesson, updateLessonVideo } from "@/lib/db/lessonQueries";
import type { ContentItem } from "@/lib/admin/types";
import type { LessonRecord, UpdateLessonVideoInput } from "@/types/lesson";

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateLessonVideoInput;

    const updated = await updateLessonVideo(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Dars topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json<{ success: boolean; data: ContentItem }>({
      success: true,
      data: toContentItem(updated),
    });
  } catch (error) {
    console.error("[PATCH /api/admin/lessons/[id]/video]", error);
    const message =
      error instanceof Error ? error.message : "Video saqlashda xatolik";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updated = await updateLessonVideo(id, { youtubeUrl: "" });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Dars topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json<{ success: boolean; data: ContentItem }>({
      success: true,
      data: toContentItem(updated),
    });
  } catch (error) {
    console.error("[DELETE /api/admin/lessons/[id]/video]", error);
    return NextResponse.json(
      { success: false, error: "Video o'chirishda xatolik" },
      { status: 500 }
    );
  }
}
