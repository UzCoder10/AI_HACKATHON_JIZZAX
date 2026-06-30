import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireParentSession } from "@/lib/auth/guards";
import { checkChildLimit } from "@/lib/payments/limits";

export async function GET() {
  try {
    const { parent } = await requireParentSession();
    return NextResponse.json({ success: true, data: parent.children });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { parent } = await requireParentSession();
    const body = await request.json();
    const name = body.name?.trim();
    const age = parseInt(body.age, 10);
    const language = body.language === "ru" ? "ru" : "uz";

    if (!name) {
      return NextResponse.json({ success: false, error: "Ism talab qilinadi" }, { status: 400 });
    }
    if (!age || age < 7 || age > 12) {
      return NextResponse.json({ success: false, error: "Yosh 7–12 oralig'ida bo'lishi kerak" }, { status: 400 });
    }

    const childLimit = await checkChildLimit(parent.id, parent.children.length);
    if (!childLimit.allowed) {
      return NextResponse.json({ success: false, error: childLimit.reason }, { status: 402 });
    }

    const child = await prisma.child.create({
      data: { parentId: parent.id, name, age, language },
    });

    return NextResponse.json({ success: true, data: child });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}
