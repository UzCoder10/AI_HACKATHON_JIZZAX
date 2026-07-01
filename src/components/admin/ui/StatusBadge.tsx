import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "error" | "info" | "neutral";

const styles: Record<Variant, string> = {
  default: "bg-[var(--admin-primary-light)] text-[var(--admin-primary)]",
  success: "bg-[#e8fbf4] text-[var(--admin-accent-teal)]",
  warning: "bg-[var(--admin-warning-light)] text-[var(--admin-warning)]",
  error: "bg-[var(--admin-error-light)] text-[var(--admin-error)]",
  info: "bg-[#eeeefb] text-[var(--admin-accent)]",
  neutral: "bg-[var(--admin-surface-container)] text-[var(--admin-text-muted)]",
};

export function StatusBadge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function planBadgeVariant(plan: string): Variant {
  if (plan === "premium-plus") return "info";
  if (plan === "family") return "success";
  return "neutral";
}

export function statusBadgeVariant(status: string): Variant {
  if (status === "active") return "success";
  if (status === "blocked") return "error";
  if (status === "pending") return "warning";
  if (status === "success") return "success";
  if (status === "failed") return "error";
  if (status === "draft") return "neutral";
  return "default";
}

export function severityBadgeVariant(severity: string): Variant {
  if (severity === "critical") return "error";
  if (severity === "high") return "error";
  if (severity === "medium") return "warning";
  return "neutral";
}
