const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MIN_AUDIO_BYTES = 512;

const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "video/webm",
]);

const EXT_TO_MIME: Record<string, string> = {
  webm: "audio/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
};

/** Brauzer MediaRecorder ko'pincha audio-only webm ni video/webm deb yuboradi; STT faqat audio/webm qabul qiladi. */
const MIME_ALIASES: Record<string, string> = {
  "video/webm": "audio/webm",
};

export function resolveAudioMimeType(mimeType: string | undefined, filename?: string): string {
  const normalized = mimeType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (normalized && MIME_ALIASES[normalized]) return MIME_ALIASES[normalized];
  if (normalized && ALLOWED_MIME.has(normalized)) return normalized;

  const ext = filename?.split(".").pop()?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];

  return "audio/webm";
}

/** STT provayderlar fayl kengaytmasi va MIME mos kelishini tekshiradi. */
export function sttUploadFilename(mimeType: string, preferred?: string): string {
  const ext = mimeType.includes("wav")
    ? "wav"
    : mimeType.includes("webm")
      ? "webm"
      : mimeType.includes("ogg")
        ? "ogg"
        : mimeType.includes("mpeg") || mimeType.includes("mp3")
          ? "mp3"
          : mimeType.includes("mp4") || mimeType.includes("m4a")
            ? "m4a"
            : "mp3";

  if (preferred?.includes(".")) {
    const stem = preferred.slice(0, preferred.lastIndexOf("."));
    return `${stem}.${ext}`;
  }
  if (preferred) return `${preferred}.${ext}`;
  return `recording.${ext}`;
}

export function validateAudioBuffer(
  buffer: Buffer,
  mimeType?: string
): { ok: true; mimeType: string } | { ok: false; error: string } {
  if (!buffer.length) {
    return { ok: false, error: "Audio fayl bo'sh" };
  }
  if (buffer.length < MIN_AUDIO_BYTES) {
    return { ok: false, error: "Audio juda qisqa — kamida bir necha soniya gapiring" };
  }
  if (buffer.length > MAX_AUDIO_BYTES) {
    return { ok: false, error: "Audio juda katta (max 10 MB)" };
  }

  const resolved = resolveAudioMimeType(mimeType);
  if (!ALLOWED_MIME.has(resolved)) {
    return { ok: false, error: "Qo'llab-quvvatlanmaydigan audio format (webm, mp3, wav, m4a)" };
  }

  return { ok: true, mimeType: resolved };
}

export function sttLanguageCode(language: "uz" | "ru"): string | undefined {
  if (language === "ru") return "ru";
  // OpenAI Whisper rasmiy o'zbek til kodini qo'llab-quvvatlamaydi — avto-aniqlash
  return undefined;
}
