import { ParentDashboardLayout } from "@/components/parent/nurture/ParentDashboardLayout";

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return <ParentDashboardLayout title="Dashboard">{children}</ParentDashboardLayout>;
}
