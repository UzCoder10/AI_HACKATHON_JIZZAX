import { NextResponse } from "next/server";
import { getAdminChildren } from "@/lib/admin/adminMetricsService";

export async function GET() {
  try {
    const data = await getAdminChildren();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/children]", error);
    return NextResponse.json(
      { success: false, error: "Bolalar ro'yxati yuklanmadi" },
      { status: 500 }
    );
  }
}
