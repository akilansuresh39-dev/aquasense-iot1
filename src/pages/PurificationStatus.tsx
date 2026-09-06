/**
 * Purification Status – visual workflow of the water purification pipeline
 *
 * Displays each stage from raw water to purified output with real-time
 * status indicators linked to ESP32 data.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import PurificationStage from "@/components/PurificationStage";
import {
  Droplets,
  Filter,
  Layers,
  Sun,
  Activity,
  GitBranch,
  Waves,
  GlassWater,
  ArrowDown,
} from "lucide-react";

export default function PurificationStatus() {
  const latest = useQuery(api.sensorReadings.getLatestAny);
  const deviceStatus = useQuery(api.deviceStatus.getByDevice, {
    deviceId: "ESP32_WATER_01",
  });

  const isOnline = deviceStatus?.online ?? false;
  const pumpOn = latest?.pumpStatus ?? false;
  const solenoidOpen = latest?.solenoidStatus ?? false;
  const uvOn = latest?.uvStatus ?? false;

  // Determine stage statuses based on device data
  const stages = [
    {
      name: "Raw Water Intake",
      status: isOnline && pumpOn ? "active" as const : "inactive" as const,
      icon: Droplets,
      description: "Untreated water collected from the source",
    },
    {
      name: "Sediment Filtration",
      status: isOnline && pumpOn ? "active" as const : "inactive" as const,
      icon: Filter,
      description: "Removes large particles, sand, and sediments",
    },
    {
      name: "Activated Layers Filtration",
      status: isOnline && pumpOn ? "active" as const : "inactive" as const,
      icon: Layers,
      description: "Removes chlorine, organic compounds, and odours",
    },
    {
      name: "UV Disinfection",
      status: uvOn ? "active" as const : "inactive" as const,
      icon: Sun,
      description: "Ultraviolet light kills bacteria and viruses",
    },
    {
      name: "Quality Monitoring",
      status: isOnline ? "active" as const : "inactive" as const,
      icon: Activity,
      description: "Sensors continuously monitor water parameters",
    },
    {
      name: "Quality Decision",
      status: isOnline ? "active" as const : "inactive" as const,
      icon: GitBranch,
      description: "System evaluates parameters against configured limits",
    },
    {
      name: "Flow Control",
      status: solenoidOpen ? "active" as const : "inactive" as const,
      icon: Waves,
      description: "Solenoid valve directs water flow based on quality",
    },
    {
      name: "Purified Water Output",
      status: isOnline && pumpOn && solenoidOpen ? "active" as const : "inactive" as const,
      icon: GlassWater,
      description: "Clean, safe water delivered to the output",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Droplets className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Purification Status</h1>
            <p className="text-sm text-muted-foreground">
              Complete water purification workflow — real-time stage status
            </p>
          </div>
        </div>

        {/* Pipeline Visualization */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stages.map((stage, index) => (
              <div key={stage.name} className="flex flex-col items-center">
                <PurificationStage
                  name={stage.name}
                  status={stage.status}
                  icon={stage.icon}
                  description={stage.description}
                  className="w-full"
                />
                {/* Arrow between stages */}
                {index < stages.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center py-2 text-muted-foreground/40">
                    {index % 4 === 3 ? null : (
                      <ArrowDown className="size-4 rotate-[-90deg]" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Sensor Readings */}
        {latest && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Current Sensor Readings
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "pH", value: latest.ph.toFixed(2), unit: "" },
                { label: "TDS", value: String(latest.tds), unit: "ppm" },
                { label: "Turbidity", value: String(latest.turbidity), unit: "NTU" },
                { label: "Temperature", value: String(latest.temperature), unit: "°C" },
                { label: "Flow Rate", value: latest.flowRate.toFixed(1), unit: "L/min" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    {item.value}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      {item.unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
