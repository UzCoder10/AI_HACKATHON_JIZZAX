import { NextRequest, NextResponse } from "next/server";
import { getLesson } from "@/lib/db/lessonQueries";
import type { ApiLessonResponse } from "@/types/lesson";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const lesson = await getLesson(id);

    if (!lesson) {
      return NextResponse.json<ApiLessonResponse>(
        { success: false, error: "Dars topilmadi" },
        { status: 404 }
      );
    }

    if (lesson.status !== "active") {
      return NextResponse.json<ApiLessonResponse>(
        { success: false, error: "Dars hozircha mavjud emas" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiLessonResponse>({ success: true, data: lesson });
  } catch (error) {
    console.error("[GET /api/lessons/[id]]", error);
    return NextResponse.json<ApiLessonResponse>(
      { success: false, error: "Darsni yuklashda xatolik" },
      { status: 500 }
    );
  }
}
