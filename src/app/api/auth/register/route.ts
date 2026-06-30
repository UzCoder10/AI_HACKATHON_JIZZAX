import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { hashPassword, validateEmail, validatePassword } from "@/lib/auth/password";
import { signSession, setSessionCookie } from "@/lib/auth/session";
import { ensureParentSettings } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ success: false, error: "Noto'g'ri email" }, { status: 400 });
    }
    if (!password || !validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: "Parol kamida 8 belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    const existing = await prisma.parent.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Bu email allaqachon ro'yxatdan o'tgan" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const parent = await prisma.parent.create({
      data: { email, passwordHash, name: name || null },
    });

    await ensureParentSettings(parent.id);

    const token = await signSession({ parentId: parent.id, email: parent.email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: { id: parent.id, email: parent.email, name: parent.name },
    });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ success: false, error: "Ro'yxatdan o'tishda xatolik" }, { status: 500 });
  }
}
