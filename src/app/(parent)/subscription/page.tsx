"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ParentShell } from "@/components/parent/ParentShell";
import { useParentSession } from "@/lib/parent/ParentProvider";
import { PLANS, type PlanId } from "@/lib/payments/plans";

function SubscriptionContent() {
  const { user, refresh } = useParentSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = (user?.settings?.subscriptionPlan ?? "free") as PlanId;
  const status = searchParams.get("status");

  async function handleCheckout(planId: PlanId, provider: "payme" | "click") {
    setLoading(`${planId}-${provider}`);
    setError(null);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, provider }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      window.location.href = json.data.checkoutUrl;
    } catch {
      setError("To'lov boshlashda xatolik");
    } finally {
      setLoading(null);
    }
  }

  if (status === "success") {
    refresh();
  }

  const planList: PlanId[] = ["free", "standard", "family"];

  return (
    <ParentShell title="Tariflar" subtitle="Oddiy va shaffof obuna rejalari">
      {status === "success" && (
        <div className="mb-4 p-4 bg-tertiary-fixed/30 border border-tertiary-fixed-dim/40 rounded-2xl text-tertiary font-semibold text-sm">
          To&apos;lov qabul qilindi! Obuna faollashtirilmoqda...
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <p className="text-on-surface-variant mb-6 font-medium">
        Payme va Click orqali oylik rekurrent to&apos;lov. Webhook orqali avtomatik faollashtirish.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {planList.map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = currentPlan === planId;

          return (
            <div
              key={planId}
              className={`rounded-[24px] border p-6 flex flex-col bento-tile ${
                planId === "family"
                  ? "border-primary bg-primary-fixed/20 shadow-ambient-primary"
                  : "border-surface-variant bg-white shadow-vibrant-primary"
              } ${isCurrent ? "ring-2 ring-tertiary-fixed-dim" : ""}`}
            >
              <h2 className="text-xl font-extrabold text-on-surface">{plan.nameUz}</h2>
              <p className="text-2xl font-black text-primary mt-2">{plan.priceLabel}</p>

              <ul className="mt-4 space-y-2 flex-1">
                <li className="text-sm text-on-surface-variant font-medium">
                  ✓ {plan.maxChildren} bola profili
                </li>
                <li className="text-sm text-on-surface-variant font-medium">
                  ✓ {plan.dailyChatLimit ? `${plan.dailyChatLimit} xabar/kun` : "Cheksiz suhbat"}
                </li>
                <li className="text-sm text-on-surface-variant font-medium">
                  ✓ {plan.greatFigureSlugs ? `${plan.greatFigureSlugs.length} Buyuk Siymo` : "Barcha shaxslar"}
                </li>
                <li className="text-sm text-on-surface-variant font-medium">
                  {plan.weeklyReport ? "✓ Haftalik hisobot" : "✗ Hisobotsiz"}
                </li>
              </ul>

              {isCurrent && (
                <p className="mt-4 text-sm font-extrabold text-tertiary">Joriy tarif</p>
              )}

              {planId !== "free" && (
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCheckout(planId, "payme")}
                    disabled={!!loading}
                    className="w-full py-3 bg-primary text-on-primary rounded-full font-extrabold hover:bg-primary-hover disabled:opacity-50 min-h-[44px] shadow-btn-primary text-sm"
                  >
                    {loading === `${planId}-payme` ? "..." : "Payme bilan to'lash"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckout(planId, "click")}
                    disabled={!!loading}
                    className="w-full py-3 bg-primary-container text-on-primary rounded-full font-extrabold hover:opacity-90 disabled:opacity-50 min-h-[44px] text-sm"
                  >
                    {loading === `${planId}-click` ? "..." : "Click bilan to'lash"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-outline mt-6 font-medium">
        Rekurrent: har 30 kunda obuna yangilanadi. Bekor qilish keyingi bosqichda.
      </p>
    </ParentShell>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="p-8">Yuklanmoqda...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
