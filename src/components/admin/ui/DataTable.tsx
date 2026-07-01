import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, keyField, onRowClick, emptyMessage = "Ma'lumot topilmadi" }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="admin-card p-12 text-center text-sm text-[var(--admin-text-muted)]">{emptyMessage}</div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border-light)] bg-[var(--admin-surface-low)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`admin-label-caps text-left px-4 py-3 text-[var(--admin-text-muted)] font-semibold ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border-light)]">
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                className={`admin-table-row ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-2.5 align-middle ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
