/**
 * O'zbek kirill → lotin transliteratsiya (1995 yagona alifbo qoidalari).
 * Bola lotin alifbosida savol beradi — indeks ham lotinda bo'lishi kerak.
 */

const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: "A", а: "a",
  Б: "B", б: "b",
  В: "V", в: "v",
  Г: "G", г: "g",
  Д: "D", д: "d",
  Е: "E", е: "e",
  Ё: "Yo", ё: "yo",
  Ж: "J", ж: "j",
  З: "Z", з: "z",
  И: "I", и: "i",
  Й: "Y", й: "y",
  К: "K", к: "k",
  Л: "L", л: "l",
  М: "M", м: "m",
  Н: "N", н: "n",
  О: "O", о: "o",
  П: "P", п: "p",
  Р: "R", р: "r",
  С: "S", с: "s",
  Т: "T", т: "t",
  У: "U", у: "u",
  Ф: "F", ф: "f",
  Х: "X", х: "x",
  Ц: "Ts", ц: "ts",
  Ч: "Ch", ч: "ch",
  Ш: "Sh", ш: "sh",
  Щ: "Sh", щ: "sh",
  Ъ: "", ъ: "",
  Ы: "I", ы: "i",
  Ь: "", ь: "",
  Э: "E", э: "e",
  Ю: "Yu", ю: "yu",
  Я: "Ya", я: "ya",
  // O'zbek maxsus harflar
  Ғ: "Gʻ", ғ: "gʻ",
  Ў: "Oʻ", ў: "oʻ",
  Қ: "Q", қ: "q",
  Ҳ: "H", ҳ: "h",
  Ы: "I", ы: "i",
};

/** Matnda kirill ulushi (0–1) */
export function cyrillicRatio(text: string): number {
  if (!text.trim()) return 0;
  const cyr = (text.match(/[\u0400-\u04FF]/g) ?? []).length;
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  return letters === 0 ? 0 : cyr / letters;
}

export function containsCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

/** Har bir kirill harfni lotinga almashtiradi */
export function transliterateCyrillicToLatin(text: string): string {
  let out = "";
  for (const ch of text) {
    out += CYRILLIC_TO_LATIN[ch] ?? ch;
  }
  return out;
}

/**
 * Indeks uchun normallashtirish: kirill bo'lsa lotinga, apostroflarni birlashtirish.
 * `--dual-script` rejimida asl matn alohida saqlanadi.
 */
export function normalizeForRagIndex(text: string): string {
  let result = text;
  if (containsCyrillic(text)) {
    result = transliterateCyrillicToLatin(text);
  }
  // Typographic apostrophes → o'zbek lotin
  return result
    .replace(/[`´'ʼ]/g, "'")
    .replace(/O'/g, "Oʻ")
    .replace(/o'/g, "oʻ")
    .replace(/G'/g, "Gʻ")
    .replace(/g'/g, "gʻ");
}
