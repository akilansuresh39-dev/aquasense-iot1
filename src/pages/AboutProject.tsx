/**
 * About Project – explains the Smart Water IoT system
 *
 * Describes the complete workflow, technology stack, and project goals.
 */

import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Droplets,
  Filter,
  Layers,
  Sun,
  Activity,
  GitBranch,
  Waves,
  GlassWater,
  Cpu,
  Globe,
  BookOpen,
} from "lucide-react";

const WORKFLOW_STEPS = [
  { icon: Droplets, label: "Raw Water", desc: "Untreated water from source" },
  { icon: Filter, label: "Sediment Filtration", desc: "Removes particles and sediments" },
  { icon: Layers, label: "Activated Layers", desc: "Removes chemicals and odours" },
  { icon: Sun, label: "UV Disinfection", desc: "Kills bacteria and viruses" },
  { icon: Activity, label: "Sensor Monitoring", desc: "Continuous parameter measurement" },
  { icon: GitBranch, label: "Quality Decision", desc: "Evaluates against limits" },
  { icon: Waves, label: "Flow Control", desc: "Directs water based on quality" },
  { icon: GlassWater, label: "Purified Water", desc: "Safe, clean water output" },
];

export default function AboutProject() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">About Project</h1>
            <p className="text-sm text-muted-foreground">
              Smart Water Purification & Quality Monitoring System
            </p>
          </div>
        </div>

        {/* Project Overview */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              The <strong className="text-foreground">Smart Water Purification and Quality Monitoring
              System</strong> is designed for water purification and quality monitoring
              in <strong className="text-foreground">rural and mining-affected areas</strong> where access to
              clean, safe drinking water is limited.
            </p>
            <p>
              This system combines <strong className="text-foreground">ESP32-based hardware</strong> with
              water-quality sensors and a multi-stage purification process to provide
              real-time monitoring and automated control of water quality. The web
              dashboard enables engineers and operators to monitor the system remotely
              and make informed decisions.
            </p>
          </CardContent>
        </Card>

        {/* Purification Workflow */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Purification Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WORKFLOW_STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className="flex flex-col items-center text-center rounded-xl border border-border/60 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-2">
                    <step.icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-bold text-accent mb-1">
                    {i + 1}
                  </span>
                  <p className="text-xs font-semibold text-foreground">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Architecture */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">System Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="size-4 text-accent" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    ESP32 Hardware
                  </h4>
                </div>
                <ul className="text-xs space-y-1.5">
                  <li>• pH sensor measurement</li>
                  <li>• TDS sensor monitoring</li>
                  <li>• Turbidity sensor reading</li>
                  <li>• Temperature sensor data</li>
                  <li>• Water flow sensor</li>
                  <li>• Pump, solenoid, UV control</li>
                  <li>• Wi-Fi communication</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="size-4 text-accent" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Backend
                  </h4>
                </div>
                <ul className="text-xs space-y-1.5">
                  <li>• Convex serverless functions</li>
                  <li>• Real-time data processing</li>
                  <li>• Quality evaluation engine</li>
                  <li>• Alert generation system</li>
                  <li>• Command queue management</li>
                  <li>• Database storage</li>
                  <li>• HTTP API for ESP32</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="size-4 text-accent" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Web Dashboard
                  </h4>
                </div>
                <ul className="text-xs space-y-1.5">
                  <li>• Real-time sensor monitoring</li>
                  <li>• Interactive trend charts</li>
                  <li>• Quality alert management</li>
                  <li>• Manual device control</li>
                  <li>• Historical data analysis</li>
                  <li>• System status overview</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                "React + TypeScript",
                "Vite",
                "Convex (Backend)",
                "Tailwind CSS",
                "shadcn/ui",
                "Recharts",
                "ESP32 / Arduino",
                "Lucide Icons",
              ].map((tech) => (
                <div
                  key={tech}
                  className="rounded-lg border border-border/60 px-3 py-2 text-center font-medium text-foreground"
                >
                  {tech}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              {[
                "Real-time water quality monitoring with live charts",
                "Automated quality alerts when parameters exceed limits",
                "Configurable safety response system for abnormal conditions",
                "Manual override controls for demonstration and testing",
                "Complete sensor data history with date filtering",
                "Statistical analytics with distribution and trend charts",
                "Demo mode for presentations without physical hardware",
                "Responsive design for laptop, tablet, and mobile",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
