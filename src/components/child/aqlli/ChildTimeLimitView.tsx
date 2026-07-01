"use client";

import Link from "next/link";
import { MASCOT_URL } from "@/lib/child/brand";
import { CHILD_ROUTES } from "@/lib/child/routes";
import { AqlliShell } from "./AqlliShell";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Vaqt chegarasi — faqat xabar. Sozlama/tashqi havola yo'q (xavfsizlik).
 */
export function ChildTimeLimitView() {
  const reduced = useReducedMotion();

  return (
    <AqlliShell showNav={false}>
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md" />
        <div className="h-full w-full bg-[#ece8d9] opacity-80" />
      </div>

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center px-5">
        <div className="aqlli-bubbly w-full max-w-md rounded-3xl bg-[#fdf9e9] p-8 text-center shadow-2xl">
          <div className={`mx-auto mb-6 h-32 w-32 ${reduced ? "" : "aqlli-float"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MASCOT_URL} alt="" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#705d00] md:text-[32px]">Vaqting tugadi!</h1>
          <p className="mt-4 text-lg text-[#4d4633]">
            Bugun uchun ekran vaqting tugadi. Ertaga yana ko&apos;rishamiz, do&apos;stim! 🌙
          </p>
          <p className="mt-2 text-sm text-[#7e7761]">
            Bu vaqtni ota-onang belgilagan. Dam ol va ertaga qayt!
          </p>
          <Link
            href={CHILD_ROUTES.home}
            className="mt-8 inline-block rounded-full bg-[#ffd93d] px-8 py-3 text-base font-bold text-[#725e00] active:scale-95"
          >
            Mayli, tushundim
          </Link>
        </div>
      </main>
    </AqlliShell>
  );
}
