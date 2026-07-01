"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface GrowthChartProps {
  data: { date: string; users: number; activity: number }[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <div className="admin-card p-6">
      <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4">O&apos;sish dinamikasi</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3e41de" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3e41de" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#006c49" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#006c49" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#75777e" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#75777e" }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              contentStyle={{ borderRadius: 4, border: "1px solid #c6c6ce", fontSize: 13 }}
              formatter={(value: number, name: string) => [
                value.toLocaleString("uz-UZ"),
                name === "users" ? "Faol foydalanuvchilar" : "Suhbatlar",
              ]}
            />
            <Area type="monotone" dataKey="users" stroke="#3e41de" fill="url(#usersGrad)" strokeWidth={2} name="users" />
            <Area type="monotone" dataKey="activity" stroke="#006c49" fill="url(#activityGrad)" strokeWidth={2} name="activity" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-6 mt-3 text-xs text-[var(--admin-text-muted)]">
        <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[#3e41de]" /> Faol foydalanuvchilar</span>
        <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[#006c49]" /> Suhbatlar</span>
      </div>
    </div>
  );
}
