"use client";

import { useChildSession } from "@/lib/child/ChildProvider";
import { getDailyTask, t } from "@/lib/child/i18n";

export function DailyTaskCard() {
  const { profile, hasDailyTaskToday, markDailyTaskDone, addStars } = useChildSession();
  const task = getDailyTask(profile.language);

  function handleComplete() {
    if (hasDailyTaskToday) return;
    markDailyTaskDone();
    addStars(3);
  }

  return (
    <section className="bg-primary rounded-[24px] p-5 text-on-primary shadow-vibrant-primary relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 flex items-start gap-3">
        <span className="text-4xl" aria-hidden>
          {task.emoji}
        </span>
        <div className="flex-1">
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
            {t("dailyTask", profile.language)}
          </h2>
          <p className="text-lg font-extrabold mt-1 leading-snug">{task.text}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleComplete}
        disabled={hasDailyTaskToday}
        className={`relative z-10 mt-4 w-full py-4 rounded-full font-extrabold text-sm min-h-[52px] transition-all ${
          hasDailyTaskToday
            ? "bg-white/25 cursor-default"
            : "bg-white text-primary hover:bg-primary-fixed active:scale-[0.98] shadow-lg"
        }`}
      >
        {hasDailyTaskToday ? t("dailyDone", profile.language) : t("dailyStart", profile.language)}
      </button>
    </section>
  );
}
