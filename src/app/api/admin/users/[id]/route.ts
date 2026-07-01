import { NextRequest, NextResponse } from "next/server";
import { getAdminUserDetail } from "@/lib/admin/adminMetricsService";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await getAdminUserDetail(id);
    if (!data) {
      return NextResponse.json({ success: false, error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/users/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Foydalanuvchi ma'lumoti yuklanmadi" },
      { status: 500 }
    );
  }
}
