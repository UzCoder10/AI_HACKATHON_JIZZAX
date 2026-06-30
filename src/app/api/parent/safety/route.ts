import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireParentSession, getParentChild } from "@/lib/auth/guards";
import { isPinVerified } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const { session, parent } = await requireParentSession();

    if (parent.pinHash && !(await isPinVerified(session.parentId))) {
      return NextResponse.json({ success: false, error: "PIN talab qilinadi", code: "PIN_REQUIRED" }, { status: 403 });
    }

    const childId = request.nextUrl.searchParams.get("childId");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

    if (childId) {
      const child = await getParentChild(parent.id, childId);
      if (!child) {
        return NextResponse.json({ success: false, error: "Bola topilmadi" }, { status: 404 });
      }
    }

    const childIds = childId
      ? [childId]
      : parent.children.map((c) => c.id);

    const events = await prisma.safetyEvent.findMany({
      where: { childId: { in: childIds } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: events.map((e) => ({
        id: e.id,
        childId: e.childId,
        source: e.source,
        severity: e.severity,
        category: e.category,
        summary: e.summary,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}
