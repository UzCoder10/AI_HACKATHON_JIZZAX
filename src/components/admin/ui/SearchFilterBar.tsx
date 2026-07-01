"use client";

import { AdminIcon } from "./AdminIcon";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
}

export function SearchFilterBar({ search, onSearchChange, placeholder = "Qidirish...", filters }: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-subtle)] !text-[18px]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--admin-surface-low)] border border-[var(--admin-border)] rounded focus:ring-2 focus:ring-[var(--admin-primary)] focus:outline-none"
        />
      </div>
      {filters}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="px-3 py-2 text-sm bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded focus:ring-2 focus:ring-[var(--admin-primary)] focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
