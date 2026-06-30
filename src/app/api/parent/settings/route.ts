import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireParentSession, ensureParentSettings } from "@/lib/auth/guards";

export async function GET() {
  try {
    const { parent } = await requireParentSession();
    const settings = parent.settings ?? (await ensureParentSettings(parent.id));
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { parent } = await requireParentSession();
    const body = await request.json();

    const data: {
      screenTimeMinutes?: number;
      contentLevel?: string;
    } = {};

    if (body.screenTimeMinutes !== undefined) {
      const mins = parseInt(body.screenTimeMinutes, 10);
      if (mins < 15 || mins > 180) {
        return NextResponse.json(
          { success: false, error: "Ekran vaqti 15–180 daqiqa oralig'ida" },
          { status: 400 }
        );
      }
      data.screenTimeMinutes = mins;
    }

    if (body.contentLevel === "standard" || body.contentLevel === "strict") {
      data.contentLevel = body.contentLevel;
    }

    const settings = await prisma.parentSettings.upsert({
      where: { parentId: parent.id },
      update: data,
      create: { parentId: parent.id, ...data },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}
