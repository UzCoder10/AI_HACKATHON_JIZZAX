export type PlanId = "free" | "standard" | "family";
export type PaymentProviderName = "payme" | "click";

export interface PlanDefinition {
  id: PlanId;
  nameUz: string;
  nameRu: string;
  priceUzs: number; // so'm
  priceLabel: string;
  /** tiyin */
  amountTiyin: number;
  maxChildren: number;
  dailyChatLimit: number | null; // null = cheksiz
  greatFigureSlugs: string[] | null; // null = barchasi
  weeklyReport: boolean;
  recurrent: boolean;
}

/** Bepul: 2-3 siymo — birinchi 3 ta */
export const FREE_FIGURE_SLUGS = [
  "mirzo-ulugbek",
  "al-xorazmiy",
  "alisher-navoiy",
];

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    nameUz: "Bepul",
    nameRu: "Бесплатно",
    priceUzs: 0,
    priceLabel: "0 so'm",
    amountTiyin: 0,
    maxChildren: 1,
    dailyChatLimit: 15,
    greatFigureSlugs: FREE_FIGURE_SLUGS,
    weeklyReport: false,
    recurrent: false,
  },
  standard: {
    id: "standard",
    nameUz: "Standart",
    nameRu: "Стандарт",
    priceUzs: 24_000,
    priceLabel: "24 000 so'm/oy",
    amountTiyin: 24_000 * 100,
    maxChildren: 1,
    dailyChatLimit: null,
    greatFigureSlugs: null,
    weeklyReport: true,
    recurrent: true,
  },
  family: {
    id: "family",
    nameUz: "Oilaviy",
    nameRu: "Семейный",
    priceUzs: 29_000,
    priceLabel: "29 000 so'm/oy",
    amountTiyin: 29_000 * 100,
    maxChildren: 3,
    dailyChatLimit: null,
    greatFigureSlugs: null,
    weeklyReport: true,
    recurrent: true,
  },
};

export const SUBSCRIPTION_PERIOD_DAYS = 30;

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId as PlanId] ?? PLANS.free;
}

export function isPaidPlan(planId: string): boolean {
  return planId === "standard" || planId === "family";
}
