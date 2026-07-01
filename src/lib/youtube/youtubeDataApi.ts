import { env } from "@/lib/env";

export interface YoutubeVideoMetadata {
  youtubeId: string;
  title: string;
  durationSeconds: number;
  thumbnailUrl?: string;
}

/** ISO 8601 (PT4M45S) → soniya */
export function parseIso8601Duration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function isYoutubeApiConfigured(): boolean {
  return Boolean(env.youtube.apiKey?.trim());
}

/**
 * YouTube Data API v3 — video sarlavha va davomiylik.
 * Admin faqat link/ID kiritganda qolgan maydonlar avtomatik to'ldiriladi.
 */
export async function fetchYoutubeVideoMetadata(
  youtubeId: string
): Promise<YoutubeVideoMetadata | null> {
  const apiKey = env.youtube.apiKey?.trim();
  if (!apiKey) return null;

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("id", youtubeId);
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("[fetchYoutubeVideoMetadata]", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet?: { title?: string; thumbnails?: { medium?: { url?: string } } };
        contentDetails?: { duration?: string };
      }>;
    };

    const item = data.items?.[0];
    if (!item?.snippet?.title) return null;

    return {
      youtubeId: item.id,
      title: item.snippet.title,
      durationSeconds: parseIso8601Duration(item.contentDetails?.duration ?? "PT0S"),
      thumbnailUrl: item.snippet.thumbnails?.medium?.url,
    };
  } catch (error) {
    console.error("[fetchYoutubeVideoMetadata]", error);
    return null;
  }
}
