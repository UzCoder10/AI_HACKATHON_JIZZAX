const YOUTUBE_ID_RE = /^[\w-]{11}$/;

const URL_PATTERNS = [
  /(?:youtube\.com\/watch\?[^#]*v=)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
  /(?:youtube-nocookie\.com\/embed\/)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
];

/** YouTube URL yoki 11 belgili ID dan video ID ajratadi */
export function parseYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID_RE.test(trimmed)) return trimmed;

  for (const pattern of URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export interface SafeEmbedOptions {
  /** CSP / postMessage uchun */
  origin?: string;
  autoplay?: boolean;
  startSeconds?: number;
}

/**
 * Bolalar uchun xavfsiz embed — youtube-nocookie, tavsiyalar/izohlar minimallashtirilgan.
 * @see https://developers.google.com/youtube/player_parameters
 */
export function buildNocookieEmbedUrl(
  youtubeId: string,
  options: SafeEmbedOptions = {}
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    fs: "0",
    disablekb: "1",
    playsinline: "1",
    controls: "1",
    cc_load_policy: "0",
    enablejsapi: "1",
  });

  if (options.origin) params.set("origin", options.origin);
  if (options.autoplay) params.set("autoplay", "1");
  if (options.startSeconds != null && options.startSeconds > 0) {
    params.set("start", String(Math.floor(options.startSeconds)));
  }

  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
}

export function buildYoutubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function isValidYoutubeId(id: string): boolean {
  return YOUTUBE_ID_RE.test(id);
}

export {
  fetchYoutubeVideoMetadata,
  parseIso8601Duration,
  isYoutubeApiConfigured,
} from "./youtubeDataApi";
export type { YoutubeVideoMetadata } from "./youtubeDataApi";
