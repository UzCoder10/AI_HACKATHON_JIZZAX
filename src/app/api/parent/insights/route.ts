import { NextRequest, NextResponse } from "next/server";
import { requireParentSession, getParentChild } from "@/lib/auth/guards";
import { isPinVerified } from "@/lib/auth/session";
import { generateWeeklyReport } from "@/lib/insights/reportGenerator";
import { getMoodEntries } from "@/lib/db/insightQueries";
import { getRecentInsightAlerts } from "@/lib/db/insightQueries";
import { getParentSubscription, checkReportAccess } from "@/lib/payments/limits";

export async function GET(request: NextRequest) {
  try {
    const { session, parent } = await requireParentSession();

    if (parent.pinHash && !(await isPinVerified(session.parentId))) {
      return NextResponse.json({ success: false, error: "PIN talab qilinadi", code: "PIN_REQUIRED" }, { status: 403 });
    }

    const childId = request.nextUrl.searchParams.get("childId");
    const days = parseInt(request.nextUrl.searchParams.get("days") ?? "7", 10);
    const language = request.nextUrl.searchParams.get("language") === "ru" ? "ru" : "uz";

    if (!childId) {
      return NextResponse.json({ success: false, error: "childId talab qilinadi" }, { status: 400 });
    }

    const child = await getParentChild(parent.id, childId);
    if (!child) {
      return NextResponse.json({ success: false, error: "Bola topilmadi" }, { status: 404 });
    }

    const sub = await getParentSubscription(parent.id);
    const reportAccess = checkReportAccess(sub.planId, sub.active);
    if (!reportAccess.allowed) {
      return NextResponse.json(
        { success: false, error: reportAccess.reason, code: "REPORT_LOCKED" },
        { status: 402 }
      );
    }

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days + 1);
    periodStart.setHours(0, 0, 0, 0);

    const [report, moodEntries, alerts] = await Promise.all([
      generateWeeklyReport({ childId, language, periodDays: days }),
      getMoodEntries(childId, periodStart, periodEnd).catch(() => []),
      getRecentInsightAlerts(childId, days).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        child,
        report,
        moodChart: moodEntries.map((e) => ({
          date: e.entryDate.toISOString().slice(0, 10),
          score: e.score,
          emoji: e.emoji,
        })),
        insightAlerts: alerts.map((a) => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          summary: a.summary,
          createdAt: a.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }
    console.error("[GET /api/parent/insights]", error);
    return NextResponse.json({ success: false, error: "Insight yuklashda xatolik" }, { status: 500 });
  }
}
