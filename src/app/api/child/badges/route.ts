import { NextRequest, NextResponse } from "next/server";
import { buildChildBadges } from "@/lib/child/childProgressService";

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
    const badges = await buildChildBadges(childId);
    return NextResponse.json({ success: true, data: badges });
  } catch (error) {
    console.error("[GET /api/child/badges]", error);
    return NextResponse.json(
      { success: false, error: "Yutuqlar yuklanmadi" },
      { status: 500 }
    );
  }
}
