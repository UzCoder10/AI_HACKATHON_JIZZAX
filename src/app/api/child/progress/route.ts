import { NextRequest, NextResponse } from "next/server";
import { buildChildProgress } from "@/lib/child/childProgressService";

export async function GET(request: NextRequest) {
  const childId =
    request.nextUrl.searchParams.get("childId")?.trim() ||
    process.env.NEXT_PUBLIC_DEMO_CHILD_ID?.trim();

  if (!childId) {
    return NextResponse.json(
      { success: false, error: "childId talab qilinadi" },
      { status: 400 }
    );
  }

  try {
    const progress = await buildChildProgress(childId);
    if (!progress) {
      return NextResponse.json(
        { success: false, error: "Bola topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error("[GET /api/child/progress]", error);
    return NextResponse.json(
      { success: false, error: "Progress yuklanmadi" },
      { status: 500 }
    );
  }
}
