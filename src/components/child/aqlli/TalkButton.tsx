"use client";

import { AqlliIcon } from "./AqlliIcon";
import { useReducedMotion } from "./useReducedMotion";

type Props = {
  onClick?: () => void;
  active?: boolean;
  size?: "md" | "lg";
  label?: string;
  hint?: string | false;
};

export function TalkButton({
  onClick,
  active,
  size = "lg",
  label = "Men bilan gaplash!",
  hint,
}: Props) {
  const reduced = useReducedMotion();
  const btnSize = size === "lg" ? "h-28 w-28" : "h-20 w-20";
  const ringSize = size === "lg" ? ["140px", "180px"] : ["100px", "130px"];

  return (
    <div className="relative flex flex-col items-center">
      {!reduced && (
        <>
          <div
            className="aqlli-pulse-ring pointer-events-none absolute rounded-full bg-[#ffd93d]/35"
            style={{ width: ringSize[0], height: ringSize[0] }}
          />
          <div
            className="aqlli-pulse-ring pointer-events-none absolute rounded-full bg-[#ffd93d]/18"
            style={{ width: ringSize[1], height: ringSize[1], animationDelay: "1s" }}
          />
        </>
      )}
      {label && (
        <p className="mb-4 text-center text-lg font-bold text-[#705d00] md:text-xl">{label}</p>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? "Suhbatni to'xtatish" : "Gapirishni boshlash"}
        className={`relative ${btnSize} flex items-center justify-center rounded-full bg-gradient-to-br from-[#ffe566] via-[#ffd93d] to-[#c9a800] shadow-[0_12px_28px_rgba(112,93,0,0.28)] ring-4 ring-white/70 transition-all duration-300 hover:scale-105 active:scale-95`}
      >
        <AqlliIcon name={active ? "stop" : "mic"} filled size="xl" className="text-white drop-shadow-sm" />
      </button>
      {hint !== false && (
        <p className="mt-3 text-sm font-semibold text-[#7e7761]">
          {hint ?? (active ? "Tinglayapman..." : "Mikrofonni bosing")}
        </p>
      )}
    </div>
  );
}

export function VoiceWaveform({ active }: { active?: boolean }) {
  const reduced = useReducedMotion();
  const heights = [20, 45, 60, 80, 50, 30, 70, 40];
  const delays = [-0.1, -0.4, -0.2, -0.6, -0.1, -0.5, -0.3, -0.7];

  if (!active) {
    return (
      <div className="flex h-24 items-end justify-center gap-1.5 opacity-30">
        {heights.map((h, i) => (
          <div key={i} className="w-1.5 rounded-full bg-[#005db8]" style={{ height: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-24 w-full max-w-sm items-end justify-center gap-1.5">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full bg-[#005db8] shadow-[0_0_15px_rgba(0,93,184,0.4)] ${reduced ? "" : "aqlli-wave-bar"}`}
          style={{
            height: reduced ? h : undefined,
            animationDelay: reduced ? undefined : `${delays[i]}s`,
            ...(reduced ? {} : { animationDuration: `${1 + (i % 3) * 0.2}s` }),
          }}
        />
      ))}
    </div>
  );
}
