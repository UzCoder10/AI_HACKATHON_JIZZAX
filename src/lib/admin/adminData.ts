import { fetchJson } from "@/lib/api/fetchJson";
import { USE_MOCK } from "@/lib/mockData";
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

export interface AdminOverviewData {
  metrics: DashboardMetrics;
  growth: GrowthPoint[];
  signups: RecentSignup[];
  activityLog: ActivityLogEntry[];
}

export interface AdminAiData {
  stats: {
    totalConversationsToday: number;
    flaggedToday: number;
    blockedResponses: number;
    avgMessagesPerSession: number;
    safetyScore: number;
    topFigures: Array<{ name: string; count: number }>;
  };
  conversations: AiConversationSummary[];
  alerts: AiAlert[];
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  if (USE_MOCK) {
    const mock = await import("@/lib/admin/mockData");
    return {
      metrics: mock.dashboardMetrics,
      growth: mock.growthData,
      signups: mock.recentSignups,
      activityLog: mock.activityLog,
    };
  }
  return fetchJson<AdminOverviewData>("/api/admin/overview");
}

export async function fetchAdminUsers(): Promise<ParentAccount[]> {
  if (USE_MOCK) {
    const { parentAccounts } = await import("@/lib/admin/mockData");
    return parentAccounts;
  }
  return fetchJson<ParentAccount[]>("/api/admin/users");
}

export async function fetchAdminChildren(): Promise<ChildAccount[]> {
  if (USE_MOCK) {
    const { childAccounts } = await import("@/lib/admin/mockData");
    return childAccounts;
  }
  return fetchJson<ChildAccount[]>("/api/admin/children");
}

export async function fetchAdminAi(): Promise<AdminAiData> {
  if (USE_MOCK) {
    const { aiStats, aiConversations, aiAlerts } = await import("@/lib/admin/mockData");
    return { stats: aiStats, conversations: aiConversations, alerts: aiAlerts };
  }
  return fetchJson<AdminAiData>("/api/admin/ai");
}

export interface AdminUserDetailData {
  parent: ParentAccount;
  children: ChildAccount[];
  monthlyConversations: number;
}

export async function fetchAdminUserDetail(id: string): Promise<AdminUserDetailData> {
  if (USE_MOCK) {
    const { getParentById, getChildrenByParentId } = await import("@/lib/admin/mockData");
    const parent = getParentById(id);
    if (!parent) throw new Error("Foydalanuvchi topilmadi");
    return {
      parent,
      children: getChildrenByParentId(id),
      monthlyConversations: 47,
    };
  }
  return fetchJson<AdminUserDetailData>(`/api/admin/users/${encodeURIComponent(id)}`);
}

export interface AdminBillingData {
  transactions: Transaction[];
  planConfigs: PlanConfig[];
  paymentIssues: Array<{ id: string; parent: string; issue: string; amount: number; date: string }>;
  revenueMonth: number;
}

export async function fetchAdminBilling(): Promise<AdminBillingData> {
  if (USE_MOCK) {
    const { transactions, planConfigs, paymentIssues, dashboardMetrics } = await import(
      "@/lib/admin/mockData"
    );
    return {
      transactions,
      planConfigs,
      paymentIssues,
      revenueMonth: dashboardMetrics.revenueMonth,
    };
  }
  return fetchJson<AdminBillingData>("/api/admin/billing");
}

export async function fetchAdminFigures(): Promise<FigurePersona[]> {
  if (USE_MOCK) {
    const { figurePersonas } = await import("@/lib/admin/mockData");
    return figurePersonas;
  }
  return fetchJson<FigurePersona[]>("/api/admin/figures");
}
