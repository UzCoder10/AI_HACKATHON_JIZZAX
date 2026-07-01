import { NextResponse } from "next/server";
import { getAdminUsers } from "@/lib/admin/adminMetricsService";

export async function GET() {
  try {
    const data = await getAdminUsers();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json(
      { success: false, error: "Foydalanuvchilar yuklanmadi" },
      { status: 500 }
    );
  }
}
