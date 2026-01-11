"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AnalyticsBarChartProps {
  title: string;
  data: DataItem[];
  emptyMessage?: string;
}

export function AnalyticsBarChart({
  title,
  data,
  emptyMessage = "No data yet",
}: AnalyticsBarChartProps) {
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
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" allowDecimals={false} stroke="#9ca3af" />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => [
                  `${value} clicks`,
                  "",
                ]}
              />
              <Bar
                dataKey="value"
                fill="oklch(0.55 0.2 250)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
