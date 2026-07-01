import { NextRequest, NextResponse } from "next/server";
import { requireParentSession } from "@/lib/auth/guards";
import {
  createCheckoutSession,
  buildPaymeCheckoutUrl,
  buildClickCheckoutUrl,
  isPaymeConfigured,
  isClickConfigured,
  PLANS,
  type PlanId,
} from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const { parent } = await requireParentSession();
    const body = await request.json();
    const planId = body.plan as PlanId;
    const provider = body.provider as "payme" | "click";

    if (!PLANS[planId] || planId === "free") {
      return NextResponse.json({ success: false, error: "Noto'g'ri tarif" }, { status: 400 });
    }

    if (provider === "payme" && !isPaymeConfigured()) {
      return NextResponse.json({ success: false, error: "Payme sozlanmagan" }, { status: 503 });
    }
    if (provider === "click" && !isClickConfigured()) {
      return NextResponse.json({ success: false, error: "Click sozlanmagan" }, { status: 503 });
    }

    const { transaction, plan } = await createCheckoutSession({
      parentId: parent.id,
      planId,
      provider,
    });

    const checkoutUrl =
      provider === "payme"
        ? buildPaymeCheckoutUrl({
            merchantTransId: transaction.merchantTransId,
            amountTiyin: plan.amountTiyin,
            description: `Nihol ${plan.nameUz} obuna`,
          })
        : buildClickCheckoutUrl({
            merchantTransId: transaction.merchantTransId,
            amountUzs: plan.priceUzs,
          });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl,
        transactionId: transaction.id,
        merchantTransId: transaction.merchantTransId,
        amount: plan.priceUzs,
        plan: planId,
        provider,
        recurrent: plan.recurrent,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }
    console.error("[POST /api/payments/checkout]", error);
    return NextResponse.json({ success: false, error: "To'lov yaratishda xatolik" }, { status: 500 });
  }
}
