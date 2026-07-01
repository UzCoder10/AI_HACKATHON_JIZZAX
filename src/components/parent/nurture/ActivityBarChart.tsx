"use client";

import { MaterialIcon } from "./MaterialIcon";
import { useReducedMotion } from "./useReducedMotion";

type DayBar = {
  label: string;
  primaryHeight: number;
  secondaryHeight: number;
};

type Props = {
  days: DayBar[];
  legend?: { primary: string; secondary: string };
};

export function ActivityBarChart({
  days,
  legend = { primary: "Temur", secondary: "Laylo" },
}: Props) {
  const reduced = useReducedMotion();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#111c2d] md:text-2xl">Haftalik faollik</h3>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-sm font-semibold text-[#777587]">
            <span className="h-3 w-3 rounded-full bg-[#4f46e5]" />
            {legend.primary}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-[#777587]">
            <span className="h-3 w-3 rounded-full bg-[#fd761a]" />
            {legend.secondary}
          </span>
        </div>
      </div>
      <div className="flex h-64 items-end justify-between gap-2 overflow-hidden px-2 md:gap-4 md:px-4">
        {days.length === 0 ? (
          <p className="flex h-full w-full items-center justify-center text-sm text-[#777587]">
            Hali faollik ma&apos;lumotlari yo&apos;q.
          </p>
        ) : (
        days.map((day, i) => (
          <div key={day.label} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative h-40 w-full rounded-t-lg bg-[#e7eeff]">
              <div
                className={reduced ? "absolute bottom-0 w-full rounded-t-lg bg-[#4f46e5]/40" : "nurture-bar absolute bottom-0 w-full rounded-t-lg bg-[#4f46e5]/40"}
                style={{
                  height: `${day.primaryHeight}%`,
                  animationDelay: reduced ? undefined : `${0.1 + i * 0.1}s`,
                  ...(reduced ? { "--bar-height": `${day.primaryHeight}%` } : {}),
                } as React.CSSProperties}
              />
              <div
                className={reduced ? "absolute bottom-0 ml-1 rounded-t-lg bg-[#fd761a]/40" : "nurture-bar absolute bottom-0 ml-1 rounded-t-lg bg-[#fd761a]/40"}
                style={{
                  height: `${day.secondaryHeight}%`,
                  width: "calc(100% - 8px)",
                  animationDelay: reduced ? undefined : `${0.15 + i * 0.1}s`,
                  ...(reduced ? { "--bar-height": `${day.secondaryHeight}%` } : {}),
                } as React.CSSProperties}
              />
            </div>
            <span className="text-[10px] font-bold uppercase text-[#777587]">{day.label}</span>
          </div>
        ))
        )}
      </div>
    </div>
  );
}

export function AiTipsPanel({
  tips,
}: {
  tips: Array<{ title: string; body: string; icon: string; tone: "primary" | "secondary" }>;
}) {
  return (
    <div className="nurture-card relative overflow-hidden rounded-3xl border border-[#c7c4d8]/10 bg-white p-6 md:p-8 group">
      <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity duration-500 group-hover:opacity-20">
        <MaterialIcon name="psychology" className="text-6xl text-[#3525cd]" />
      </div>
      <h3 className="mb-4 text-lg font-bold text-[#111c2d]">AI Tavsiyasi</h3>
      <div className="space-y-6">
        {tips.length === 0 ? (
          <p className="text-sm text-[#777587]">
            Hali tavsiyalar shakllanmagan. Bola faoliyati boshlangach AI tavsiyalar paydo bo&apos;ladi.
          </p>
        ) : (
        tips.map((tip) => (
          <div key={tip.title} className="flex gap-4 transition-transform hover:translate-x-1">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tip.tone === "primary" ? "bg-[#e2dfff] text-[#3525cd]" : "bg-[#ffdbca] text-[#9d4300]"
              }`}
            >
              <MaterialIcon name={tip.icon} className="!text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111c2d]">{tip.title}</p>
              <p className="mt-1 text-[13px] leading-tight text-[#777587]">{tip.body}</p>
            </div>
          </div>
        ))
        )}
      </div>
      {tips.length > 0 && (
        <button
          type="button"
          className="mt-6 w-full rounded-2xl border-2 border-[#3525cd]/20 py-3 text-sm font-bold text-[#3525cd] transition-colors hover:bg-[#e2dfff]/30"
        >
          Barcha tavsiyalar
        </button>
      )}
    </div>
  );
}
