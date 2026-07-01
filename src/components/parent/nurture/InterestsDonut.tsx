"use client";

import { MaterialIcon } from "./MaterialIcon";
import { useReducedMotion } from "./useReducedMotion";
import type { ChildInterest } from "@/lib/parent/types";

const CIRCUMFERENCE = 502;

type Props = {
  interests: ChildInterest[];
};

export function InterestsDonut({ interests }: Props) {
  const reduced = useReducedMotion();
  let rotation = 0;

  return (
    <div>
      <h4 className="mb-6 text-xl font-bold text-[#111c2d] md:text-2xl">Qiziqishlar</h4>
      <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="80" fill="transparent" stroke="#e7eeff" strokeWidth="24" />
          {interests.map((item, i) => {
            const offset = CIRCUMFERENCE - (item.percent / 100) * CIRCUMFERENCE;
            const rot = rotation;
            rotation += (item.percent / 100) * 360;
            return (
              <circle
                key={item.label}
                cx="96"
                cy="96"
                r="80"
                fill="transparent"
                stroke={item.color}
                strokeWidth="24"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={reduced ? offset : CIRCUMFERENCE}
                className={reduced ? "" : "nurture-donut-segment"}
                style={
                  {
                    "--donut-offset": `${offset}`,
                    transform: `rotate(${rot}deg)`,
                    transformOrigin: "96px 96px",
                    animationDelay: `${i * 0.2}s`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">100%</span>
          <span className="text-xs text-[#777587]">Jami</span>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {interests.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
            <span className="font-bold">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
