/**
 * Analytics – statistical analysis of sensor data
 *
 * Shows distribution charts, min/max/avg statistics, and trend analysis.
 */

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface Stats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

function calcStats(values: number[]): Stats {
  if (values.length === 0)
    return { min: 0, max: 0, avg: 0, count: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return { min, max, avg, count: values.length };
}

export default function Analytics() {
  const readings = useQuery(api.sensorReadings.getAll, { limit: 500 });

  const stats = useMemo(() => {
    if (!readings || readings.length === 0) return null;
    return {
      ph: calcStats(readings.map((r) => r.ph)),
      tds: calcStats(readings.map((r) => r.tds)),
      turbidity: calcStats(readings.map((r) => r.turbidity)),
      temperature: calcStats(readings.map((r) => r.temperature)),
    };
  }, [readings]);

  // Prepare distribution data for pH
  const phDistribution = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    const buckets: Record<string, number> = {};
    for (let i = 5; i <= 10; i += 0.5) {
      buckets[i.toFixed(1)] = 0;
    }
    for (const r of readings) {
      const key = (Math.floor(r.ph * 2) / 2).toFixed(1);
      if (buckets[key] !== undefined) buckets[key]++;
    }
    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [readings]);

  // Time-series for all parameters
  const trendData = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    return [...readings]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ph: r.ph,
        tds: r.tds,
        turbidity: r.turbidity,
        temperature: r.temperature,
      }));
  }, [readings]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Statistical analysis of {readings?.length ?? 0} readings
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "pH", data: stats.ph, unit: "", color: "text-blue-600" },
              { label: "TDS", data: stats.tds, unit: "ppm", color: "text-teal-600" },
              { label: "Turbidity", data: stats.turbidity, unit: "NTU", color: "text-cyan-600" },
              { label: "Temperature", data: stats.temperature, unit: "°C", color: "text-orange-600" },
            ].map((item) => (
              <Card key={item.label} className="border-border/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Min</span>
                    <span className={`font-semibold tabular-nums ${item.color}`}>
                      {item.data.min.toFixed(2)} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg</span>
                    <span className={`font-bold tabular-nums ${item.color}`}>
                      {item.data.avg.toFixed(2)} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Max</span>
                    <span className={`font-semibold tabular-nums ${item.color}`}>
                      {item.data.max.toFixed(2)} {item.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* pH Distribution */}
        {phDistribution.length > 0 && (
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                pH Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={phDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(210, 80%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Parameter Trends */}
        {trendData.length > 0 && (
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Parameter Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="ph" stroke="hsl(210, 80%, 50%)" dot={false} strokeWidth={1.5} name="pH" />
                  <Line type="monotone" dataKey="turbidity" stroke="hsl(185, 70%, 45%)" dot={false} strokeWidth={1.5} name="Turbidity" />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(25, 80%, 50%)" dot={false} strokeWidth={1.5} name="Temp" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {!readings || readings.length === 0 ? (
          <Card className="border-border/70">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No data to analyse yet. Analytics will appear once sensor readings are collected.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
