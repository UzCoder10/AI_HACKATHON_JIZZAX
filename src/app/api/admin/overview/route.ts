import { NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/admin/adminMetricsService";

export async function GET() {
  try {
    const data = await getAdminOverview();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/overview]", error);
    return NextResponse.json(
      { success: false, error: "Admin ko'rinish yuklanmadi" },
      { status: 500 }
    );
  }
}
