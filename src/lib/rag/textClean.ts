/**
 * OCR/skanner PDF matnini tozalash — chuqur tuzatishsiz, aniq shovqinni olib tashlash.
 */

/** Sahifa raqami, kolontitul, qisqa shovqin qatorlari */
const NOISE_LINE_PATTERNS = [
  /^\s*\d{1,4}\s*$/,
  /^\s*[-–—]\s*\d{1,4}\s*[-–—]\s*$/,
  /^\s*page\s+\d+\s*$/i,
  /^\s*\[\s*\d+\s*\]\s*$/,
  /^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/i,
  /^\s*www\.\S+\s*$/i,
  /^\s*ziyouz\.com\s*$/i,
  /^\s*www\.ziyouz\.com\s+kutubxonasi\s*$/i,
  /^\s*©.*$/,
];

/** Takrorlanuvchi kolontitul (qisqa, har sahifada) */
const HEADER_FOOTER_HINTS = [
  /^tib\s*qonunlari/i,
  /^abu\s+ali\s+ibn\s+sino/i,
  /^mirzo\s+ulug'?bek/i,
  /^alisher\s+navoiy/i,
  /^beruniy/i,
  /^lisonut/i,
  /^to'?rt\s+ulus\s+tarixi/i,
];

function isNoiseLine(line: string): boolean {
  const t = line.trim();
  if (t.length === 0) return true;
  if (t.length <= 2 && !/\p{L}/u.test(t)) return true;
  if (NOISE_LINE_PATTERNS.some((p) => p.test(t))) return true;
  if (t.length < 80 && HEADER_FOOTER_HINTS.some((p) => p.test(t))) return true;
  return false;
}

/** Ko'p bo'shliq va qator tanaffuslarini tuzatish */
export function collapseWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** OCR buzilgan qisqa bo'laklarni biriktrishga yordam (faqat aniq holatlar) */
export function fixObviousOcrBreaks(text: string): string {
  return text
    .replace(/\b([a-zA-Z\u0400-\u04FF]) ([a-zA-Z\u0400-\u04FF]{1,3})\b/g, (m, a, b) => {
      // "k yin" → "keyin", "b mor" → "bemor" kabi 1-3 harfli bo'laklar
      if (b.length <= 3 && /^[a-z\u0430-\u044f]+$/i.test(a + b)) {
        return a + b;
      }
      return m;
    })
    .replace(/([a-zA-Z\u0400-\u04FF])-\s+([a-zA-Z\u0400-\u04FF])/g, "$1$2");
}

export function cleanExtractedText(raw: string): string {
  const lines = raw.split("\n");
  const cleaned = lines.filter((line) => !isNoiseLine(line));
  let text = cleaned.join("\n");
  text = fixObviousOcrBreaks(text);
  return collapseWhitespace(text);
}

/** Ibn Sino hikoyalarini alohida hujjatlarga bo'lish */
function isStoryTitleLine(line: string, nextLine?: string): boolean {
  const t = line.trim();
  if (t.length < 12 || t.length > 100) return false;
  if (/^hikoya/i.test(t) || /^№\s*\d+/.test(t)) return true;
  const letters = t.replace(/[^A-Za-zА-Яа-яЁёЎўҒғҚқҲҳO'']/g, "");
  if (letters.length < 10) return false;
  const upper = letters.replace(/[^A-ZА-ЯЁЎҒҚҲ]/g, "").length;
  if (upper / letters.length < 0.75) return false;
  // Sarlavha odatda keyingi qatorda kichik harf bilan davom etadi
  const next = nextLine?.trim() ?? "";
  if (next.length > 0 && /^[a-zа-яё]/.test(next)) return true;
  return false;
}

export function splitIbnSinoStories(text: string): Array<{ title: string; body: string }> {
  const lines = text.split("\n");
  const indices: Array<{ index: number; title: string }> = [];
  let offset = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    if ((prevBlank || i > 0) && isStoryTitleLine(line, nextLine)) {
      indices.push({ index: offset, title: line.trim().slice(0, 80) });
    }
    offset += line.length + 1;
  }

  // Hikoya / raqamli sarlavhalar
  const storyStart =
    /(?:^|\n\n)(?:Hikoya|HIKOYA|Hikoyasi|№\s*\d+|(\d{1,2})\.\s+[A-ZА-ЯЎҒҚҲ])/gm;
  let match: RegExpExecArray | null;
  while ((match = storyStart.exec(text)) !== null) {
    const start = match.index + (match[0].startsWith("\n") ? 1 : 0);
    const line = text.slice(start, text.indexOf("\n", start + 1)).trim();
    if (!indices.some((x) => Math.abs(x.index - start) < 5)) {
      indices.push({ index: start, title: line.slice(0, 80) || `Hikoya ${indices.length + 1}` });
    }
  }

  indices.sort((a, b) => a.index - b.index);

  if (indices.length < 2) {
    return [{ title: "ibn-sino-asar", body: text }];
  }

  const stories: Array<{ title: string; body: string }> = [];
  for (let i = 0; i < indices.length; i += 1) {
    const start = indices[i].index;
    const end = i + 1 < indices.length ? indices[i + 1].index : text.length;
    const body = text.slice(start, end).trim();
    if (body.length > 200) {
      stories.push({ title: indices[i].title, body });
    }
  }

  return stories.length > 0 ? stories : [{ title: "ibn-sino-asar", body: text }];
}

/** Ilmiy matn — paragraf bo'yicha (bo'sh qator bilan) */
export function splitByParagraphs(text: string, minLen = 120): string[] {
  const parts = text.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length >= minLen);
  return parts.length > 0 ? parts : [text];
}
