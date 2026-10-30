"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatPrice } from "@/lib/utils";

type ChartData = {
  month: string;
  label: string;
  revenue: number;
  orders: number;
};

export function MonthlyRevenueChart({ data }: { data: ChartData[] }) {
  const lastIndex = data.length - 1;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E30613" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#E30613" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E30613" stopOpacity={1} />
              <stop offset="100%" stopColor="#E30613" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#ffffff40"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#ffffff40"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              value >= 1_000_000
                ? `${(value / 1_000_000).toFixed(1)}M`
                : `${(value / 1000).toFixed(0)}k`
            }
            dx={-10}
          />
          <Tooltip
            cursor={{ fill: "rgba(227,6,19,0.05)" }}
            contentStyle={{
              backgroundColor: "#0a0a0b",
              border: "1px solid #ffffff20",
              borderRadius: "12px",
              boxShadow: "0 8px 20px -8px rgba(0,0,0,0.5)",
            }}
            labelStyle={{ fontWeight: 600, color: "#ffffff", marginBottom: 4 }}
            itemStyle={{ color: "#E30613" }}
            formatter={(value: any) => [formatPrice(Number(value)), "Chiffre d'affaires"]}
          />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell
                key={entry.month}
                fill={index === lastIndex ? "url(#barGradientActive)" : "url(#barGradient)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}