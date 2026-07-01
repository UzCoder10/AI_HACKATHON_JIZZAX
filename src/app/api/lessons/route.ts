import { NextResponse } from "next/server";
import { listLessons } from "@/lib/db/lessonQueries";
import { lessonRecordToChildLesson } from "@/lib/lessons/lessonMappers";

export async function GET() {
  try {
    const lessons = await listLessons();
    const active = lessons
      .filter((l) => l.status === "active")
      .map(lessonRecordToChildLesson);

    return NextResponse.json({ success: true, data: active });
  } catch (error) {
    console.error("[GET /api/lessons]", error);
    return NextResponse.json(
      { success: false, error: "Darslar yuklanmadi" },
      { status: 500 }
    );
  }
}
