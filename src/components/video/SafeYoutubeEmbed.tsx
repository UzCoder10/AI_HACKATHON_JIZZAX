"use client";

import { useMemo } from "react";
import { buildNocookieEmbedUrl } from "@/lib/youtube";
import type { LessonPausePoint } from "@/types/lesson";

export interface SafeYoutubeEmbedProps {
  youtubeId: string;
  title: string;
  /** Fonus Kids — keyin player API orqali to'xtatish nuqtalari */
  pausePoints?: LessonPausePoint[];
  className?: string;
}

/**
 * Bolalar uchun xavfsiz YouTube embed — youtube-nocookie, minimal UI.
 * Tavsiya videolar, izohlar va tashqi havolalar yashirilgan parametrlar bilan cheklangan.
 */
export function SafeYoutubeEmbed({
  youtubeId,
  title,
  pausePoints = [],
  className = "",
}: SafeYoutubeEmbedProps) {
  const embedUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    return buildNocookieEmbedUrl(youtubeId, { origin });
  }, [youtubeId]);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-black shadow-lg ${className}`}>
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          data-lesson-video
          data-youtube-id={youtubeId}
          data-pause-points={pausePoints.length > 0 ? JSON.stringify(pausePoints) : undefined}
        />
      </div>
      {pausePoints.length > 0 ? (
        <p className="sr-only">
          {pausePoints.length} ta interaktiv nuqta — keyin AI topshiriq bilan ulanadi
        </p>
      ) : null}
    </div>
  );
}
