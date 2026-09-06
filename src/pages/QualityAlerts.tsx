/**
 * Quality Alerts – alert log page
 *
 * Displays all quality alerts with filtering and the ability to resolve them.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  LOW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export default function QualityAlerts() {
  const allAlerts = useQuery(api.alerts.getAll, { limit: 100 });
  const resolveAlert = useMutation(api.alerts.resolveAlert);
  const resolveAll = useMutation(api.alerts.resolveAll);

  const unresolved = allAlerts?.filter((a) => !a.resolved) ?? [];
  const resolved = allAlerts?.filter((a) => a.resolved) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Quality Alerts</h1>
              <p className="text-sm text-muted-foreground">
                {unresolved.length} active alert{unresolved.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {unresolved.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => resolveAll({ deviceId: "ESP32_WATER_01" })}
              className="cursor-pointer"
            >
              <CheckCircle2 className="size-4 mr-2" />
              Resolve All
            </Button>
          )}
        </div>

        {/* Active Alerts */}
        {unresolved.length > 0 ? (
          <div className="space-y-3">
            {unresolved.map((alert) => (
              <Card key={alert._id} className="border-red-200/60 dark:border-red-900/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="size-5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">
                            {alert.message}
                          </p>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                              severityStyles[alert.severity] ?? severityStyles.MEDIUM
                            )}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Value: <span className="font-semibold text-foreground">{alert.value}</span>
                          {" — "}Limit: <span className="font-semibold text-foreground">{alert.limitValue}</span>
                          {" — "}{new Date(alert.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-accent mt-1 font-medium">
                          Response: {alert.systemResponse}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert({ alertId: alert._id })}
                      className="cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="size-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/70">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">
                All Clear
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No active alerts — all water quality parameters are within monitored limits.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resolved Alerts */}
        {resolved.length > 0 && (
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Resolved Alerts ({resolved.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resolved.slice(0, 20).map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-center gap-3 rounded-lg border border-border/40 px-4 py-2.5 opacity-60"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-600">
                      Resolved
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
