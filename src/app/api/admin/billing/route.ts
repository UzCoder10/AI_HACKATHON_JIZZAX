import { NextResponse } from "next/server";
import { getAdminBilling } from "@/lib/admin/adminMetricsService";

export async function GET() {
  try {
    const data = await getAdminBilling();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/billing]", error);
    return NextResponse.json(
      { success: false, error: "To'lov ma'lumotlari yuklanmadi" },
      { status: 500 }
    );
  }
}
