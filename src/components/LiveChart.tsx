/**
 * LiveChart – real-time line chart for sensor data
 *
 * Renders a responsive line chart that updates automatically when
 * new data arrives via Convex subscriptions.
 */

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

interface LiveChartProps {
  data: ChartDataPoint[];
  color: string;
  label: string;
  unit: string;
  currentValue?: number;
  className?: string;
  height?: number;
  min?: number;
  max?: number;
}

export default function LiveChart({
  data,
  color,
  label,
  unit,
  currentValue,
  className,
  height = 200,
  min,
  max,
}: LiveChartProps) {
  // Format data for Recharts: newest last for proper line rendering
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((point) => ({
        time: new Date(point.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        value: point.value,
        timestamp: point.timestamp,
      }));
  }, [data]);

  // Calculate domain for Y axis
  const yDomain = useMemo(() => {
    if (min !== undefined && max !== undefined) return [min, max] as [number, number];
    if (chartData.length === 0) return [0, 10] as [number, number];
    const values = chartData.map((d) => d.value);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const padding = Math.max((dataMax - dataMin) * 0.15, 0.5);
    return [
      Math.floor((dataMin - padding) * 10) / 10,
      Math.ceil((dataMax + padding) * 10) / 10,
    ] as [number, number];
  }, [chartData, min, max]);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          {currentValue !== undefined && (
            <p className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {currentValue}{" "}
              <span className="text-xs font-normal text-muted-foreground">{unit}</span>
            </p>
          )}
        </div>
        {chartData.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {chartData.length} readings
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(label) => `Time: ${label}`}
            formatter={(value: number) => [`${value} ${unit}`, label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
