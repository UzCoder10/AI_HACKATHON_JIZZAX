import { NextResponse } from "next/server";
import { getAdminAiMonitoring } from "@/lib/admin/adminMetricsService";

export async function GET() {
  try {
    const data = await getAdminAiMonitoring();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/ai]", error);
    return NextResponse.json(
      { success: false, error: "AI monitoring yuklanmadi" },
      { status: 500 }
    );
  }
}
