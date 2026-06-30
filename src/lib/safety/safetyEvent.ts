import type { SafetyEventPayload, SafetySeverity, SafetySource } from "@/types/safety";
import { prisma } from "@/lib/db/client";

function toPrismaSource(source: SafetySource): "INPUT" | "OUTPUT" | "CRISIS" {
  const map: Record<SafetySource, "INPUT" | "OUTPUT" | "CRISIS"> = {
    input: "INPUT",
    output: "OUTPUT",
    crisis: "CRISIS",
  };
  return map[source];
}

function toPrismaSeverity(severity: SafetySeverity): "LOW" | "MEDIUM" | "HIGH" {
  const map: Record<SafetySeverity, "LOW" | "MEDIUM" | "HIGH"> = {
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
  };
  return map[severity];
}

/**
 * Bloklangan hodisalarni SafetyEvent sifatida log qiladi.
 * DB mavjud bo'lmasa — xatolikni yutadi, lekin xavfsizlik oqimi to'xtamaydi.
 */
export async function logSafetyEvent(payload: SafetyEventPayload): Promise<boolean> {
  try {
    await prisma.safetyEvent.create({
      data: {
        childId: payload.childId,
        sessionId: payload.sessionId,
        source: toPrismaSource(payload.source),
        severity: toPrismaSeverity(payload.severity),
        category: payload.category ?? null,
        summary: payload.summary,
      },
    });
    return true;
  } catch (error) {
    console.error("[SafetyEvent] Log qilishda xatolik:", error);
    return false;
  }
}

export function severityForCategory(
  crisis: boolean,
  source: SafetySource
): SafetySeverity {
  if (crisis || source === "crisis") return "high";
  if (source === "output") return "medium";
  return "medium";
}
