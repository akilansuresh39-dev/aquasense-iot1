/**
 * Live Monitoring – real-time charts for all water quality parameters
 *
 * Displays four live-updating charts (pH, TDS, Turbidity, Temperature)
 * plus flow rate, all fed by Convex real-time subscriptions.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import LiveChart from "@/components/LiveChart";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiveMonitoring() {
  const recentReadings = useQuery(api.sensorReadings.getRecent, { limit: 60 });
  const latest = useQuery(api.sensorReadings.getLatestAny);
  const limits = useQuery(api.qualityLimits.getAll);

  // Build limit lookup
  const limitMap: Record<string, { minValue?: number; maxValue: number }> = {};
  if (limits) {
    for (const l of limits) {
      limitMap[l.parameter] = { minValue: l.minValue, maxValue: l.maxValue };
    }
  }

  // Prepare chart data arrays (reversed for chronological order)
  const phData = (recentReadings ?? [])
    .map((r) => ({ timestamp: r.timestamp, value: r.ph }))
    .reverse();
  const tdsData = (recentReadings ?? [])
    .map((r) => ({ timestamp: r.timestamp, value: r.tds }))
    .reverse();
  const turbidityData = (recentReadings ?? [])
    .map((r) => ({ timestamp: r.timestamp, value: r.turbidity }))
    .reverse();
  const temperatureData = (recentReadings ?? [])
    .map((r) => ({ timestamp: r.timestamp, value: r.temperature }))
    .reverse();
  const flowData = (recentReadings ?? [])
    .map((r) => ({ timestamp: r.timestamp, value: r.flowRate }))
    .reverse();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Activity className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Live Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Real-time sensor readings from ESP32
            </p>
          </div>
        </div>

        {/* Live Status Summary */}
        {latest && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "pH", value: latest.ph.toFixed(2), color: "text-blue-600" },
              { label: "TDS", value: `${latest.tds} ppm`, color: "text-teal-600" },
              { label: "Turbidity", value: `${latest.turbidity} NTU`, color: "text-cyan-600" },
              { label: "Temp", value: `${latest.temperature}°C`, color: "text-orange-600" },
              { label: "Flow", value: `${latest.flowRate} L/min`, color: "text-indigo-600" },
            ].map((item) => (
              <Card key={item.label} className="border-border/60">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-lg font-bold tabular-nums ${item.color}`}>
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiveChart
            data={phData}
            color="hsl(210, 80%, 50%)"
            label="pH Level"
            unit=""
            currentValue={latest?.ph}
            min={limitMap.ph?.minValue ?? 5}
            max={limitMap.ph?.maxValue ?? 10}
          />
          <LiveChart
            data={tdsData}
            color="hsl(170, 60%, 42%)"
            label="TDS (Total Dissolved Solids)"
            unit="ppm"
            currentValue={latest?.tds}
            min={0}
            max={limitMap.tds?.maxValue ? limitMap.tds.maxValue * 1.5 : 500}
          />
          <LiveChart
            data={turbidityData}
            color="hsl(185, 70%, 45%)"
            label="Turbidity"
            unit="NTU"
            currentValue={latest?.turbidity}
            min={0}
            max={limitMap.turbidity?.maxValue ? limitMap.turbidity.maxValue * 2 : 10}
          />
          <LiveChart
            data={temperatureData}
            color="hsl(25, 80%, 50%)"
            label="Temperature"
            unit="°C"
            currentValue={latest?.temperature}
            min={limitMap.temperature?.minValue ?? 0}
            max={limitMap.temperature?.maxValue ?? 45}
          />
        </div>

        {/* Flow Rate Chart (full width) */}
        <LiveChart
          data={flowData}
          color="hsl(240, 60%, 55%)"
          label="Water Flow Rate"
          unit="L/min"
          currentValue={latest?.flowRate}
          min={0}
          max={6}
          height={180}
        />
      </div>
    </AppLayout>
  );
}
