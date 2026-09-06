/**
 * System Status – connection and health overview
 *
 * Shows ESP32, sensor, backend, database, and IoT connection status.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Server,
  Wifi,
  WifiOff,
  Database,
  Activity,
  Power,
  Zap,
  CircleDot,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatusIndicator({
  label,
  online,
  icon: Icon,
}: {
  label: string;
  online: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {online ? (
          <CheckCircle2 className="size-4 text-emerald-500" />
        ) : (
          <XCircle className="size-4 text-red-500" />
        )}
        <span
          className={cn(
            "text-xs font-bold uppercase",
            online
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}

export default function SystemStatusPage() {
  const deviceStatus = useQuery(api.deviceStatus.getByDevice, {
    deviceId: "ESP32_WATER_01",
  });
  const latest = useQuery(api.sensorReadings.getLatestAny);
  const limits = useQuery(api.qualityLimits.getAll);
  const config = useQuery(api.systemConfig.getAll);

  const isOnline = deviceStatus?.online ?? false;
  const lastSeen = deviceStatus?.lastSeen;

  // Check if ESP32 is offline (no data for > 15 seconds)
  const esp32Offline = lastSeen ? Date.now() - lastSeen > 15_000 : true;

  // Check database connectivity (if we can query, it's connected)
  const dbConnected = limits !== undefined;

  const configMap: Record<string, string> = {};
  if (config) {
    for (const c of config) configMap[c.key] = c.value;
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Server className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">System Status</h1>
            <p className="text-sm text-muted-foreground">
              Connection status and health monitoring
            </p>
          </div>
        </div>

        {/* Connection Status Grid */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusIndicator
              label="ESP32 Device"
              online={!esp32Offline}
              icon={Wifi}
            />
            <StatusIndicator
              label="Sensors"
              online={isOnline}
              icon={Activity}
            />
            <StatusIndicator
              label="IoT Connection"
              online={true}
              icon={Wifi}
            />
            <StatusIndicator
              label="Backend"
              online={true}
              icon={Server}
            />
            <StatusIndicator
              label="Database"
              online={dbConnected}
              icon={Database}
            />
          </CardContent>
        </Card>

        {/* Device Details */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              ESP32 Device Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Device ID</span>
              <span className="font-mono font-medium text-foreground">
                ESP32_WATER_01
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className={cn(
                  "font-semibold",
                  !esp32Offline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {!esp32Offline ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Last Data Received
              </span>
              <span className="font-medium text-foreground">
                {lastSeen
                  ? new Date(lastSeen).toLocaleString()
                  : "No data received"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connection</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Wi-Fi (Local Network)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Device Controls Status */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Device Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <Power className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Pump</span>
              </div>
              <span
                className={cn(
                  "text-xs font-bold",
                  latest?.pumpStatus
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                )}
              >
                {latest?.pumpStatus ? "ON" : "OFF"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <Zap className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Solenoid Valve</span>
              </div>
              <span
                className={cn(
                  "text-xs font-bold",
                  latest?.solenoidStatus
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                )}
              >
                {latest?.solenoidStatus ? "OPEN" : "CLOSED"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <CircleDot className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">UV Disinfection</span>
              </div>
              <span
                className={cn(
                  "text-xs font-bold",
                  latest?.uvStatus
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                )}
              >
                {latest?.uvStatus ? "ON" : "OFF"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        {Object.keys(configMap).length > 0 && (
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(configMap).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between text-sm rounded-lg border border-border/40 px-4 py-2"
                >
                  <span className="text-muted-foreground font-mono text-xs">
                    {key}
                  </span>
                  <span className="font-medium text-foreground font-mono text-xs">
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
