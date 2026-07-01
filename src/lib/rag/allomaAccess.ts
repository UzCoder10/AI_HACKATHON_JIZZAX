import {
  getParentIdByChildId,
  getParentSubscription,
  checkChatLimit,
  checkFigureAccess,
} from "@/lib/payments/limits";
import { resolveAllomaSlug } from "@/lib/rag/allomaIds";

export async function assertAllomaChatAccess(
  childId: string,
  allomaId: string
): Promise<{ allowed: true } | { allowed: false; reason: string; status: 402 }> {
  const slug = resolveAllomaSlug(allomaId);
  const parentId = await getParentIdByChildId(childId);
  if (!parentId || !slug) return { allowed: true };

  const sub = await getParentSubscription(parentId);
  const figureLimit = checkFigureAccess(sub.planId, slug);
  if (!figureLimit.allowed) {
    return { allowed: false, reason: figureLimit.reason ?? "Kirish cheklangan", status: 402 };
  }

  const chatLimit = await checkChatLimit(parentId, childId);
  if (!chatLimit.allowed) {
    return { allowed: false, reason: chatLimit.reason ?? "Kunlik limit tugadi", status: 402 };
  }

  return { allowed: true };
}
