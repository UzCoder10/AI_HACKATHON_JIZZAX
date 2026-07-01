import { getFigureFromCatalog } from "@/lib/rag/figuresCatalog";

/** Qisqa alloma_id → FIGURE_CATALOG slug */
export const ALLOMA_ID_ALIASES: Record<string, string> = {
  beruniy: "abu-rayhon-beruniy",
  "abu-rayhon-beruniy": "abu-rayhon-beruniy",
  ibn_sino: "ibn-sino",
  "ibn-sino": "ibn-sino",
  "abu-ali-ibn-sino": "ibn-sino",
  ulugbek: "mirzo-ulugbek",
  "mirzo-ulugbek": "mirzo-ulugbek",
  navoiy: "alisher-navoiy",
  "alisher-navoiy": "alisher-navoiy",
  xorazmiy: "al-xorazmiy",
  "al-xorazmiy": "al-xorazmiy",
  temur: "amir-temur",
  "amir-temur": "amir-temur",
  buxoriy: "imom-al-buxoriy",
  "imom-al-buxoriy": "imom-al-buxoriy",
};

/**
 * alloma_id (beruniy, ibn_sino, ...) yoki to'liq slug ni FIGURE_CATALOG slug ga aylantiradi.
 */
export function resolveAllomaSlug(allomaId: string): string | null {
  const key = allomaId.trim().toLowerCase();
  if (ALLOMA_ID_ALIASES[key]) return ALLOMA_ID_ALIASES[key];
  if (getFigureFromCatalog(key)) return key;
  return null;
}

export function isKnownAllomaId(allomaId: string): boolean {
  return resolveAllomaSlug(allomaId) !== null;
}
