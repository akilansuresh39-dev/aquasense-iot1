/**
 * Cron Jobs – scheduled tasks
 *
 * - Demo mode: generates sensor readings every 5 seconds when enabled.
 * - Device health: marks ESP32 devices as offline when no data received.
 */

import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// ─── Demo Mode: generate sensor readings every 5 seconds ────────────
// This runs when DEMO_MODE is enabled in system config.
// The action itself checks the config before generating data.
crons.interval(
  "demo-sensor-readings",
  { minutes: 5 },
  api.demoMode.generateReading
);

export default crons;
