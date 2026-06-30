import { prisma } from "@/lib/db/client";
import { PLANS, SUBSCRIPTION_PERIOD_DAYS, type PlanId } from "./plans";
import type { PaymentProviderName } from "./plans";

export async function createCheckoutSession(params: {
  parentId: string;
  planId: PlanId;
  provider: PaymentProviderName;
}) {
  const plan = PLANS[params.planId];
  if (!plan || plan.amountTiyin <= 0) {
    throw new Error("INVALID_PLAN");
  }

  const merchantTransId = `sf_${params.parentId.slice(0, 8)}_${Date.now()}`;

  const tx = await prisma.paymentTransaction.create({
    data: {
      parentId: params.parentId,
      provider: params.provider.toUpperCase() as "PAYME" | "CLICK",
      plan: params.planId,
      amount: plan.amountTiyin,
      merchantTransId,
      status: "PENDING",
    },
  });

  return { transaction: tx, plan };
}

export async function activateSubscription(params: {
  merchantTransId: string;
  providerTransId?: string;
}) {
  const tx = await prisma.paymentTransaction.findUnique({
    where: { merchantTransId: params.merchantTransId },
  });

  if (!tx) return { ok: false, reason: "NOT_FOUND" as const };
  if (tx.status === "COMPLETED") return { ok: true, reason: "ALREADY_COMPLETED" as const };

  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + SUBSCRIPTION_PERIOD_DAYS);

  await prisma.$transaction([
    prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: "COMPLETED",
        paidAt: now,
        providerTransId: params.providerTransId,
      },
    }),
    prisma.parentSettings.upsert({
      where: { parentId: tx.parentId },
      update: {
        subscriptionPlan: tx.plan,
        subscriptionActive: true,
        subscriptionExpiresAt: expires,
      },
      create: {
        parentId: tx.parentId,
        subscriptionPlan: tx.plan,
        subscriptionActive: true,
        subscriptionExpiresAt: expires,
      },
    }),
  ]);

  return { ok: true, parentId: tx.parentId, plan: tx.plan, expiresAt: expires };
}

export async function cancelPaymentTransaction(merchantTransId: string) {
  const tx = await prisma.paymentTransaction.findUnique({
    where: { merchantTransId },
  });
  if (!tx || tx.status !== "PENDING") return;

  await prisma.paymentTransaction.update({
    where: { id: tx.id },
    data: { status: "CANCELLED" },
  });
}

export async function getTransactionByMerchantId(merchantTransId: string) {
  return prisma.paymentTransaction.findUnique({ where: { merchantTransId } });
}
