/**
 * Device Status – queries and mutations
 *
 * Tracks the online/offline state and last known status of each ESP32 device.
 * Used by the System Status page and connection indicators.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const OFFLINE_THRESHOLD_MS = 15_000; // 15 seconds

// ─── Get status for a specific device ───────────────────────────────
export const getByDevice = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("deviceStatus")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .take(1);

    const device = results[0];
    if (!device) return null;

    // Check if device is offline based on last seen time
    const isOnline = Date.now() - device.lastSeen < OFFLINE_THRESHOLD_MS;

    return {
      ...device,
      online: isOnline,
    };
  },
});

// ─── Get all device statuses ────────────────────────────────────────
export const getAll = query({
  handler: async (ctx) => {
    const devices = await ctx.db.query("deviceStatus").collect();
    const now = Date.now();

    return devices.map((device) => ({
      ...device,
      online: now - device.lastSeen < OFFLINE_THRESHOLD_MS,
    }));
  },
});

// ─── Update device status ──────────────────────────────────────────
export const updateStatus = mutation({
  args: {
    deviceId: v.string(),
    online: v.boolean(),
    lastSeen: v.number(),
    pump: v.boolean(),
    solenoid: v.boolean(),
    uv: v.boolean(),
    flowRate: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("deviceStatus")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .take(1);

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, args);
      return existing[0]._id;
    }

    return await ctx.db.insert("deviceStatus", args);
  },
});
