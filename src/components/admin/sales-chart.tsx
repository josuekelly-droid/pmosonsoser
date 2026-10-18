"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "@/lib/utils";

type ChartData = {
  name: string;
  total: number;
};

export function SalesChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {/* Dégradé Lumineux Rouge Néon Dark Luxury */}
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grille Subtile */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />

          {/* Axes Typo Monospacée */}
          <XAxis
            dataKey="name"
            stroke="#a3a3a3"
            fontSize={11}
            fontFamily="monospace"
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#a3a3a3"
            fontSize={11}
            fontFamily="monospace"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
            dx={-10}
          />

          {/* Tooltip HUD Glassmorphism */}
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(10, 10, 11, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 10px 30px -10px rgba(239, 68, 68, 0.3)",
              padding: "12px 16px",
            }}
            labelStyle={{
              color: "#a3a3a3",
              fontFamily: "monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#EF4444",
              fontFamily: "var(--font-display, sans-serif)",
              fontSize: "18px",
              fontWeight: "300",
            }}
            formatter={(value) => [formatPrice(Number(value)), "Ventes"]}
          />

          {/* Courbe Néon Red Accent */}
          <Area
            type="monotone"
            dataKey="total"
            stroke="#EF4444"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}