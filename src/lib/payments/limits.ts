import { prisma } from "@/lib/db/client";
import { getPlan, FREE_FIGURE_SLUGS, type PlanId } from "./plans";

export interface EffectiveSubscription {
  planId: PlanId;
  active: boolean;
  expiresAt: Date | null;
}

export async function getParentSubscription(parentId: string): Promise<EffectiveSubscription> {
  const settings = await prisma.parentSettings.findUnique({ where: { parentId } });
  if (!settings) {
    return { planId: "free", active: true, expiresAt: null };
  }

  const planId = (settings.subscriptionPlan as PlanId) ?? "free";

  if (planId === "free") {
    return { planId: "free", active: true, expiresAt: null };
  }

  const expired =
    !settings.subscriptionExpiresAt || settings.subscriptionExpiresAt < new Date();

  if (expired || !settings.subscriptionActive) {
    await prisma.parentSettings.update({
      where: { parentId },
      data: {
        subscriptionPlan: "free",
        subscriptionActive: false,
        subscriptionExpiresAt: null,
      },
    });
    return { planId: "free", active: true, expiresAt: null };
  }

  return {
    planId,
    active: true,
    expiresAt: settings.subscriptionExpiresAt,
  };
}

export async function countTodayMessages(childId: string): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return prisma.message.count({
    where: {
      role: "user",
      createdAt: { gte: start },
      conversation: { childId },
    },
  });
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  code?: "CHAT_LIMIT" | "FIGURE_LOCKED" | "REPORT_LOCKED" | "CHILD_LIMIT";
}

export async function checkChatLimit(parentId: string, childId: string): Promise<LimitCheckResult> {
  const sub = await getParentSubscription(parentId);
  const plan = getPlan(sub.planId);

  if (plan.dailyChatLimit === null) return { allowed: true };

  const count = await countTodayMessages(childId);
  if (count >= plan.dailyChatLimit) {
    return {
      allowed: false,
      code: "CHAT_LIMIT",
      reason: `Bepul tarif: kuniga ${plan.dailyChatLimit} ta xabar limiti.`,
    };
  }
  return { allowed: true };
}

export function checkFigureAccess(planId: PlanId, figureSlug: string): LimitCheckResult {
  const plan = getPlan(planId);
  if (plan.greatFigureSlugs === null) return { allowed: true };
  if (plan.greatFigureSlugs.includes(figureSlug)) return { allowed: true };

  return {
    allowed: false,
    code: "FIGURE_LOCKED",
    reason: `Bu shaxs premium tarifda ochiladi. Bepul: ${FREE_FIGURE_SLUGS.slice(0, 3).join(", ")}`,
  };
}

export function checkReportAccess(planId: PlanId, active: boolean): LimitCheckResult {
  if (!active) {
    return {
      allowed: false,
      code: "REPORT_LOCKED",
      reason: "Obuna faol emas. Hisobot uchun obunani yangilang.",
    };
  }
  const plan = getPlan(planId);
  if (plan.weeklyReport) return { allowed: true };
  return {
    allowed: false,
    code: "REPORT_LOCKED",
    reason: "Haftalik hisobot Standart yoki Oilaviy tarifda ochiladi.",
  };
}

export async function checkChildLimit(parentId: string, currentCount: number): Promise<LimitCheckResult> {
  const sub = await getParentSubscription(parentId);
  const plan = getPlan(sub.planId);
  if (currentCount < plan.maxChildren) return { allowed: true };
  return {
    allowed: false,
    code: "CHILD_LIMIT",
    reason: `${plan.nameUz} tarifida maksimum ${plan.maxChildren} bola profili.`,
  };
}

/** childId orqali parentId topish (cheklov uchun) */
export async function getParentIdByChildId(childId: string): Promise<string | null> {
  const child = await prisma.child.findUnique({ where: { id: childId }, select: { parentId: true } });
  return child?.parentId ?? null;
}
