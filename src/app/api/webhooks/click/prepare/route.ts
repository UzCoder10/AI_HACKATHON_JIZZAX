import { NextRequest, NextResponse } from "next/server";
import { handleClickPrepare } from "@/lib/payments/clickHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await handleClickPrepare(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/webhooks/click/prepare]", error);
    return NextResponse.json({ error: -8, error_note: "System error" });
  }
}
