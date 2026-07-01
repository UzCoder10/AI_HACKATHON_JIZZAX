import { NextResponse } from "next/server";
import { getAdminFigures } from "@/lib/admin/adminMetricsService";

export async function GET() {
  try {
    const data = await getAdminFigures();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/figures]", error);
    return NextResponse.json(
      { success: false, error: "Figuralar yuklanmadi" },
      { status: 500 }
    );
  }
}
