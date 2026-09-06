/**
 * Dashboard – main overview page
 *
 * Shows the overall quality status, four water quality cards,
 * a mini live chart, device control status, and recent alerts.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import {
  Droplets,
  Thermometer,
  Waves,
  Wind,
  Power,
  CircleDot,
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import WaterQualityCard from "@/components/WaterQualityCard";
import QualityBanner from "@/components/QualityBanner";
import LiveChart from "@/components/LiveChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router";

/** Determine the quality status for a parameter against its limits */
function getParamStatus(
  value: number,
  min?: number,
  max?: number
): "normal" | "warning" | "critical" {
  if (max !== undefined && value > max) {
    return value > max * 1.3 ? "critical" : "warning";
  }
  if (min !== undefined && value < min) {
    return value < min * 0.7 ? "critical" : "warning";
  }
  return "normal";
}

function getStatusLabel(status: "normal" | "warning" | "critical"): string {
  if (status === "normal") return "Normal";
  if (status === "warning") return "Warning";
  return "Critical";
}

export default function Dashboard() {
  const navigate = useNavigate();

  // Seed default config on first load
  const seedLimits = useMutation(api.qualityLimits.seedDefaults);
  const seedConfig = useMutation(api.systemConfig.seedDefaults);

  useEffect(() => {
    seedLimits();
    seedConfig();
  }, [seedLimits, seedConfig]);

  // Fetch data via Convex real-time subscriptions
  const latest = useQuery(api.sensorReadings.getLatestAny);
  const recentReadings = useQuery(api.sensorReadings.getRecent, { limit: 30 });
  const unresolvedAlerts = useQuery(api.alerts.getUnresolved);
  const limits = useQuery(api.qualityLimits.getAll);
  const deviceStatus = useQuery(api.deviceStatus.getByDevice, {
    deviceId: "ESP32_WATER_01",
  });

  // Build limit lookup
  const limitMap: Record<string, { minValue?: number; maxValue: number; unit: string }> = {};
  if (limits) {
    for (const l of limits) {
      limitMap[l.parameter] = { minValue: l.minValue, maxValue: l.maxValue, unit: l.unit };
    }
  }

  // Determine overall quality
  const isNormal = !unresolvedAlerts || unresolvedAlerts.length === 0;
  const firstAlert = unresolvedAlerts?.[0];

  // Prepare chart data
  const phData = (recentReadings ?? [])
    .map((r) => ({ timestamp: r.timestamp, value: r.ph }))
    .reverse();
  const tdsData = (recentReadings ?? [])
    .map((r) => ({ timestamp: r.timestamp, value: r.tds }))
    .reverse();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Quality Status Banner */}
        <QualityBanner
          isNormal={isNormal}
          affectedParameter={firstAlert?.parameter}
          systemResponse={firstAlert?.systemResponse}
        />

        {/* Water Quality Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <WaterQualityCard
            label="pH Level"
            value={latest?.ph ?? 0}
            unit=""
            icon={Droplets}
            status={getParamStatus(
              latest?.ph ?? 7,
              limitMap.ph?.minValue,
              limitMap.ph?.maxValue
            )}
            statusLabel={getStatusLabel(
              getParamStatus(
                latest?.ph ?? 7,
                limitMap.ph?.minValue,
                limitMap.ph?.maxValue
              )
            )}
          />
          <WaterQualityCard
            label="TDS"
            value={latest?.tds ?? 0}
            unit="ppm"
            icon={Waves}
            status={getParamStatus(latest?.tds ?? 0, undefined, limitMap.tds?.maxValue)}
            statusLabel={getStatusLabel(
              getParamStatus(latest?.tds ?? 0, undefined, limitMap.tds?.maxValue)
            )}
          />
          <WaterQualityCard
            label="Turbidity"
            value={latest?.turbidity ?? 0}
            unit="NTU"
            icon={Wind}
            status={getParamStatus(
              latest?.turbidity ?? 0,
              undefined,
              limitMap.turbidity?.maxValue
            )}
            statusLabel={getStatusLabel(
              getParamStatus(
                latest?.turbidity ?? 0,
                undefined,
                limitMap.turbidity?.maxValue
              )
            )}
          />
          <WaterQualityCard
            label="Temperature"
            value={latest?.temperature ?? 0}
            unit="°C"
            icon={Thermometer}
            status={getParamStatus(
              latest?.temperature ?? 20,
              limitMap.temperature?.minValue,
              limitMap.temperature?.maxValue
            )}
            statusLabel={getStatusLabel(
              getParamStatus(
                latest?.temperature ?? 20,
                limitMap.temperature?.minValue,
                limitMap.temperature?.maxValue
              )
            )}
          />
        </div>

        {/* Charts + Device Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mini Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiveChart
              data={phData}
              color="hsl(200, 80%, 50%)"
              label="pH"
              unit=""
              currentValue={latest?.ph}
              height={160}
              min={limitMap.ph?.minValue ?? 5}
              max={limitMap.ph?.maxValue ?? 10}
            />
            <LiveChart
              data={tdsData}
              color="hsl(160, 60%, 45%)"
              label="TDS"
              unit="ppm"
              currentValue={latest?.tds}
              height={160}
              min={0}
              max={limitMap.tds?.maxValue ? limitMap.tds.maxValue * 1.5 : 500}
            />
          </div>

          {/* Device Control Status */}
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CircleDot className="size-4 text-accent" />
                Device Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusRow
                label="Pump"
                active={latest?.pumpStatus ?? false}
                icon={Power}
              />
              <StatusRow
                label="Solenoid"
                active={latest?.solenoidStatus ?? false}
                icon={Zap}
              />
              <StatusRow
                label="UV Disinfection"
                active={latest?.uvStatus ?? false}
                icon={CircleDot}
              />
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Flow Rate</span>
                  <span className="font-semibold tabular-nums">
                    {latest?.flowRate?.toFixed(1) ?? "—"} L/min
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">ESP32</span>
                  <span
                    className={`font-semibold ${
                      deviceStatus?.online
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {deviceStatus?.online ? "Connected" : "Offline"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Alerts */}
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Recent Alerts
                </CardTitle>
                <button
                  onClick={() => navigate("/dashboard/alerts")}
                  className="text-xs text-accent hover:underline cursor-pointer flex items-center gap-1"
                >
                  View All <ArrowRight className="size-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {!unresolvedAlerts || unresolvedAlerts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No active alerts — all parameters normal
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unresolvedAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert._id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
                    >
                      <div
                        className={`size-2 rounded-full shrink-0 ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-500"
                            : alert.severity === "HIGH"
                            ? "bg-amber-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(alert.timestamp).toLocaleTimeString()} —{" "}
                          {alert.severity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Live Monitoring", path: "/dashboard/live", icon: Activity },
                  { label: "Purification", path: "/dashboard/purification", icon: Droplets },
                  { label: "Control Panel", path: "/dashboard/control", icon: Power },
                  { label: "System Status", path: "/dashboard/status", icon: CircleDot },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border/60 p-4 text-center hover:bg-accent/5 hover:border-accent/30 transition-colors cursor-pointer"
                  >
                    <item.icon className="size-5 text-accent" />
                    <span className="text-xs font-medium text-foreground">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

// Inline helper for device status rows
function StatusRow({
  label,
  active,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span
        className={`text-xs font-semibold ${
          active
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground"
        }`}
      >
        {active ? "ON" : "OFF"}
      </span>
    </div>
  );
}
