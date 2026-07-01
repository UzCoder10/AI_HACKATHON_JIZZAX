import type {
  ActivityLogEntry,
  AdminUser,
  AiAlert,
  AiConversationSummary,
  ChildAccount,
  ContentItem,
  DashboardMetrics,
  FigurePersona,
  GrowthPoint,
  ParentAccount,
  PlanConfig,
  RecentSignup,
  Transaction,
} from "@/lib/admin/types";

export const CURRENT_ADMIN: AdminUser = {
  id: "admin-001",
  name: "Dilnoza Karimova",
  email: "dilnoza@nihol.uz",
  role: "super-admin",
  lastLogin: "2026-07-01T09:15:00",
};

export const ADMIN_TEAM: AdminUser[] = [
  CURRENT_ADMIN,
  { id: "admin-002", name: "Jasur Rahimov", email: "jasur@nihol.uz", role: "content-manager", lastLogin: "2026-06-30T18:40:00" },
  { id: "admin-003", name: "Malika Tosheva", email: "malika@nihol.uz", role: "moderator", lastLogin: "2026-07-01T08:02:00" },
];

export const dashboardMetrics: DashboardMetrics = {
  totalParents: 2847,
  totalChildren: 4123,
  activeUsersToday: 1864,
  conversationsToday: 9342,
  revenueMonth: 48750000,
  revenueGrowth: 18.4,
  userGrowth: 12.3,
  activityGrowth: 8.7,
  aiApiStatus: "online",
  aiApiLatencyMs: 142,
};

export const growthData: GrowthPoint[] = [
  { date: "24-iyun", users: 1680, activity: 7200 },
  { date: "25-iyun", users: 1720, activity: 7450 },
  { date: "26-iyun", users: 1755, activity: 7680 },
  { date: "27-iyun", users: 1790, activity: 8100 },
  { date: "28-iyun", users: 1810, activity: 8350 },
  { date: "29-iyun", users: 1835, activity: 8620 },
  { date: "30-iyun", users: 1850, activity: 9100 },
  { date: "1-iyul", users: 1864, activity: 9342 },
];

export const recentSignups: RecentSignup[] = [
  { id: "p-2847", name: "Nodira Yusupova", type: "parent", plan: "family", registeredAt: "2026-07-01T08:52:00" },
  { id: "p-2846", name: "Bobur Ismoilov", type: "parent", plan: "premium-plus", registeredAt: "2026-07-01T08:31:00" },
  { id: "c-4123", name: "Sevara", type: "child", registeredAt: "2026-07-01T08:28:00" },
  { id: "p-2845", name: "Gulnoza Ergasheva", type: "parent", plan: "free", registeredAt: "2026-07-01T07:45:00" },
  { id: "p-2844", name: "Aziz Tursunov", type: "parent", plan: "family", registeredAt: "2026-07-01T07:12:00" },
];

export const activityLog: ActivityLogEntry[] = [
  { id: "a1", type: "alert", title: "AI xavfsizlik ogohlantirishi", description: "Bola #C-0892 suhbatida noaniq tibbiy maslahat aniqlandi — moderator tekshiruvi kerak.", time: "09:41:22", ago: "3 daqiqa oldin" },
  { id: "a2", type: "signup", title: "Yangi ota-ona ro'yxatdan o'tdi", description: "Nodira Yusupova — Family tarif, Toshkent.", time: "08:52:10", ago: "52 daqiqa oldin" },
  { id: "a3", type: "payment", title: "To'lov muvaffaqiyatli", description: "Bobur Ismoilov — Premium+ obuna (299 000 so'm).", time: "08:31:45", ago: "1 soat oldin" },
  { id: "a4", type: "content", title: "Kontent yangilandi", description: "Jasur Rahimov — \"Ingliz tili: Hayvonlar\" darsi faollashtirildi.", time: "07:55:00", ago: "1 soat 50 daqiqa oldin" },
  { id: "a5", type: "system", title: "AI API holati", description: "Barcha xizmatlar normal — o'rtacha javob vaqti 142ms.", time: "07:00:00", ago: "2 soat 45 daqiqa oldin" },
];

export const parentAccounts: ParentAccount[] = [
  { id: "p-001", name: "Dilshod Mirzayev", phone: "+998 90 123 45 67", email: "dilshod.m@mail.uz", childrenCount: 2, plan: "premium-plus", registeredAt: "2025-11-12", status: "active", lastActive: "2026-07-01T09:10:00", city: "Toshkent" },
  { id: "p-002", name: "Zuhra Abdullayeva", phone: "+998 91 234 56 78", email: "zuhra.a@gmail.com", childrenCount: 1, plan: "family", registeredAt: "2026-01-08", status: "active", lastActive: "2026-07-01T08:45:00", city: "Samarqand" },
  { id: "p-003", name: "Rustam Qo'chqorov", phone: "+998 93 345 67 89", email: "rustam.q@mail.uz", childrenCount: 3, plan: "family", registeredAt: "2026-02-20", status: "active", lastActive: "2026-06-30T22:30:00", city: "Buxoro" },
  { id: "p-004", name: "Madina Karimova", phone: "+998 94 456 78 90", email: "madina.k@yandex.uz", childrenCount: 1, plan: "free", registeredAt: "2026-03-15", status: "active", lastActive: "2026-06-29T14:20:00", city: "Andijon" },
  { id: "p-005", name: "Sherzod Nazarov", phone: "+998 95 567 89 01", email: "sherzod.n@mail.uz", childrenCount: 2, plan: "premium-plus", registeredAt: "2026-04-02", status: "blocked", lastActive: "2026-06-15T11:00:00", city: "Farg'ona" },
  { id: "p-006", name: "Kamola Raximova", phone: "+998 97 678 90 12", email: "kamola.r@gmail.com", childrenCount: 1, plan: "family", registeredAt: "2026-04-18", status: "active", lastActive: "2026-07-01T07:30:00", city: "Namangan" },
  { id: "p-007", name: "Otabek Sultonov", phone: "+998 98 789 01 23", email: "otabek.s@mail.uz", childrenCount: 2, plan: "free", registeredAt: "2026-05-05", status: "pending", lastActive: "2026-06-28T16:00:00", city: "Qarshi" },
  { id: "p-008", name: "Nilufar Usmonova", phone: "+998 99 890 12 34", email: "nilufar.u@mail.uz", childrenCount: 1, plan: "family", registeredAt: "2026-05-22", status: "active", lastActive: "2026-06-30T20:15:00", city: "Toshkent" },
];

export const childAccounts: ChildAccount[] = [
  { id: "c-001", name: "Jasur", age: 11, parentId: "p-001", parentName: "Dilshod Mirzayev", xp: 1250, streakDays: 5, lastSession: "2026-07-01T09:05:00", status: "active", interests: ["astronomiya", "ingliz tili"] },
  { id: "c-002", name: "Diyora", age: 12, parentId: "p-001", parentName: "Dilshod Mirzayev", xp: 980, streakDays: 3, lastSession: "2026-06-30T19:40:00", status: "active", interests: ["adabiyot", "Beruniy"] },
  { id: "c-003", name: "Sardor", age: 11, parentId: "p-002", parentName: "Zuhra Abdullayeva", xp: 720, streakDays: 7, lastSession: "2026-07-01T08:40:00", status: "active", interests: ["matematika", "Ibn Sino"] },
  { id: "c-004", name: "Mohira", age: 12, parentId: "p-003", parentName: "Rustam Qo'chqorov", xp: 1540, streakDays: 12, lastSession: "2026-06-30T21:00:00", status: "active", interests: ["ingliz tili", "Navoiy"] },
  { id: "c-005", name: "Azizbek", age: 11, parentId: "p-005", parentName: "Sherzod Nazarov", xp: 340, streakDays: 0, lastSession: "2026-06-10T10:00:00", status: "blocked", interests: ["o'yinlar"] },
  { id: "c-006", name: "Sevara", age: 12, parentId: "p-008", parentName: "Nilufar Usmonova", xp: 890, streakDays: 4, lastSession: "2026-07-01T08:20:00", status: "active", interests: ["psixologik test", "Ulug'bek"] },
];

export const contentItems: ContentItem[] = [
  { id: "l-001", title: "Ingliz tili: Salomlashish", type: "lesson", subject: "Ingliz tili", status: "active", updatedAt: "2026-06-28", author: "Jasur Rahimov" },
  { id: "l-002", title: "Ingliz tili: Hayvonlar", type: "lesson", subject: "Ingliz tili", status: "active", updatedAt: "2026-07-01", author: "Jasur Rahimov" },
  { id: "l-003", title: "Ingliz tili: Ranglar", type: "lesson", subject: "Ingliz tili", status: "active", updatedAt: "2026-07-01", author: "Jasur Rahimov" },
  { id: "f-001", title: "Abu Rayhon Beruniy", type: "figure", subject: "Buyuk Siymolar", status: "active", updatedAt: "2026-06-20", author: "Malika Tosheva" },
  { id: "f-002", title: "Ibn Sino", type: "figure", subject: "Buyuk Siymolar", status: "active", updatedAt: "2026-06-18", author: "Malika Tosheva" },
  { id: "f-003", title: "Mirzo Ulug'bek", type: "figure", subject: "Buyuk Siymolar", status: "active", updatedAt: "2026-06-15", author: "Malika Tosheva" },
  { id: "t-001", title: "Qiziqish testi: Fanlar", type: "test", subject: "Psixologik", status: "active", updatedAt: "2026-05-30", author: "Dilnoza Karimova" },
  { id: "t-002", title: "Kayfiyat kundaligi", type: "test", subject: "Psixologik", status: "active", updatedAt: "2026-06-01", author: "Dilnoza Karimova" },
  { id: "g-001", title: "So'z topish o'yini", type: "game", subject: "Ingliz tili", status: "draft", updatedAt: "2026-06-22", author: "Jasur Rahimov" },
];

export const figurePersonas: FigurePersona[] = [
  {
    id: "fp-001",
    slug: "abu-rayhon-beruniy",
    name: "Abu Rayhon Beruniy",
    field: "Ilm, geografiya va astronomiya",
    description: "Yer shakli, masofalar o'lchash va ilmiy uslub haqida faktlar bilan suhbat.",
    promptPreview: "Sen Abu Rayhon Beruniy — olim, geograf va astronomsan. Yer shakli va ilmiy kashfiyotlar haqida sodda tushuntirasan.",
    status: "active",
    chatCount: 12480,
  },
  {
    id: "fp-002",
    slug: "ibn-sino",
    name: "Ibn Sino",
    field: "Tibbiyot va falsafa",
    description: "Tibbiy tarix va ilmiy meros haqida ta'limiy suhbat (tibbiy maslahat bermaydi).",
    promptPreview: "Sen Ibn Sino — tibbiyot va falsafa ulamisan. Tibbiy tashxis yoki davolash tavsiya qilmaysan.",
    status: "active",
    chatCount: 9870,
  },
  {
    id: "fp-003",
    slug: "mirzo-ulugbek",
    name: "Mirzo Ulug'bek",
    field: "Astronomiya va matematika",
    description: "Yulduzlar, sayyoralar va Samarqand rasadxonasi haqida suhbat.",
    promptPreview: "Sen Mirzo Ulug'bek — buyuk astronom va rasadxonasi asoschisisan.",
    status: "active",
    chatCount: 11230,
  },
  {
    id: "fp-004",
    slug: "alisher-navoiy",
    name: "Alisher Navoiy",
    field: "Adabiyot va madaniyat",
    description: "She'riyat, til va adabiyot haqida ta'limiy suhbat.",
    promptPreview: "Sen Alisher Navoiy — buyuk shoir va mutafakkirsan.",
    status: "draft",
    chatCount: 0,
  },
];

export const aiConversations: AiConversationSummary[] = [
  { id: "conv-001", childId: "c-001", childName: "Jasur", figureName: "Beruniy", startedAt: "2026-07-01T09:00:00", messageCount: 24, flagged: false, severity: null, reason: null },
  { id: "conv-002", childId: "c-003", childName: "Sardor", figureName: "Ibn Sino", startedAt: "2026-07-01T08:35:00", messageCount: 18, flagged: true, severity: "high", reason: "Tibbiy maslahat so'rovi aniqlandi" },
  { id: "conv-003", childId: "c-004", childName: "Mohira", figureName: "Navoiy", startedAt: "2026-06-30T20:50:00", messageCount: 31, flagged: false, severity: null, reason: null },
  { id: "conv-004", childId: "c-006", childName: "Sevara", figureName: "Ulug'bek", startedAt: "2026-07-01T08:15:00", messageCount: 12, flagged: true, severity: "medium", reason: "Shaxsiy ma'lumot so'rovi" },
  { id: "conv-005", childId: "c-002", childName: "Diyora", figureName: "Beruniy", startedAt: "2026-06-30T18:00:00", messageCount: 45, flagged: false, severity: null, reason: null },
];

export const aiAlerts: AiAlert[] = [
  { id: "alert-001", conversationId: "conv-002", childName: "Sardor", severity: "high", reason: "AI tibbiy maslahat berishga yaqin javob berdi — bloklandi va qayta ishlandi", createdAt: "2026-07-01T08:42:00", reviewed: false },
  { id: "alert-002", conversationId: "conv-004", childName: "Sevara", severity: "medium", reason: "Bola manzilini so'radi — xavfsizlik qoidasi ishga tushdi", createdAt: "2026-07-01T08:18:00", reviewed: true },
  { id: "alert-003", conversationId: "conv-006", childName: "Azizbek", severity: "critical", reason: "Zo'ravonlik mavzusi — darhol moderator tekshiruvi", createdAt: "2026-06-28T15:30:00", reviewed: true },
];

export const aiStats = {
  totalConversationsToday: 9342,
  flaggedToday: 23,
  blockedResponses: 7,
  avgMessagesPerSession: 18.4,
  safetyScore: 98.7,
  topFigures: [
    { name: "Beruniy", count: 2840 },
    { name: "Ibn Sino", count: 2210 },
    { name: "Ulug'bek", count: 1980 },
    { name: "Navoiy", count: 1540 },
  ],
};

export const planConfigs: PlanConfig[] = [
  { id: "free", name: "Free", price: 0, currency: "UZS", activeUsers: 1240, features: ["1 bola", "Kunlik 15 daqiqa", "Asosiy darslar"] },
  { id: "family", name: "Family", price: 149000, currency: "UZS", activeUsers: 1180, features: ["3 tagacha bola", "Kunlik 45 daqiqa", "Barcha mentorlar", "Ota-ona paneli"] },
  { id: "premium-plus", name: "Premium+", price: 299000, currency: "UZS", activeUsers: 427, features: ["Cheksiz bola", "Cheksiz vaqt", "Barcha kontent", "Prioritet qo'llab-quvvatlash"] },
];

export const transactions: Transaction[] = [
  { id: "tx-001", parentName: "Bobur Ismoilov", plan: "premium-plus", amount: 299000, currency: "UZS", status: "success", date: "2026-07-01T08:31:00", provider: "Payme" },
  { id: "tx-002", parentName: "Nodira Yusupova", plan: "family", amount: 149000, currency: "UZS", status: "success", date: "2026-07-01T08:52:00", provider: "Click" },
  { id: "tx-003", parentName: "Sherzod Nazarov", plan: "premium-plus", amount: 299000, currency: "UZS", status: "failed", date: "2026-06-30T14:20:00", provider: "Payme" },
  { id: "tx-004", parentName: "Kamola Raximova", plan: "family", amount: 149000, currency: "UZS", status: "success", date: "2026-06-30T10:15:00", provider: "Click" },
  { id: "tx-005", parentName: "Otabek Sultonov", plan: "family", amount: 149000, currency: "UZS", status: "pending", date: "2026-06-29T16:45:00", provider: "Payme" },
  { id: "tx-006", parentName: "Dilshod Mirzayev", plan: "premium-plus", amount: 299000, currency: "UZS", status: "refunded", date: "2026-06-28T09:00:00", provider: "Click" },
];

export const paymentIssues = [
  { id: "pi-001", parent: "Sherzod Nazarov", issue: "Karta rad etildi", amount: 299000, date: "2026-06-30" },
  { id: "pi-002", parent: "Otabek Sultonov", issue: "To'lov kutilmoqda", amount: 149000, date: "2026-06-29" },
];

export function getParentById(id: string): ParentAccount | undefined {
  return parentAccounts.find((p) => p.id === id);
}

export function getChildrenByParentId(parentId: string): ChildAccount[] {
  return childAccounts.filter((c) => c.parentId === parentId);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  family: "Family",
  "premium-plus": "Premium+",
};
