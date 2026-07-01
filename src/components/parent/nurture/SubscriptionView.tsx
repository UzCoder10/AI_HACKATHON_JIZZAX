"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { getSubscription } from "@/lib/parent/parentData";
import { useParentSession } from "@/lib/parent/ParentProvider";
import type { SubscriptionData, SubscriptionPlan } from "@/lib/parent/types";
import { MaterialIcon } from "./MaterialIcon";

function formatAmount(amount: number) {
  return amount.toLocaleString("uz-UZ") + " so'm";
}

function PlanCard({ plan }: { plan: SubscriptionPlan }) {
  const isCurrent = plan.current;
  const isPremium = plan.id === "premium_plus";

  return (
    <div
      className={`flex flex-col rounded-3xl bg-white p-6 md:p-8 ${
        isCurrent
          ? "relative z-10 scale-[1.02] border-2 border-[#3525cd] shadow-[0_10px_30px_rgba(79,70,229,0.08)]"
          : "border border-[#c7c4d8]/20 shadow-[0_4px_20px_rgba(30,41,59,0.05)] transition-all hover:border-[#3525cd]/20"
      } ${isPremium && !isCurrent ? "hover:border-[#fd761a]" : ""}`}
    >
      {isCurrent && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3525cd] px-4 py-1 text-xs font-bold text-white shadow-lg shadow-[#3525cd]/30">
          JORIY REJA
        </div>
      )}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h4 className={`text-xl font-bold md:text-2xl ${isCurrent ? "text-[#3525cd]" : ""}`}>{plan.name}</h4>
          {isPremium && <MaterialIcon name="star" filled className="text-[#fd761a]" />}
        </div>
        <p className="text-base text-[#464555]">{plan.description}</p>
      </div>
      <div className="mb-6">
        <span className={`text-3xl font-bold md:text-[32px] ${isCurrent ? "text-[#3525cd]" : ""}`}>
          {plan.price.toLocaleString("uz-UZ")}
        </span>
        <span className="text-base text-[#464555]"> so&apos;m</span>
      </div>
      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-base">
            <MaterialIcon
              name="check_circle"
              filled={isCurrent}
              className={`!text-xl shrink-0 ${isPremium && !isCurrent ? "text-[#fd761a]" : "text-[#3525cd]"}`}
            />
            {f}
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <button
          type="button"
          disabled
          className="w-full cursor-default rounded-xl bg-[#e7eeff] py-3 text-sm font-bold text-[#464555]"
        >
          Faollashtirilgan
        </button>
      ) : (
        <button
          type="button"
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
            isPremium
              ? "bg-[#fd761a] text-white hover:shadow-lg hover:shadow-[#fd761a]/30"
              : "border border-[#3525cd] text-[#3525cd] hover:bg-[#3525cd]/5"
          }`}
        >
          {isPremium ? "Yangilash" : "O'tish"}
        </button>
      )}
    </div>
  );
}

export function SubscriptionView() {
  const { user, loading: sessionLoading } = useParentSession();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;

    async function load() {
      setLoading(true);
      setData(await getSubscription());
      setLoading(false);
    }

    load();
  }, [sessionLoading, user]);

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-bold text-[#3525cd]">
        Yuklanmoqda...
      </div>
    );
  }

  if (!data) {
    return <p className="p-8 text-[#777587]">Obuna ma&apos;lumotlari mavjud emas.</p>;
  }

  const currentPlan =
    data.plans.find((p) => p.id === data.currentPlan) ??
    data.plans[0] ?? {
      id: data.currentPlan,
      name: data.currentPlan === "free" ? "Bepul" : "Oilaviy",
      description: "",
      price: data.monthlyPrice,
      priceLabel: `${data.monthlyPrice} so'm`,
      features: [],
    };
  const profilePct = Math.round((data.profileLimit.used / data.profileLimit.total) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-[#4f46e5]/5 bg-white p-6 shadow-[0_4px_20px_rgba(30,41,59,0.05)] md:flex-row md:p-8 lg:col-span-2">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#3525cd]/5 blur-3xl" />
          <div className="z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#4f46e5]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3525cd]">
                Joriy reja
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-[#007030]">
                <MaterialIcon name="verified" className="!text-base" />
                Faol
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[#3525cd] md:text-[32px]">
              {currentPlan?.name ?? "Oila"} paketi
            </h3>
            <p className="text-base text-[#464555]">
              Keyingi to&apos;lov sanasi:{" "}
              <span className="font-bold text-[#111c2d]">{data.nextBillingDate}</span>
            </p>
            <div>
              <span className="text-4xl font-bold text-[#3525cd] md:text-5xl">
                {data.monthlyPrice.toLocaleString("uz-UZ")}
              </span>
              <span className="text-lg text-[#464555]"> so&apos;m/oy</span>
            </div>
          </div>
          <div className="z-10 flex w-full flex-col gap-3 md:w-auto">
            <button
              type="button"
              className="rounded-xl bg-[#3525cd] px-8 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-[#3525cd]/20 active:scale-[0.98]"
            >
              Paketni o&apos;zgartirish
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#c7c4d8] px-8 py-3 text-sm font-bold text-[#464555] transition-all hover:bg-[#f0f3ff]"
            >
              To&apos;lovni bekor qilish
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[#4f46e5]/5 bg-white p-6 shadow-[0_4px_20px_rgba(30,41,59,0.05)] md:p-8">
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#464555]">Statistika</h4>
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[#464555]">Profil limiti</p>
                <p className="text-2xl font-bold">
                  {data.profileLimit.used} / {data.profileLimit.total}
                </p>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-[#e7eeff]">
                <div className="h-full bg-[#3525cd]" style={{ width: `${profilePct}%` }} />
              </div>
            </div>
            <hr className="border-[#c7c4d8]/30" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#464555]">AI hisobotlar</p>
                <p className="text-sm font-bold">{data.aiReports}</p>
              </div>
              <MaterialIcon name="auto_awesome" className="text-[#007030]" />
            </div>
          </div>
        </div>
      </section>

      {data.plans.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-[#111c2d] md:text-[32px]">O&apos;zingizga mos rejani tanlang</h3>
            <p className="text-base text-[#464555]">Farzandlaringiz kelajagi uchun eng yaxshi sarmoya</p>
          </div>
          <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
            {data.plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-[#4f46e5]/5 bg-white p-6 shadow-[0_4px_20px_rgba(30,41,59,0.05)] md:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold md:text-2xl">To&apos;lov usullari</h3>
            <button type="button" className="flex items-center gap-1 text-sm font-bold text-[#3525cd] hover:underline">
              <MaterialIcon name="add" className="!text-xl" />
              Yangi karta
            </button>
          </div>
          <div className="space-y-3">
            {data.paymentMethods.map((card) => (
              <div
                key={card.id}
                className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#263143] to-[#111c2d] p-5 text-white"
              >
                <div className="absolute -bottom-6 -right-6 opacity-10">
                  <MaterialIcon name="credit_card" size="xl" />
                </div>
                <div className="z-10 space-y-3">
                  <p className="font-mono text-base">**** **** **** {card.last4}</p>
                  <div>
                    <p className="text-xs opacity-60">Karta egasi</p>
                    <p className="text-sm font-bold uppercase">{card.holder}</p>
                  </div>
                </div>
                <div className="z-10 text-right">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">ASOSIY</span>
                  <p className="mt-2 text-xs opacity-60">Amal qilish muddati</p>
                  <p className="text-sm font-bold">{card.expiry}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c7c4d8] py-10 transition-colors hover:border-[#3525cd]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7eeff] transition-colors group-hover:bg-[#4f46e5]/10">
                <MaterialIcon name="add_card" className="text-[#777587] group-hover:text-[#3525cd]" />
              </div>
              <p className="text-sm font-bold text-[#464555] group-hover:text-[#3525cd]">
                Humo yoki Uzcard qo&apos;shish
              </p>
            </button>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#4f46e5]/5 bg-white p-6 shadow-[0_4px_20px_rgba(30,41,59,0.05)] md:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold md:text-2xl">To&apos;lovlar tarixi</h3>
            <button type="button" className="rounded-full p-2 transition-colors hover:bg-[#e7eeff]">
              <MaterialIcon name="filter_list" className="text-[#464555]" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#c7c4d8]/30 text-xs uppercase tracking-wider text-[#464555]">
                  <th className="pb-3 font-bold">Sana</th>
                  <th className="pb-3 font-bold">Miqdor</th>
                  <th className="pb-3 font-bold">Holat</th>
                  <th className="pb-3 text-right font-bold">Kvitansiya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c7c4d8]/20">
                {data.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-4">
                      <p className="text-sm font-bold">{tx.date}</p>
                      <p className="text-xs text-[#464555]">{tx.invoice}</p>
                    </td>
                    <td className="py-4 text-sm font-bold">{formatAmount(tx.amount)}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-[#007030]/10 px-2 py-1 text-xs font-bold text-[#005523]">
                        Muvaffaqiyatli
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button type="button" className="rounded-lg p-2 text-[#3525cd] transition-colors hover:bg-[#4f46e5]/10">
                        <MaterialIcon name="download" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="w-full rounded-xl py-2 text-sm font-bold text-[#3525cd] transition-colors hover:bg-[#4f46e5]/5">
            Barchasini ko&apos;rish
          </button>
        </section>
      </div>

      <div className="relative overflow-hidden rounded-[32px] border border-[#c7c4d8]/20 bg-[#e7eeff] p-8 text-center md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(53,37,205,0.05),transparent)]" />
        <h4 className="relative text-xl font-bold md:text-2xl">Savollaringiz bormi?</h4>
        <p className="relative mx-auto mt-3 max-w-lg text-base text-[#464555]">
          To&apos;lovlar yoki obuna rejalari haqida qo&apos;shimcha ma&apos;lumot kerak bo&apos;lsa, {BRAND.name}{" "}
          qo&apos;llab-quvvatlash jamoasi yordamga tayyor.
        </p>
        <div className="relative mt-6 flex flex-wrap justify-center gap-4">
          <button type="button" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold shadow-sm transition-shadow hover:shadow-md">
            <MaterialIcon name="chat" className="text-[#3525cd]" />
            Chatga yozish
          </button>
          <button type="button" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold shadow-sm transition-shadow hover:shadow-md">
            <MaterialIcon name="description" className="text-[#3525cd]" />
            FAQ
          </button>
        </div>
      </div>
    </div>
  );
}
