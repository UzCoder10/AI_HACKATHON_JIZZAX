"use client";

import Link from "next/link";
import { PARENT_ROUTES } from "@/lib/parent/routes";
import { MaterialIcon } from "./MaterialIcon";
import { useCountUp } from "./useCountUp";
import { useReducedMotion } from "./useReducedMotion";

const CIRCUMFERENCE = 150;

type Props = {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  progressPercent: number;
  todayMinutes: number;
  streakDays: number;
  ringColor?: "primary" | "secondary";
  delay?: number;
};

export function ChildProfileCard({
  id,
  name,
  age,
  avatarUrl,
  progressPercent,
  todayMinutes,
  streakDays,
  ringColor = "primary",
  delay = 0,
}: Props) {
  const reduced = useReducedMotion();
  const count = useCountUp(progressPercent, 1200);
  const strokeColor = ringColor === "secondary" ? "#fd761a" : "#4f46e5";
  const textColor = ringColor === "secondary" ? "text-[#fd761a]" : "text-[#4f46e5]";
  const offset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;

  return (
    <article className="nurture-card rounded-3xl border border-[#c7c4d8]/5 bg-white p-6 group">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl ring-4 ring-[#4f46e5]/10 transition-all group-hover:ring-[#4f46e5]/30">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#e7eeff] text-2xl font-bold text-[#4f46e5]">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#111c2d]">{name}</h4>
            <span className="rounded-lg bg-[#e7eeff] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#3525cd]">
              {age} yosh
            </span>
          </div>
        </div>
        <div className="relative h-14 w-14">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="transparent"
              stroke="#e7eeff"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="4"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={reduced ? offset : undefined}
              className={reduced ? "" : "nurture-progress-ring"}
              style={
                reduced
                  ? ({ "--ring-offset": `${offset}px` } as React.CSSProperties)
                  : ({ animationDelay: `${delay}ms` } as React.CSSProperties)
              }
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${textColor}`}>
            {count}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl bg-[#f9f9ff] p-3 transition-colors group-hover:bg-[#4f46e5]/10">
          <div className="flex items-center gap-2">
            <MaterialIcon name="timer" filled className="!text-base text-[#fd761a]" />
            <span className="text-sm font-semibold text-[#777587]">Bugun:</span>
          </div>
          <span className="text-sm font-bold text-[#111c2d]">{todayMinutes} min</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-[#f9f9ff] p-3 transition-colors group-hover:bg-[#4f46e5]/10">
          <div className="flex items-center gap-2">
            <MaterialIcon name="local_fire_department" filled className="!text-base text-[#005523]" />
            <span className="text-sm font-semibold text-[#777587]">Streak:</span>
          </div>
          <span className="text-sm font-bold text-[#111c2d]">{streakDays} kun</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link
          href={PARENT_ROUTES.child(id)}
          className="block w-full rounded-2xl bg-[#dee8ff] py-3 text-center text-sm font-bold text-[#3525cd] transition-colors group-hover:bg-[#3525cd] group-hover:text-white"
        >
          Batafsil ma&apos;lumat
        </Link>
        <Link
          href={`/child?childId=${encodeURIComponent(id)}`}
          className="block w-full rounded-2xl border-2 border-[#3525cd]/20 py-3 text-center text-sm font-bold text-[#3525cd] transition-colors hover:bg-[#3525cd]/5"
        >
          Bola rejimi
        </Link>
      </div>
    </article>
  );
}
