/**
 * Automatic Control – manual control of pump, solenoid, and UV
 *
 * Sends control commands through the backend command queue.
 * ESP32 polls for and executes these commands.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Power,
  Zap,
  CircleDot,
  Waves,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AutomaticControl() {
  const [sendingCommand, setSendingCommand] = useState<string | null>(null);
  const latest = useQuery(api.sensorReadings.getLatestAny);
  const commandHistory = useQuery(api.commandQueue.getHistory, { limit: 10 });
  const queueCommand = useMutation(api.commandQueue.queueCommand);

  const handleCommand = async (command: string, label: string) => {
    setSendingCommand(command);
    try {
      await queueCommand({
        deviceId: "ESP32_WATER_01",
        command,
      });
      toast.success(`${label} command sent`, {
        description: "ESP32 will execute on next poll",
      });
    } catch (error) {
      toast.error("Failed to send command", {
        description: String(error),
      });
    } finally {
      setSendingCommand(null);
    }
  };

  const controls = [
    {
      title: "Water Pump",
      icon: Power,
      status: latest?.pumpStatus ?? false,
      statusLabel: latest?.pumpStatus ? "ON" : "OFF",
      onCommand: "pump_on",
      offCommand: "pump_off",
      onLabel: "Turn ON",
      offLabel: "Turn OFF",
    },
    {
      title: "Solenoid Valve",
      icon: Zap,
      status: latest?.solenoidStatus ?? false,
      statusLabel: latest?.solenoidStatus ? "OPEN" : "CLOSED",
      onCommand: "solenoid_open",
      offCommand: "solenoid_close",
      onLabel: "Open",
      offLabel: "Close",
    },
    {
      title: "UV Disinfection",
      icon: CircleDot,
      status: latest?.uvStatus ?? false,
      statusLabel: latest?.uvStatus ? "ON" : "OFF",
      onCommand: "uv_on",
      offCommand: "uv_off",
      onLabel: "Turn ON",
      offLabel: "Turn OFF",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <SlidersHorizontal className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Automatic Control</h1>
            <p className="text-sm text-muted-foreground">
              Send control commands to ESP32 devices
            </p>
          </div>
        </div>

        {/* Water Flow Status */}
        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Waves className="size-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Water Flow</p>
                <p className="text-lg font-bold text-foreground">
                  {latest?.solenoidStatus && latest?.pumpStatus
                    ? "NORMAL"
                    : latest?.pumpStatus
                    ? "PARTIAL"
                    : "STOPPED"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {controls.map((ctrl) => (
            <Card key={ctrl.title} className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ctrl.icon className="size-4 text-accent" />
                    {ctrl.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {ctrl.status ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-bold",
                        ctrl.status
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {ctrl.statusLabel}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleCommand(ctrl.onCommand, ctrl.onLabel)}
                  disabled={sendingCommand === ctrl.onCommand || ctrl.status}
                  className="w-full cursor-pointer"
                  variant={ctrl.status ? "outline" : "default"}
                >
                  {sendingCommand === ctrl.onCommand ? "Sending..." : ctrl.onLabel}
                </Button>
                <Button
                  onClick={() => handleCommand(ctrl.offCommand, ctrl.offLabel)}
                  disabled={sendingCommand === ctrl.offCommand || !ctrl.status}
                  className="w-full cursor-pointer"
                  variant={!ctrl.status ? "outline" : "destructive"}
                >
                  {sendingCommand === ctrl.offCommand ? "Sending..." : ctrl.offLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Command History */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Command History</CardTitle>
          </CardHeader>
          <CardContent>
            {!commandHistory || commandHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No commands sent yet
              </p>
            ) : (
              <div className="space-y-2">
                {commandHistory.map((cmd) => (
                  <div
                    key={cmd._id}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          cmd.executed ? "bg-emerald-500" : "bg-amber-500"
                        )}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {cmd.command.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(cmd.timestamp).toLocaleTimeString()}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-medium",
                          cmd.executed
                            ? "text-emerald-600"
                            : "text-amber-600"
                        )}
                      >
                        {cmd.executed ? "Executed" : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
