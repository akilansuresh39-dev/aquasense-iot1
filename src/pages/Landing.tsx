/**
 * Landing – public landing page for the Smart Water IoT project
 *
 * A visually stunning water-themed landing page that connects
 * to auth and the dashboard with clear calls to action.
 */

import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Droplets,
  Shield,
  Activity,
  Wifi,
  ArrowRight,
  Waves,
  Sun,
  Filter,
  GlassWater,
  ChevronRight,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Section ── */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,80%,15%)] via-[hsl(200,70%,20%)] to-[hsl(180,60%,18%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20 sm:pt-12 sm:pb-28">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-16 sm:mb-24">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Droplets className="size-6 text-cyan-300" />
              </div>
              <span className="text-lg font-bold text-white">Smart Water IoT</span>
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="rounded-lg bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </nav>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 mb-6">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-cyan-200">
                IoT-Powered Water Monitoring
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Smart Water Purification
              <span className="block text-cyan-300 mt-2">
                & Quality Monitoring
              </span>
            </h1>

            <p className="mt-6 text-lg text-cyan-100/70 max-w-2xl mx-auto leading-relaxed">
              An ESP32-based IoT system for real-time water quality monitoring
              and purification control, designed for rural and mining-affected
              areas.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[hsl(210,80%,20%)] hover:bg-white/90 transition-colors cursor-pointer shadow-lg shadow-black/20"
              >
                Access Dashboard
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0 60V30C240 10 480 50 720 30C960 10 1200 50 1440 30V60H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </header>

      {/* ── Features Section ── */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Complete IoT Water Monitoring
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Real-time sensor data flows from ESP32 hardware through to a live
              web dashboard with automated quality control.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Activity,
                title: "Real-Time Monitoring",
                desc: "Live pH, TDS, turbidity, and temperature readings with auto-updating charts.",
                color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
              },
              {
                icon: Shield,
                title: "Quality Alerts",
                desc: "Automatic alerts when parameters exceed configured safety limits.",
                color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
              },
              {
                icon: Wifi,
                title: "ESP32 Integration",
                desc: "Seamless communication between hardware sensors and the web dashboard.",
                color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
              },
              {
                icon: Waves,
                title: "Automated Control",
                desc: "Smart pump, solenoid, and UV control based on water quality decisions.",
                color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${feature.color} mb-4`}
                >
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Purification Workflow Section ── */}
      <section className="py-16 sm:py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Multi-Stage Purification
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              From raw water to purified output — every stage is monitored and controlled.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { icon: Droplets, label: "Raw Water" },
              { icon: Filter, label: "Sediment" },
              { icon: GlassWater, label: "Carbon" },
              { icon: Sun, label: "UV" },
              { icon: Activity, label: "Monitoring" },
              { icon: Waves, label: "Output" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-card border border-border shadow-sm">
                    <step.icon className="size-5 text-accent" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground mt-1.5">
                    {step.label}
                  </span>
                </div>
                {i < 5 && (
                  <ChevronRight className="size-4 text-muted-foreground/40 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Ready to Monitor Water Quality?
            </h2>
            <p className="mt-3 text-muted-foreground mb-8">
              Access the real-time dashboard to view sensor data, receive alerts,
              and control the purification system.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
            >
              Get Started
              <ArrowRight className="size-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="size-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              Smart Water IoT
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Smart Water Purification & Quality Monitoring System for Rural and
            Mining-Affected Areas
          </p>
        </div>
      </footer>
    </div>
  );
}
