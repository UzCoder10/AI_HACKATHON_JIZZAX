"use client";

import { useEffect, useState } from "react";
import { ParentShell, ChildSelector } from "@/components/parent/ParentShell";
import { useParentSession } from "@/lib/parent/ParentProvider";

interface SafetyEventItem {
  id: string;
  severity: string;
  source: string;
  category: string | null;
  summary: string;
  createdAt: string;
}

export default function SafetyPage() {
  const { selectedChildId } = useParentSession();
  const [events, setEvents] = useState<SafetyEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const q = selectedChildId ? `?childId=${selectedChildId}` : "";
      const res = await fetch(`/api/parent/safety${q}`);
      const json = await res.json();
      if (json.success) setEvents(json.data);
      setLoading(false);
    }
    load();
  }, [selectedChildId]);

  return (
    <ParentShell title="Xavfsizlik ogohlantirishlari" subtitle="Umumlashtirilgan xulosa — to'liq matn ko'rsatilmaydi">
      <div className="mb-6">
        <ChildSelector />
      </div>

      {loading && <p className="text-outline font-semibold">Yuklanmoqda...</p>}

      <div className="space-y-4">
        {events.map((e) => (
          <div
            key={e.id}
            className={`rounded-2xl border p-5 bento-tile ${
              e.severity === "HIGH"
                ? "bg-red-50 border-red-300 shadow-vibrant-red"
                : e.severity === "MEDIUM"
                  ? "bg-secondary-container/20 border-secondary-container/50 shadow-ambient-secondary"
                  : "bg-white border-surface-variant shadow-vibrant-primary"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  e.severity === "HIGH"
                    ? "bg-red-600 text-white"
                    : e.severity === "MEDIUM"
                      ? "bg-secondary text-on-secondary-container"
                      : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {e.severity}
              </span>
              <span className="text-xs text-outline font-medium">
                {new Date(e.createdAt).toLocaleString("uz-UZ")}
              </span>
            </div>
            <p className="text-sm text-on-surface font-medium">{e.summary}</p>
            <p className="text-xs text-outline mt-1 font-semibold">
              {e.source} {e.category ? `· ${e.category}` : ""}
            </p>
          </div>
        ))}
        {!loading && events.length === 0 && (
          <div className="text-center py-12 bg-tertiary-fixed/20 border border-tertiary-fixed-dim/30 rounded-2xl">
            <p className="text-tertiary font-extrabold text-lg">Xavfsizlik hodisalari yo&apos;q ✓</p>
            <p className="text-sm text-outline mt-1 font-medium">Hammasi yaxshi!</p>
          </div>
        )}
      </div>
    </ParentShell>
  );
}
