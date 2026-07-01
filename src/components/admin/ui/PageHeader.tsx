import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--admin-primary)] tracking-tight mb-1">{title}</h1>
        {description && <p className="text-sm text-[var(--admin-text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}
