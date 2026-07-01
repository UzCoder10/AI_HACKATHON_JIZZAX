import type { ReactNode } from "react";
import { AdminIcon } from "./AdminIcon";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: string; positive?: boolean };
  footer?: ReactNode;
  accent?: "default" | "teal" | "dark";
}

export function StatCard({ label, value, icon, trend, footer, accent = "default" }: StatCardProps) {
  const accentClasses = {
    default: "admin-card",
    teal: "admin-card",
    dark: "bg-[var(--admin-primary)] text-white border-[var(--admin-primary)]",
  };

  const iconBg = {
    default: "bg-[var(--admin-primary-light)] text-[var(--admin-primary)]",
    teal: "bg-[#e1e0ff] text-[var(--admin-accent)]",
    dark: "bg-[rgba(255,255,255,0.15)] text-[#6ffbbe]",
  };

  return (
    <div className={`${accentClasses[accent]} p-6 flex flex-col justify-between min-h-[160px]`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`p-2 rounded ${iconBg[accent]}`}>
            <AdminIcon name={icon} filled={accent === "dark"} />
          </span>
          {trend && (
            <span className={`text-sm font-bold flex items-center gap-1 ${trend.positive !== false ? "text-[var(--admin-accent-teal)]" : "text-[var(--admin-error)]"}`}>
              <AdminIcon name={trend.positive !== false ? "trending_up" : "trending_down"} className="!text-[14px]" />
              {trend.value}
            </span>
          )}
        </div>
        <p className={`admin-label-caps ${accent === "dark" ? "opacity-70" : "text-[var(--admin-text-muted)]"}`}>{label}</p>
        <p className={`text-[40px] font-bold leading-none mt-1 ${accent === "dark" ? "" : "text-[var(--admin-primary)]"}`}>{value}</p>
      </div>
      {footer && <div className={`mt-4 pt-4 border-t ${accent === "dark" ? "border-white/20" : "border-[var(--admin-border-light)]"}`}>{footer}</div>}
    </div>
  );
}
