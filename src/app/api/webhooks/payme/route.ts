import { NextRequest, NextResponse } from "next/server";
import { handlePaymeWebhook } from "@/lib/payments/paymeHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const auth = request.headers.get("authorization");
    const response = await handlePaymeWebhook(body, auth);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[POST /api/webhooks/payme]", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32400, message: { en: "System error" } },
      },
      { status: 200 }
    );
  }
}
