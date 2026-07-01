/**

 * Ota-ona paneli ma'lumot qatlami — mock yoki real API orqali.

 */

import { fetchJson } from "@/lib/api/fetchJson";

import { USE_MOCK } from "@/lib/mockData";

import { PLANS, type PlanId } from "@/lib/payments/plans";

import type { ChildDetail, ChildProfile, DashboardSummary, SubscriptionData } from "@/lib/parent/types";



export type { ChildInterest, ChildProfile, DashboardSummary, ChildDetail, SubscriptionData } from "@/lib/parent/types";



type SessionChild = { id: string; name: string; age: number; language: string };



type ChildProgressApi = {

  xp: number;

  streakDays: number;

  level: number;

};



function fallbackProfile(c: SessionChild, index: number): ChildProfile {

  return {

    id: c.id,

    name: c.name,

    age: c.age,

    avatarUrl: "",

    status: "Faol",

    progressPercent: 40 + (index % 4) * 10,

    todayMinutes: 15 + index * 5,

    todayXp: 0,

    weeklyXp: 0,

    streakDays: 0,

    interests: [],

    language: c.language,

  };

}



async function enrichProfiles(base: SessionChild[]): Promise<ChildProfile[]> {

  return Promise.all(

    base.map(async (c, i) => {

      try {

        const progress = await fetchJson<ChildProgressApi>(

          `/api/child/progress?childId=${encodeURIComponent(c.id)}`

        );

        return {

          id: c.id,

          name: c.name,

          age: c.age,

          avatarUrl: "",

          status: "Faol",

          progressPercent: Math.min(100, Math.round((progress.xp % 300) / 3)),

          todayMinutes: Math.min(120, Math.round(progress.xp / 25)),

          todayXp: progress.xp % 100,

          weeklyXp: progress.xp,

          streakDays: progress.streakDays,

          interests: [],

          language: c.language,

        };

      } catch {

        return fallbackProfile(c, i);

      }

    })

  );

}



export async function getChildren(): Promise<ChildProfile[]> {

  if (USE_MOCK) {

    const { mockChildren } = await import("@/lib/mockData");

    return mockChildren;

  }

  try {

    const base = await fetchJson<SessionChild[]>("/api/parent/children");

    return enrichProfiles(base);

  } catch {

    return [];

  }

}



export async function getChildById(id: string): Promise<ChildDetail | null> {

  if (USE_MOCK) {

    const { getMockChildDetail } = await import("@/lib/mockData");

    return getMockChildDetail(id);

  }



  try {

    const base = await fetchJson<SessionChild[]>("/api/parent/children");

    const sessionChild = base.find((c) => c.id === id);

    if (!sessionChild) return null;



    const insights = await fetchChildInsights(id);

    let progress: ChildProgressApi | null = null;

    try {

      progress = await fetchJson<ChildProgressApi>(

        `/api/child/progress?childId=${encodeURIComponent(id)}`

      );

    } catch {

      progress = null;

    }



    return {

      id: sessionChild.id,

      name: sessionChild.name,

      age: sessionChild.age,

      avatarUrl: "",

      status: "Faol o'rganmoqda",

      progressPercent: insights

        ? Math.min(100, Math.round((insights.report.activity.activeDays / 7) * 100))

        : progress

          ? Math.min(100, Math.round((progress.xp % 300) / 3))

          : 50,

      todayMinutes: progress ? Math.min(120, Math.round(progress.xp / 25)) : 0,

      todayXp: progress?.xp ?? 0,

      weeklyXp: progress?.xp ?? 0,

      streakDays: progress?.streakDays ?? insights?.report.activity.activeDays ?? 0,

      interests:

        insights?.report.interests.map((item, i) => ({

          label: item.topic,

          percent: Math.max(20, 100 - i * 25),

          color: ["#4f46e5", "#fd761a", "#4ae176"][i % 3],

        })) ?? [],

      language: sessionChild.language,

      fullName: sessionChild.name,

      todayXpDelta: insights?.report.summary.slice(0, 80),

      aiSummary: insights?.report.summary,

      aiRecommendations: insights?.report.recommendations.slice(0, 2).map((rec, i) => ({

        title: i === 0 ? "AI tavsiya" : "Qo'shimcha",

        body: rec,

        icon: i === 0 ? "lightbulb" : "menu_book",

      })),

      weeklyActivity: [

        { label: "Du", height: 40 },

        { label: "Se", height: 65 },

        { label: "Ch", height: 45 },

        { label: "Pa", height: 90, highlight: true },

        { label: "Ju", height: 55 },

        { label: "Sha", height: 30 },

        { label: "Yak", height: 40 },

      ],

      recentSessions: [],

    };

  } catch {

    return null;

  }

}



export async function getDashboardSummary(): Promise<DashboardSummary | null> {

  if (USE_MOCK) {

    const { mockDashboardSummary } = await import("@/lib/mockData");

    return mockDashboardSummary;

  }

  return null;

}



export async function getSubscription(): Promise<SubscriptionData | null> {

  if (USE_MOCK) {

    const { mockSubscription } = await import("@/lib/mockData");

    return mockSubscription;

  }



  try {

    const [settings, children] = await Promise.all([

      fetchJson<{

        subscriptionPlan: string;

        subscriptionActive: boolean;

        subscriptionExpiresAt: string | null;

      }>("/api/parent/settings"),

      fetchJson<SessionChild[]>("/api/parent/children"),

    ]);



    const planId = (settings.subscriptionPlan as PlanId) ?? "free";
    const planDef = PLANS[planId] ?? PLANS.free;

    const plans = (["free", "standard", "family"] as PlanId[]).map((id) => {
      const p = PLANS[id];
      return {
        id: id as SubscriptionData["currentPlan"],
        name: p.nameUz,
        description: p.priceLabel,
        price: p.priceUzs,
        priceLabel: p.priceLabel,
        features: [
          `${p.maxChildren} bola profili`,
          p.dailyChatLimit ? `Kunlik ${p.dailyChatLimit} xabar` : "Cheksiz suhbat",
          p.weeklyReport ? "Haftalik hisobot" : "Asosiy funksiyalar",
        ],
        current: id === planId,
        highlighted: id === "family",
      };
    });

    return {
      currentPlan: planId as SubscriptionData["currentPlan"],

      nextBillingDate: settings.subscriptionExpiresAt?.slice(0, 10) ?? "—",

      monthlyPrice: planDef.priceUzs,

      profileLimit: { used: children.length, total: planDef.maxChildren },

      aiReports: settings.subscriptionActive && planDef.weeklyReport ? "Cheksiz" : "Cheklangan",

      plans,

      paymentMethods: [],

      transactions: [],

    };

  } catch {

    return null;

  }

}



/** Real API: /api/parent/insights — ParentProvider bilan birga ishlatiladi */

export async function fetchChildInsights(childId: string, days = 7) {

  const res = await fetch(`/api/parent/insights?childId=${childId}&days=${days}`);

  const json = await res.json();

  if (json.code === "PIN_REQUIRED") {

    window.location.href = "/pin";

    return null;

  }

  if (!json.success) return null;

  return json.data as {

    report: {

      summary: string;

      recommendations: string[];

      interests: Array<{ topic: string; evidence: string }>;

      activity: { activeDays: number; totalMessages: number };

    };

    moodChart: Array<{ date: string; score: number }>;

  };

}

