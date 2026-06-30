import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireParentSession, getParentChild } from "@/lib/auth/guards";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { parent } = await requireParentSession();
    const { id } = await context.params;
    const body = await request.json();

    const existing = await getParentChild(parent.id, id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Bola topilmadi" }, { status: 404 });
    }

    const data: { name?: string; age?: number; language?: string } = {};
    if (body.name?.trim()) data.name = body.name.trim();
    if (body.age) {
      const age = parseInt(body.age, 10);
      if (age < 7 || age > 12) {
        return NextResponse.json({ success: false, error: "Yosh 7–12 oralig'ida" }, { status: 400 });
      }
      data.age = age;
    }
    if (body.language === "uz" || body.language === "ru") data.language = body.language;

    const child = await prisma.child.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: child });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { parent } = await requireParentSession();
    const { id } = await context.params;

    const existing = await getParentChild(parent.id, id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Bola topilmadi" }, { status: 404 });
    }

    await prisma.child.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}
