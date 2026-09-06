/**
 * AppLayout – main dashboard shell
 *
 * Provides the sidebar navigation, top bar with connection status,
 * and the main content area. Used by all authenticated pages.
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  LayoutDashboard,
  Activity,
  Droplets,
  SlidersHorizontal,
  AlertTriangle,
  Clock,
  BarChart3,
  Server,
  Info,
  Menu,
  X,
  Wifi,
  WifiOff,
  Droplet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/live", label: "Live Monitoring", icon: Activity },
  { path: "/dashboard/purification", label: "Purification Status", icon: Droplets },
  { path: "/dashboard/control", label: "Automatic Control", icon: SlidersHorizontal },
  { path: "/dashboard/alerts", label: "Quality Alerts", icon: AlertTriangle },
  { path: "/dashboard/history", label: "History", icon: Clock },
  { path: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/dashboard/status", label: "System Status", icon: Server },
  { path: "/dashboard/about", label: "About Project", icon: Info },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get device status for connection indicator
  const deviceStatus = useQuery(api.deviceStatus.getByDevice, {
    deviceId: "ESP32_WATER_01",
  });

  const latestReading = useQuery(api.sensorReadings.getLatestAny);
  const alertCount = useQuery(api.alerts.getCount);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isOnline = deviceStatus?.online ?? false;
  const lastUpdated = latestReading?.timestamp;

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <Droplet className="size-5 text-sidebar-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">
              Smart Water IoT
            </h1>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">
              Purification System
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.label === "Quality Alerts" && alertCount !== undefined && alertCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {alertCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
            {isOnline ? (
              <Wifi className="size-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="size-3.5 text-red-400" />
            )}
            <span>ESP32 {isOnline ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary/20">
                  <Droplet className="size-5 text-sidebar-primary" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-sidebar-foreground">
                    Smart Water IoT
                  </h1>
                  <p className="text-xs text-sidebar-foreground/50">
                    Purification System
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.path === "/dashboard"
                      ? location.pathname === "/dashboard"
                      : location.pathname.startsWith(item.path);
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => navigate(item.path)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                          isActive
                            ? "bg-sidebar-primary/15 text-sidebar-primary"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 lg:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-foreground/70 hover:text-foreground cursor-pointer"
          >
            <Menu className="size-5" />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              Smart Water Purification & Quality Monitoring System
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rural & Mining-Affected Areas
            </p>
          </div>

          {/* Status indicators */}
          <div className="hidden sm:flex items-center gap-4">
            {/* ESP32 connection */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "size-2 rounded-full",
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )}
              />
              <span className="text-xs font-medium text-muted-foreground">
                ESP32 {isOnline ? "Connected" : "Offline"}
              </span>
            </div>

            {/* IoT connection */}
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">
                IoT Online
              </span>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated{" "}
                {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
