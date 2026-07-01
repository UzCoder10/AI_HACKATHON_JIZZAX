"use client";

import { useEffect, useState } from "react";
import type { ContentItem } from "@/lib/admin/types";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";
import { formatDuration } from "@/lib/youtube";

interface LessonVideoModalProps {
  lesson: ContentItem;
  open: boolean;
  onClose: () => void;
  onSaved: (lesson: ContentItem) => void;
}

export function LessonVideoModal({ lesson, open, onClose, onSaved }: LessonVideoModalProps) {
  const [youtubeInput, setYoutubeInput] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setYoutubeInput(lesson.youtubeId ?? lesson.videoUrl ?? "");
    setVideoTitle(lesson.videoTitle ?? "");
    setDurationSeconds(
      lesson.videoDurationSeconds != null ? String(lesson.videoDurationSeconds) : ""
    );
    setError(null);
  }, [open, lesson]);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}/video`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: youtubeInput.trim() || undefined,
          videoTitle: videoTitle.trim() || undefined,
          videoDurationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : undefined,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: ContentItem;
        error?: string;
      };
      if (!json.success || !json.data) {
        throw new Error(json.error ?? "Saqlash xatolik");
      }
      onSaved(json.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlash xatolik");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}/video`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { success: boolean; data?: ContentItem; error?: string };
      if (!json.success || !json.data) {
        throw new Error(json.error ?? "O'chirish xatolik");
      }
      onSaved(json.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "O'chirish xatolik");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className="admin-card w-full max-w-lg p-6 shadow-xl"
        role="dialog"
        aria-labelledby="lesson-video-title"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="lesson-video-title" className="text-lg font-semibold text-[var(--admin-primary)]">
              YouTube video
            </h2>
            <p className="text-sm text-[var(--admin-text-muted)]">{lesson.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--admin-surface-low)]"
            aria-label="Yopish"
          >
            <AdminIcon name="close" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="admin-label-caps text-[var(--admin-text-subtle)] mb-1 block">
              YouTube link yoki ID
            </label>
            <input
              type="text"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=... yoki Qd6nLM2JlI8"
              className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded bg-[var(--admin-surface)]"
            />
          </div>

          <div>
            <label className="admin-label-caps text-[var(--admin-text-subtle)] mb-1 block">
              Video sarlavhasi
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Masalan: Quyosh tizimi haqida"
              className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded bg-[var(--admin-surface)]"
            />
          </div>

          <div>
            <label className="admin-label-caps text-[var(--admin-text-subtle)] mb-1 block">
              Davomiylik (soniya)
            </label>
            <input
              type="number"
              min={1}
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="285"
              className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded bg-[var(--admin-surface)]"
            />
            {durationSeconds ? (
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                {formatDuration(parseInt(durationSeconds, 10))}
              </p>
            ) : null}
          </div>

          {lesson.youtubeId ? (
            <p className="text-xs text-[var(--admin-text-muted)]">
              Joriy: {lesson.videoTitle ?? lesson.youtubeId} ({formatDuration(lesson.videoDurationSeconds)})
            </p>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-between gap-2 mt-6">
          {lesson.youtubeId ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
            >
              Videoni olib tashlash
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold border border-[var(--admin-border)] rounded"
            >
              Bekor
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !youtubeInput.trim()}
              className="px-4 py-2 text-sm font-semibold bg-[var(--admin-primary)] text-white rounded disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
