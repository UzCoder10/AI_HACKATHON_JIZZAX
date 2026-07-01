"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CHILD_BRAND } from "@/lib/child/brand";
import { getChildProgress, getLessons } from "@/lib/child/childData";
import type { ChildLesson, ChildProgressData } from "@/lib/child/aqlliTypes";
import { CHILD_ROUTES } from "@/lib/child/routes";
import { useChildSession } from "@/lib/child/ChildProvider";
import { ApiError } from "@/lib/api/fetchJson";
import { AqlliShell } from "./AqlliShell";
import { AqlliIcon } from "./AqlliIcon";
import { TalkButton } from "./TalkButton";
import { ChildEmpty, ChildError, ChildLoading } from "./ChildDataState";

const colorMap = {
  secondary: { bg: "bg-[#4c96fe]/10", icon: "bg-[#4c96fe] text-white", text: "text-[#005db8]" },
  tertiary: { bg: "bg-[#ffd2c4]/30", icon: "bg-[#ffd2c4] text-[#af3600]", text: "text-[#ab3500]" },
  primary: { bg: "bg-[#ffd93d]/20", icon: "bg-[#ffd93d] text-[#725e00]", text: "text-[#705d00]" },
  neutral: { bg: "bg-[#ece8d9]", icon: "bg-[#7e7761] text-white", text: "text-[#4d4633]" },
};

function SubjectCard({ lesson }: { lesson: ChildLesson }) {
  const c = colorMap[lesson.color];
  const href =
    lesson.video || lesson.subject === "figures"
      ? lesson.id === "figures-1"
        ? CHILD_ROUTES.talkWithFigure("abu-rayhon-beruniy")
        : CHILD_ROUTES.lesson(lesson.id)
      : CHILD_ROUTES.lesson(lesson.id);
  return (
    <Link
      href={href}
      className={`${c.bg} aqlli-bubbly flex flex-col items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${c.icon}`}>
        <AqlliIcon name={lesson.icon} size="lg" />
      </div>
      <span className={`text-center text-base font-bold leading-tight ${c.text}`}>{lesson.title}</span>
    </Link>
  );
}

export function ChildHomeView() {
  const router = useRouter();
  const { profile, ready, profileError, reloadProfile } = useChildSession();
  const [progress, setProgress] = useState<ChildProgressData | null>(null);
  const [lessons, setLessons] = useState<ChildLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = progress?.name ?? profile.name;

  const load = useCallback(async () => {
    if (!ready) return;
    if (profileError) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, l] = await Promise.all([
        getChildProgress(profile.childId || undefined),
        getLessons(),
      ]);
      setProgress(p);
      setLessons(l);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ma'lumot yuklanmadi");
    } finally {
      setLoading(false);
    }
  }, [profile.childId, ready, profileError]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!ready || loading) {
    return (
      <AqlliShell>
        <ChildLoading />
      </AqlliShell>
    );
  }

  if (profileError) {
    return (
      <AqlliShell>
        <ChildError
          message={profileError}
          showParentLinks
          onRetry={() => void reloadProfile()}
        />
      </AqlliShell>
    );
  }

  if (error) {
    return (
      <AqlliShell>
        <ChildError message={error} onRetry={() => void load()} />
      </AqlliShell>
    );
  }

  return (
    <AqlliShell>
      <div className="aqlli-page mx-auto w-full flex-1">
        <header className="flex items-center justify-between px-5 pb-3 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#ffd93d] bg-[#fff8e6] shadow-sm">
              {progress?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={progress.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#705d00]">
                  {displayName?.[0] ?? "?"}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight text-[#705d00]">{displayName}</p>
              <p className="text-xs font-semibold text-[#7e7761]">Bugun ham o&apos;rganamiz ✨</p>
            </div>
          </div>
          <div className="shrink-0 rounded-full bg-gradient-to-r from-[#ffd93d] to-[#ffb800] px-3 py-1.5 text-sm font-bold text-[#705d00] shadow-sm">
            🔥 {progress?.streakDays ?? 0}
          </div>
        </header>

        <main className="overflow-y-auto px-5 pb-32 pt-1">
          <section className="aqlli-hero px-6 py-8 text-center">
            <div className="aqlli-hero-blob" aria-hidden />
            <h1 className="relative z-10 text-[1.65rem] font-bold tracking-tight text-[#705d00]">
              {CHILD_BRAND.name}
            </h1>
            <p className="relative z-10 mt-2 text-base font-medium text-[#4d4633]">
              Bugun qanday sarguzashtlarga tayyorsan?
            </p>
            <div className="relative z-10 mt-7 flex justify-center">
              <TalkButton
                onClick={() => router.push(CHILD_ROUTES.talk)}
                label="Men bilan gaplash!"
              />
            </div>
          </section>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="aqlli-stat-chip">
              <AqlliIcon name="star" filled className="!text-base text-[#ab3500]" />
              <span className="text-sm font-bold text-[#705d00]">{progress?.xp ?? 0}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#7e7761]">XP</span>
            </div>
            <div className="aqlli-stat-chip">
              <AqlliIcon name="local_fire_department" filled className="!text-base text-[#ab3500]" />
              <span className="text-sm font-bold text-[#705d00]">{progress?.streakDays ?? 0}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#7e7761]">Kun</span>
            </div>
            <div className="aqlli-stat-chip">
              <AqlliIcon name="menu_book" filled className="!text-base text-[#005db8]" />
              <span className="text-sm font-bold text-[#705d00]">{lessons.length}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#7e7761]">Dars</span>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="mb-4 px-1 text-lg font-bold text-[#705d00]">Darslar va o&apos;yinlar</h2>
            <div className="grid grid-cols-2 gap-3">
              {lessons.length === 0 ? (
                <div className="col-span-2">
                  <ChildEmpty message="Hozircha darslar yo'q — tez orada qo'shiladi!" />
                </div>
              ) : (
                lessons.map((l) => <SubjectCard key={l.id} lesson={l} />)
              )}
              <Link
                href={CHILD_ROUTES.achievements}
                className="flex flex-col items-center gap-3 rounded-2xl bg-[#ece8d9] p-4 aqlli-bubbly transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7e7761] text-white">
                  <AqlliIcon name="military_tech" size="lg" />
                </div>
                <span className="text-center text-base font-bold text-[#4d4633]">Yutuqlarim</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </AqlliShell>
  );
}
