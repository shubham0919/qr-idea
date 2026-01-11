"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface DataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AnalyticsPieChartProps {
  title: string;
  data: DataItem[];
  emptyMessage?: string;
}

const COLORS = [
  "oklch(0.55 0.2 250)",
  "oklch(0.6 0.15 180)",
  "oklch(0.65 0.18 140)",
  "oklch(0.7 0.15 60)",
  "oklch(0.6 0.2 30)",
];

export function AnalyticsPieChart({
  title,
  data,
  emptyMessage = "No data yet",
}: AnalyticsPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || total === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const numValue = Number(value) || 0;
                  return [
                    `${numValue} (${((numValue / total) * 100).toFixed(1)}%)`,
                    "Clicks",
                  ];
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm capitalize">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
