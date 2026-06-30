"use client";

import { useState } from "react";
import { useChildSession } from "@/lib/child/ChildProvider";
import { t } from "@/lib/child/i18n";
import { MOOD_OPTIONS } from "@/types/childUI";

export function MoodPicker() {
  const { profile, progress, hasMoodToday, markMoodDone, addStars } = useChildSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayEmoji = hasMoodToday ? progress.lastMoodEmoji : selected;

  async function handleSave() {
    if (!selected || loading || hasMoodToday) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: profile.childId,
          emoji: selected,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? t("error", profile.language));
        return;
      }
      markMoodDone(selected);
      addStars(2);
    } catch {
      setError(t("error", profile.language));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-[24px] p-5 shadow-ambient-secondary border border-surface-container-low">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-on-surface">{t("moodTitle", profile.language)}</h2>
        <span className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-lg">
          😊
        </span>
      </div>

      {hasMoodToday ? (
        <div className="flex items-center gap-3 bg-tertiary-fixed/20 rounded-2xl p-4 border border-tertiary-fixed-dim/30">
          <span className="text-4xl">{displayEmoji ?? "😊"}</span>
          <p className="text-tertiary font-bold text-sm">{t("moodDone", profile.language)}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {MOOD_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelected(emoji)}
                className={`text-4xl min-w-[56px] min-h-[56px] rounded-2xl transition-all ${
                  selected === emoji
                    ? "bg-secondary-container scale-110 ring-4 ring-secondary-container/50 shadow-lg"
                    : "bg-surface-container hover:bg-secondary-container/30 hover:scale-105"
                }`}
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={!selected || loading}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-extrabold text-sm disabled:opacity-40 hover:bg-primary-hover active:scale-[0.98] transition-all min-h-[52px] shadow-btn-primary"
          >
            {loading ? t("loading", profile.language) : t("moodSave", profile.language)}
          </button>
        </>
      )}
    </section>
  );
}
