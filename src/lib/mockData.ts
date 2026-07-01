import type { ChildDetail, ChildProfile, DashboardSummary, SubscriptionData } from "@/lib/parent/types";
import { useParentMock } from "@/lib/config/dataMode";

export const USE_MOCK = useParentMock();

export const mockDashboardSummary: DashboardSummary = {
  greetingName: "Aziza opa",
  totalHours: 128,
  activeDays: 24,
  weeklyGrowthPercent: 12,
};

export const mockWeeklyActivity = [
  { label: "Du", primaryHeight: 60, secondaryHeight: 40 },
  { label: "Se", primaryHeight: 85, secondaryHeight: 55 },
  { label: "Ch", primaryHeight: 45, secondaryHeight: 70 },
  { label: "Pa", primaryHeight: 95, secondaryHeight: 30 },
  { label: "Ju", primaryHeight: 75, secondaryHeight: 90 },
  { label: "Sh", primaryHeight: 20, secondaryHeight: 15 },
  { label: "Ya", primaryHeight: 10, secondaryHeight: 5 },
];

export const mockAiTips = [
  {
    title: "Matematika vaqti",
    body: "Temur bugun matematikadan 90% natija ko'rsatdi. Uni mantiqiy o'yinlar bilan rag'batlantiring.",
    icon: "lightbulb",
    tone: "primary" as const,
  },
  {
    title: "Ingliz tili",
    body: "Laylo yangi 20 ta so'z o'rgandi. Kechki ovqat paytida ularni birga takrorlashni unutmang.",
    icon: "menu_book",
    tone: "secondary" as const,
  },
];

export const mockChildren: ChildProfile[] = [
  {
    id: "child-temur",
    name: "Temur",
    age: 11,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmJW3IRYZuvUZhjCZjRimk2M7CVtVdVS3Gh3HLkPZSgjjvstW6BMyouXu52fxHzY9pC24jzMetI3fNwtfDPB8vZXb9LMOx-ct6VPrH7n-iqjv-HDDoJCIOuMTB2xCecX7oJqm3WWJMwGuy6f-cFxNYTGxbAEH8_m4pNHG30iMPFZqED4J3gT6WKK1xzheYrpxcBGvfSDAl5aWNTAO21soSlV4jREo5dPFbW87oIxicPknF0WWSZhOq2fZH7AcSkA7-4FYJj4vqDeA",
    status: "Faol",
    progressPercent: 80,
    todayMinutes: 45,
    todayXp: 120,
    weeklyXp: 840,
    streakDays: 5,
    interests: [
      { label: "Ingliz tili", percent: 40, color: "#4f46e5" },
      { label: "Buyuk siymolar", percent: 35, color: "#fd761a" },
      { label: "Mantiq", percent: 25, color: "#4ae176" },
    ],
    language: "uz",
  },
  {
    id: "child-laylo",
    name: "Laylo",
    age: 8,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIa8Ty_fTb0IzdKbyOJf-QNcQxD2H0zo74UkiFDxFhA401b9WR5pocKcjRP5ILBcoLmnLxwh4vgfrP2xR4d41g7A3bm0rc-PHq8GgevAt8XduTBea5Qvvy8qIJXw1PbcWKaUgvItMd7pAXpyPj7YAWcHVcXXnSUwsRy-X4CRy2V6EqElGLjJoY9uw9Lb7Q9A-mOylAhZjek-mXE_ClR8D_A0IXqyjVywczJeXXx8hLaDY14J_WH6sqlRgCO0iESToeKZUUnIP8HSY",
    status: "Faol",
    progressPercent: 65,
    todayMinutes: 32,
    todayXp: 85,
    weeklyXp: 620,
    streakDays: 12,
    interests: [
      { label: "Ingliz tili", percent: 85, color: "#fd761a" },
      { label: "San'at", percent: 70, color: "#005523" },
    ],
    language: "uz",
  },
];

const childDetailsExtra: Record<string, Omit<ChildDetail, keyof ChildProfile>> = {
  "child-temur": {
    fullName: "Temur Vaxidov",
    todayXpDelta: "Kecha bilan solishtirganda +15% yuqori.",
    aiSummary:
      "Farzandingiz mantiqiy o'yinlarni juda yaxshi ko'radi va strategik fikrlashda yuqori natija ko'rsatmoqda. Uni rivojlantirish uchun bularni sinab ko'ring:",
    aiRecommendations: [
      { title: "Matematik labirintlar", body: "Qiyin darajadagi mantiqiy masalalar to'plami.", icon: "extension" },
      { title: "Ibn Sino bilan muloqot", body: "Tibbiyot va mantiq bo'yicha interaktiv dars.", icon: "history_edu" },
    ],
    weeklyActivity: [
      { label: "Du", height: 40 },
      { label: "Se", height: 65 },
      { label: "Ch", height: 45 },
      { label: "Pa", height: 90, highlight: true },
      { label: "Ju", height: 55 },
      { label: "Sha", height: 30 },
      { label: "Yak", height: 40 },
    ],
    recentSessions: [
      { id: "s1", title: "Suhbat: Abu Rayhon Beruniy bilan", time: "Bugun, 14:20", duration: "25 daqiqa", xp: 45, icon: "forum", tone: "tertiary" },
      { id: "s2", title: "Ingliz tili: Grammatika #4", time: "Bugun, 10:05", duration: "15 daqiqa", xp: 30, icon: "translate", tone: "primary" },
      { id: "s3", title: "Mantiqiy topshiriqlar", time: "Kecha, 18:30", duration: "40 daqiqa", xp: 65, icon: "calculate", tone: "secondary" },
      { id: "s4", title: "Mustaqil mutolaa: Astronomiya", time: "2 kun oldin", duration: "12 daqiqa", xp: 15, icon: "menu_book", tone: "neutral" },
    ],
  },
  "child-laylo": {
    fullName: "Laylo Karimova",
    todayXpDelta: "Kecha bilan solishtirganda +8% yuqori.",
    aiSummary:
      "Laylo til o'rganishda tez rivojlanmoqda. Uning qiziqishini saqlab qolish uchun interaktiv mashg'ulotlarni davom ettiring:",
    aiRecommendations: [
      { title: "So'z o'yini", body: "Yangi o'rganilgan 20 ta so'zni mustahkamlash.", icon: "spellcheck" },
      { title: "Rasm chizish", body: "Ijodiy mashg'ulotlar orqali ingliz tilini mustahkamlash.", icon: "brush" },
    ],
    weeklyActivity: [
      { label: "Du", height: 55 },
      { label: "Se", height: 70 },
      { label: "Ch", height: 60 },
      { label: "Pa", height: 75 },
      { label: "Ju", height: 50 },
      { label: "Sha", height: 35 },
      { label: "Yak", height: 25 },
    ],
    recentSessions: [
      { id: "l1", title: "Ingliz tili: Yangi so'zlar", time: "Bugun, 11:00", duration: "20 daqiqa", xp: 35, icon: "translate", tone: "primary" },
      { id: "l2", title: "Rasm chizish mashg'uloti", time: "Kecha, 16:00", duration: "18 daqiqa", xp: 25, icon: "brush", tone: "secondary" },
    ],
  },
};

export function getMockChildDetail(id: string): ChildDetail | null {
  const base = mockChildren.find((c) => c.id === id);
  const extra = childDetailsExtra[id];
  if (!base) return null;
  return { ...base, ...extra };
}

export const mockSubscription: SubscriptionData = {
  currentPlan: "family",
  nextBillingDate: "15-Iyun, 2026",
  monthlyPrice: 150_000,
  profileLimit: { used: 2, total: 3 },
  aiReports: "Cheksiz",
  plans: [
    {
      id: "free",
      name: "Bepul",
      description: "Asosiy imkoniyatlar",
      price: 0,
      priceLabel: "0 so'm",
      features: ["1 nafar farzand profili", "Cheklangan AI tahlili"],
    },
    {
      id: "family",
      name: "Oila",
      description: "Kengaytirilgan tahlil",
      price: 150_000,
      priceLabel: "150,000 so'm",
      features: ["3 nafargacha farzand", "To'liq AI tahlili", "Prioritetli yordam"],
      highlighted: true,
      current: true,
    },
    {
      id: "premium_plus",
      name: "Premium+",
      description: "Cheksiz imkoniyatlar",
      price: 350_000,
      priceLabel: "350,000 so'm",
      features: ["Cheksiz farzand profili", "Shaxsiy o'quv yo'li", "Oylik qog'oz hisobotlar"],
    },
  ],
  paymentMethods: [
    { id: "card-1", brand: "Uzcard", last4: "4582", holder: "Alisher Karimov", expiry: "08/26", isPrimary: true },
  ],
  transactions: [
    { id: "t1", date: "15 May, 2026", amount: 150_000, status: "success", invoice: "#INV-88241" },
    { id: "t2", date: "15 Aprel, 2026", amount: 150_000, status: "success", invoice: "#INV-87102" },
    { id: "t3", date: "15 Mart, 2026", amount: 150_000, status: "success", invoice: "#INV-86591" },
  ],
};
