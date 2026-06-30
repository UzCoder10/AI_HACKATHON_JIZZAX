import { NextResponse } from "next/server";
import { requireParentSession } from "@/lib/auth/guards";
import { isPinVerified } from "@/lib/auth/session";

export async function GET() {
  try {
    const { session, parent } = await requireParentSession();
    const pinOk = !parent.pinHash || (await isPinVerified(session.parentId));

    return NextResponse.json({
      success: true,
      data: {
        id: parent.id,
        email: parent.email,
        name: parent.name,
        hasPin: Boolean(parent.pinHash),
        pinVerified: pinOk,
        children: parent.children,
        settings: parent.settings,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
}
