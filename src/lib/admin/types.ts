export type AdminRole = "super-admin" | "content-manager" | "moderator";

export type AccountStatus = "active" | "blocked" | "pending";

export type ContentStatus = "active" | "draft";

export type SubscriptionPlan = "free" | "family" | "premium-plus";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLogin: string;
}

export interface ParentAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  childrenCount: number;
  plan: SubscriptionPlan;
  registeredAt: string;
  status: AccountStatus;
  lastActive: string;
  city: string;
}

export interface ChildAccount {
  id: string;
  name: string;
  age: number;
  parentId: string;
  parentName: string;
  xp: number;
  streakDays: number;
  lastSession: string;
  status: AccountStatus;
  interests: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  type: "lesson" | "figure" | "test" | "game";
  subject: string;
  status: ContentStatus;
  updatedAt: string;
  author: string;
  /** YouTube video (faqat lesson) */
  youtubeId?: string;
  videoTitle?: string;
  videoUrl?: string;
  videoDurationSeconds?: number;
  /** Fonus Kids pause nuqtalari soni */
  pausePointCount?: number;
}

export interface FigurePersona {
  id: string;
  slug: string;
  name: string;
  field: string;
  description: string;
  promptPreview: string;
  status: ContentStatus;
  chatCount: number;
}

export interface AiConversationSummary {
  id: string;
  childId: string;
  childName: string;
  figureName: string;
  startedAt: string;
  messageCount: number;
  flagged: boolean;
  severity: AlertSeverity | null;
  reason: string | null;
}

export interface AiAlert {
  id: string;
  conversationId: string;
  childName: string;
  severity: AlertSeverity;
  reason: string;
  createdAt: string;
  reviewed: boolean;
}

export interface Transaction {
  id: string;
  parentName: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending" | "refunded";
  date: string;
  provider: string;
}

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  activeUsers: number;
  features: string[];
}

export interface DashboardMetrics {
  totalParents: number;
  totalChildren: number;
  activeUsersToday: number;
  conversationsToday: number;
  revenueMonth: number;
  revenueGrowth: number;
  userGrowth: number;
  activityGrowth: number;
  aiApiStatus: "online" | "degraded" | "offline";
  aiApiLatencyMs: number;
}

export interface GrowthPoint {
  date: string;
  users: number;
  activity: number;
}

export interface RecentSignup {
  id: string;
  name: string;
  type: "parent" | "child";
  plan?: SubscriptionPlan;
  registeredAt: string;
}

export interface ActivityLogEntry {
  id: string;
  type: "signup" | "alert" | "payment" | "content" | "system";
  title: string;
  description: string;
  time: string;
  ago: string;
}
