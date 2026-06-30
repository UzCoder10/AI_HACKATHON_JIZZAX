import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireParentSession } from "@/lib/auth/guards";
import { hashPin, verifyPin, validatePin } from "@/lib/auth/password";
import { signPinVerified, setPinCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { session, parent } = await requireParentSession();
    const body = await request.json();
    const { pin, newPin, action } = body;

    // PIN o'rnatish/yangilash
    if (action === "set") {
      if (!newPin || !validatePin(String(newPin))) {
        return NextResponse.json(
          { success: false, error: "PIN 4-6 raqamdan iborat bo'lishi kerak" },
          { status: 400 }
        );
      }
      if (parent.pinHash && (!pin || !(await verifyPin(String(pin), parent.pinHash)))) {
        return NextResponse.json({ success: false, error: "Joriy PIN noto'g'ri" }, { status: 401 });
      }
      await prisma.parent.update({
        where: { id: parent.id },
        data: { pinHash: await hashPin(String(newPin)) },
      });
      const pinToken = await signPinVerified(session.parentId);
      await setPinCookie(pinToken);
      return NextResponse.json({ success: true, data: { pinVerified: true } });
    }

    // PIN tekshirish
    if (!pin || !parent.pinHash) {
      return NextResponse.json({ success: false, error: "PIN talab qilinadi" }, { status: 400 });
    }

    if (!(await verifyPin(String(pin), parent.pinHash))) {
      return NextResponse.json({ success: false, error: "PIN noto'g'ri" }, { status: 401 });
    }

    const pinToken = await signPinVerified(session.parentId);
    await setPinCookie(pinToken);
    return NextResponse.json({ success: true, data: { pinVerified: true } });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }
    console.error("[POST /api/auth/pin]", error);
    return NextResponse.json({ success: false, error: "PIN xatolik" }, { status: 500 });
  }
}
