import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { verifyPassword, validateEmail } from "@/lib/auth/password";
import { signSession, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !validateEmail(email) || !password) {
      return NextResponse.json({ success: false, error: "Email va parol talab qilinadi" }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({ where: { email } });
    if (!parent || !(await verifyPassword(password, parent.passwordHash))) {
      return NextResponse.json(
        { success: false, error: "Email yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    const token = await signSession({ parentId: parent.id, email: parent.email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: parent.id,
        email: parent.email,
        name: parent.name,
        hasPin: Boolean(parent.pinHash),
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ success: false, error: "Kirishda xatolik" }, { status: 500 });
  }
}
