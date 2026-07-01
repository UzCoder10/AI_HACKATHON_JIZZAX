import { prisma } from "@/lib/db/client";
import { buildChildProgress } from "@/lib/child/childProgressService";
import type {
  ActivityLogEntry,
  AiAlert,
  AiConversationSummary,
  ChildAccount,
  DashboardMetrics,
  GrowthPoint,
  ParentAccount,
  PlanConfig,
  RecentSignup,
  Transaction,
  FigurePersona,
} from "@/lib/admin/types";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(iso: Date | string): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toISOString().slice(0, 10);
}

function formatAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

function mapPlan(plan: string | undefined): ParentAccount["plan"] {
  if (plan === "family") return "family";
  if (plan === "premium_plus" || plan === "premium-plus") return "premium-plus";
  return "free";
}

function mapSeverity(sev: string): AiAlert["severity"] {
  const lower = sev.toLowerCase();
  if (lower === "low" || lower === "medium" || lower === "high" || lower === "critical") {
    return lower;
  }
  return "medium";
}

export async function getAdminOverview() {
  const today = startOfToday();
  const monthStart = startOfMonth();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalParents,
    totalChildren,
    conversationsToday,
    activeChildIdsToday,
    revenueAgg,
    parentsLastWeek,
    parentsThisWeek,
    recentParents,
    recentChildren,
    recentSafety,
    recentPayments,
  ] = await Promise.all([
    prisma.parent.count(),
    prisma.child.count(),
    prisma.conversation.count({ where: { createdAt: { gte: today } } }),
    prisma.conversation.findMany({
      where: { updatedAt: { gte: today } },
      select: { childId: true },
      distinct: ["childId"],
    }),
    prisma.paymentTransaction.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.parent.count({ where: { createdAt: { lt: today, gte: weekAgo } } }),
    prisma.parent.count({ where: { createdAt: { gte: today } } }),
    prisma.parent.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { settings: true },
    }),
    prisma.child.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.safetyEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.paymentTransaction.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
  ]);

  const userGrowth =
    parentsLastWeek > 0
      ? Math.round(((parentsThisWeek / Math.max(parentsLastWeek, 1)) * 100) * 10) / 10
      : parentsThisWeek > 0
        ? 100
        : 0;

  const metrics: DashboardMetrics = {
    totalParents,
    totalChildren,
    activeUsersToday: activeChildIdsToday.length,
    conversationsToday,
    revenueMonth: revenueAgg._sum.amount ?? 0,
    revenueGrowth: 0,
    userGrowth,
    activityGrowth: 0,
    aiApiStatus: "online",
    aiApiLatencyMs: 0,
  };

  const growth: GrowthPoint[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [users, activity] = await Promise.all([
      prisma.parent.count({ where: { createdAt: { lt: dayEnd } } }),
      prisma.conversation.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      }),
    ]);

    growth.push({
      date: dayStart.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" }),
      users,
      activity,
    });
  }

  const signups: RecentSignup[] = [
    ...recentParents.map((p) => ({
      id: p.id,
      name: p.name ?? p.email.split("@")[0],
      type: "parent" as const,
      plan: mapPlan(p.settings?.subscriptionPlan),
      registeredAt: p.createdAt.toISOString(),
    })),
    ...recentChildren.map((c) => ({
      id: c.id,
      name: c.name,
      type: "child" as const,
      registeredAt: c.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, 5);

  const activityLog: ActivityLogEntry[] = [];

  for (const event of recentSafety) {
    activityLog.push({
      id: event.id,
      type: "alert",
      title: "AI xavfsizlik ogohlantirishi",
      description: event.summary,
      time: event.createdAt.toISOString().slice(11, 19),
      ago: formatAgo(event.createdAt),
    });
  }

  for (const p of recentParents.slice(0, 2)) {
    activityLog.push({
      id: `signup-${p.id}`,
      type: "signup",
      title: "Yangi ota-ona ro'yxatdan o'tdi",
      description: `${p.name ?? p.email} — ${mapPlan(p.settings?.subscriptionPlan)} tarif.`,
      time: p.createdAt.toISOString().slice(11, 19),
      ago: formatAgo(p.createdAt),
    });
  }

  if (recentPayments.length > 0) {
    const tx = recentPayments[0];
    activityLog.push({
      id: tx.id,
      type: "payment",
      title: "To'lov muvaffaqiyatli",
      description: `${tx.plan} obuna (${tx.amount.toLocaleString("uz-UZ")} so'm).`,
      time: tx.createdAt.toISOString().slice(11, 19),
      ago: formatAgo(tx.createdAt),
    });
  }

  activityLog.push({
    id: "system-status",
    type: "system",
    title: "Tizim holati",
    description: "Ma'lumotlar bazasi va API xizmatlari faol.",
    time: new Date().toISOString().slice(11, 19),
    ago: "Hozir",
  });

  return { metrics, growth, signups, activityLog: activityLog.slice(0, 6) };
}

export async function getAdminUsers(): Promise<ParentAccount[]> {
  const parents = await prisma.parent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      children: { select: { id: true } },
      settings: true,
    },
  });

  return parents.map((p) => ({
    id: p.id,
    name: p.name ?? p.email.split("@")[0],
    phone: "—",
    email: p.email,
    childrenCount: p.children.length,
    plan: mapPlan(p.settings?.subscriptionPlan),
    registeredAt: formatDate(p.createdAt),
    status: "active",
    lastActive: p.updatedAt.toISOString(),
    city: "—",
  }));
}

export async function getAdminChildren(): Promise<ChildAccount[]> {
  const children = await prisma.child.findMany({
    orderBy: { createdAt: "desc" },
    include: { parent: { select: { id: true, name: true, email: true } } },
  });

  const rows = await Promise.all(
    children.map(async (c) => {
      const progress = await buildChildProgress(c.id);
      return {
        id: c.id,
        name: c.name,
        age: c.age,
        parentId: c.parentId,
        parentName: c.parent.name ?? c.parent.email.split("@")[0],
        xp: progress?.xp ?? 0,
        streakDays: progress?.streakDays ?? 0,
        lastSession: formatDate(c.updatedAt),
        status: "active" as const,
        interests: [] as string[],
      };
    })
  );

  return rows;
}

export async function getAdminAiMonitoring() {
  const today = startOfToday();

  const [
    totalConversationsToday,
    flaggedToday,
    blockedResponses,
    recentConversations,
    recentAlerts,
    figureGroups,
  ] = await Promise.all([
    prisma.conversation.count({ where: { createdAt: { gte: today } } }),
    prisma.safetyEvent.count({ where: { createdAt: { gte: today } } }),
    prisma.message.count({ where: { filtered: true, createdAt: { gte: today } } }),
    prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        figure: { select: { name: true } },
        messages: { select: { id: true } },
      },
    }),
    prisma.safetyEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.conversation.groupBy({
      by: ["figureId"],
      _count: { id: true },
      where: { figureId: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 4,
    }),
  ]);

  const figureIds = figureGroups.map((g) => g.figureId).filter(Boolean) as string[];
  const figures =
    figureIds.length > 0
      ? await prisma.greatFigure.findMany({
          where: { id: { in: figureIds } },
          select: { id: true, name: true },
        })
      : [];
  const figureNameById = new Map(figures.map((f) => [f.id, f.name]));

  const childIds = [...new Set(recentConversations.map((c) => c.childId))];
  const childRows =
    childIds.length > 0
      ? await prisma.child.findMany({
          where: { id: { in: childIds } },
          select: { id: true, name: true },
        })
      : [];
  const childNameById = new Map(childRows.map((c) => [c.id, c.name]));

  const alertChildIds = recentAlerts.map((a) => a.childId).filter(Boolean) as string[];
  const alertChildren =
    alertChildIds.length > 0
      ? await prisma.child.findMany({
          where: { id: { in: alertChildIds } },
          select: { id: true, name: true },
        })
      : [];
  const alertChildNameById = new Map(alertChildren.map((c) => [c.id, c.name]));

  const conversations: AiConversationSummary[] = recentConversations.map((conv) => {
    const flagged = recentAlerts.some(
      (a) => a.sessionId === conv.id || a.childId === conv.childId
    );
    const alert = recentAlerts.find((a) => a.sessionId === conv.id);
    return {
      id: conv.id,
      childId: conv.childId,
      childName: conv.childName ?? childNameById.get(conv.childId) ?? "Bola",
      figureName: conv.figure?.name ?? "AI",
      startedAt: conv.createdAt.toISOString(),
      messageCount: conv.messages.length,
      flagged,
      severity: alert ? mapSeverity(alert.severity) : null,
      reason: alert?.summary ?? null,
    };
  });

  const alerts: AiAlert[] = recentAlerts.map((a) => ({
    id: a.id,
    conversationId: a.sessionId ?? "",
    childName: a.childId ? (alertChildNameById.get(a.childId) ?? "Bola") : "Noma'lum",
    severity: mapSeverity(a.severity),
    reason: a.summary,
    createdAt: a.createdAt.toISOString(),
    reviewed: false,
  }));

  const safetyScore =
    totalConversationsToday > 0
      ? Math.max(0, Math.round(100 - (flaggedToday / totalConversationsToday) * 100))
      : 100;

  return {
    stats: {
      totalConversationsToday,
      flaggedToday,
      blockedResponses,
      avgMessagesPerSession:
        conversations.length > 0
          ? Math.round(
              (conversations.reduce((s, c) => s + c.messageCount, 0) / conversations.length) * 10
            ) / 10
          : 0,
      safetyScore,
      topFigures: figureGroups.map((g) => ({
        name: figureNameById.get(g.figureId ?? "") ?? "Noma'lum",
        count: g._count.id,
      })),
    },
    conversations,
    alerts,
  };
}

function mapTxStatus(status: string): Transaction["status"] {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED") return "failed";
  if (status === "CANCELLED") return "refunded";
  return "pending";
}

export async function getAdminUserDetail(parentId: string) {
  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    include: {
      children: true,
      settings: true,
    },
  });

  if (!parent) return null;

  const childIds = parent.children.map((c) => c.id);
  const monthStart = startOfMonth();

  const [convCount, childRows] = await Promise.all([
    childIds.length > 0
      ? prisma.conversation.count({
          where: { childId: { in: childIds }, createdAt: { gte: monthStart } },
        })
      : Promise.resolve(0),
    Promise.all(
      parent.children.map(async (c) => {
        const progress = await buildChildProgress(c.id);
        return {
          id: c.id,
          name: c.name,
          age: c.age,
          parentId: parent.id,
          parentName: parent.name ?? parent.email.split("@")[0],
          xp: progress?.xp ?? 0,
          streakDays: progress?.streakDays ?? 0,
          lastSession: formatDate(c.updatedAt),
          status: "active" as const,
          interests: [] as string[],
        };
      })
    ),
  ]);

  return {
    parent: {
      id: parent.id,
      name: parent.name ?? parent.email.split("@")[0],
      phone: "—",
      email: parent.email,
      childrenCount: parent.children.length,
      plan: mapPlan(parent.settings?.subscriptionPlan),
      registeredAt: formatDate(parent.createdAt),
      status: "active" as const,
      lastActive: parent.updatedAt.toISOString(),
      city: "—",
    } satisfies ParentAccount,
    children: childRows satisfies ChildAccount[],
    monthlyConversations: convCount,
  };
}

export async function getAdminBilling() {
  const monthStart = startOfMonth();

  const [txRows, revenueAgg, planCounts] = await Promise.all([
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.paymentTransaction.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.parentSettings.groupBy({
      by: ["subscriptionPlan"],
      _count: { id: true },
    }),
  ]);

  const parentIds = [...new Set(txRows.map((t) => t.parentId))];
  const parents =
    parentIds.length > 0
      ? await prisma.parent.findMany({
          where: { id: { in: parentIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
  const parentNameById = new Map(
    parents.map((p) => [p.id, p.name ?? p.email.split("@")[0]])
  );

  const transactions: Transaction[] = txRows.map((t) => ({
    id: t.id,
    parentName: parentNameById.get(t.parentId) ?? "Noma'lum",
    plan: mapPlan(t.plan),
    amount: t.amount,
    currency: "UZS",
    status: mapTxStatus(t.status),
    date: t.createdAt.toISOString(),
    provider: t.provider === "PAYME" ? "Payme" : "Click",
  }));

  const countByPlan = new Map(planCounts.map((p) => [p.subscriptionPlan, p._count.id]));
  const planConfigs: PlanConfig[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      currency: "UZS",
      activeUsers: countByPlan.get("free") ?? 0,
      features: ["1 bola", "Kunlik 15 xabar", "Asosiy darslar"],
    },
    {
      id: "family",
      name: "Family",
      price: 29000,
      currency: "UZS",
      activeUsers: (countByPlan.get("family") ?? 0) + (countByPlan.get("standard") ?? 0),
      features: ["3 tagacha bola", "Cheksiz suhbat", "Haftalik hisobot"],
    },
    {
      id: "premium-plus",
      name: "Premium+",
      price: 0,
      currency: "UZS",
      activeUsers: countByPlan.get("premium_plus") ?? 0,
      features: ["Kengaytirilgan funksiyalar"],
    },
  ];

  const paymentIssues = transactions
    .filter((t) => t.status === "failed" || t.status === "pending")
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      parent: t.parentName,
      issue: t.status === "failed" ? "To'lov rad etildi" : "To'lov kutilmoqda",
      amount: t.amount,
      date: t.date.slice(0, 10),
    }));

  return {
    transactions,
    planConfigs,
    paymentIssues,
    revenueMonth: revenueAgg._sum.amount ?? 0,
  };
}

export async function getAdminFigures(): Promise<FigurePersona[]> {
  let figures: Array<{
    id: string;
    slug: string;
    nameUz: string;
    field: string;
    era: string;
    personaPrompt: string;
    isActive: boolean;
  }> = [];

  try {
    const rows = await prisma.greatFigure.findMany({ orderBy: { slug: "asc" } });
    if (rows.length > 0) {
      figures = rows;
    }
  } catch (error) {
    console.error("[getAdminFigures]", error);
  }

  if (figures.length === 0) {
    const { FIGURE_CATALOG } = await import("@/lib/rag/figuresCatalog");
    figures = FIGURE_CATALOG.map((f, i) => ({
      id: `cat-${i}`,
      slug: f.slug,
      nameUz: f.nameUz,
      field: f.field,
      era: f.era,
      personaPrompt: f.personaPrompt,
      isActive: true,
    }));
  }

  const figureIds = figures.map((f) => f.id).filter((id) => !id.startsWith("cat-"));
  const chatCounts =
    figureIds.length > 0
      ? await prisma.conversation.groupBy({
          by: ["figureId"],
          _count: { id: true },
          where: { figureId: { in: figureIds } },
        })
      : [];
  const countById = new Map(chatCounts.map((c) => [c.figureId, c._count.id]));

  return figures.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.nameUz,
    field: f.field,
    description: `${f.era} — ${f.field}`,
    promptPreview: f.personaPrompt.split("\n")[0]?.slice(0, 160) ?? "",
    status: f.isActive ? ("active" as const) : ("draft" as const),
    chatCount: countById.get(f.id) ?? 0,
  }));
}
