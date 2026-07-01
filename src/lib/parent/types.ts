export type ChildInterest = {
  label: string;
  percent: number;
  color: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  status: string;
  progressPercent: number;
  todayMinutes: number;
  todayXp: number;
  weeklyXp: number;
  streakDays?: number;
  interests: ChildInterest[];
  language: string;
};

export type DashboardSummary = {
  greetingName: string;
  totalHours: number;
  activeDays: number;
  weeklyGrowthPercent: number;
};

export type ChildSession = {
  id: string;
  title: string;
  time: string;
  duration: string;
  xp: number;
  icon: string;
  tone: "primary" | "secondary" | "tertiary" | "neutral";
};

export type ChildDetail = ChildProfile & {
  fullName?: string;
  todayXpDelta?: string;
  aiSummary?: string;
  aiRecommendations?: Array<{ title: string; body: string; icon: string }>;
  weeklyActivity?: Array<{ label: string; height: number; highlight?: boolean }>;
  recentSessions?: ChildSession[];
};

export type SubscriptionPlanId = "free" | "standard" | "family" | "premium_plus";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
};

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expiry: string;
  isPrimary: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  status: "success" | "pending" | "failed";
  invoice: string;
};

export type SubscriptionData = {
  currentPlan: SubscriptionPlanId;
  nextBillingDate: string;
  monthlyPrice: number;
  profileLimit: { used: number; total: number };
  aiReports: string;
  plans: SubscriptionPlan[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
};
