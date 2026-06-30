"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MoodChartProps {
  data: Array<{ date: string; score: number; emoji?: string }>;
}

export function MoodChart({ data }: MoodChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-outline text-sm bg-surface-container rounded-xl font-medium">
        Kayfiyat ma&apos;lumotlari hali yo&apos;q
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e2e1" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#737688" }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#737688" }} />
          <Tooltip
            formatter={(value: number, _name, props) => {
              const emoji = (props.payload as { emoji?: string })?.emoji ?? "";
              return [`${value}/5 ${emoji}`, "Kayfiyat"];
            }}
            labelFormatter={(label) => `Sana: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0042c8"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "#0042c8" }}
            activeDot={{ r: 7, fill: "#0056ff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
