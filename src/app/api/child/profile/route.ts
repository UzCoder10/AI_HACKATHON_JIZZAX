import { NextRequest, NextResponse } from "next/server";
import { getChildProfileRecord } from "@/lib/child/childProgressService";

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
    const child = await getChildProfileRecord(childId);
    if (!child) {
      return NextResponse.json(
        { success: false, error: "Bola topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        childId: child.id,
        name: child.name,
        age: child.age,
        language: child.language as "uz" | "ru",
      },
    });
  } catch (error) {
    console.error("[GET /api/child/profile]", error);
    return NextResponse.json(
      { success: false, error: "Profil yuklanmadi" },
      { status: 500 }
    );
  }
}
