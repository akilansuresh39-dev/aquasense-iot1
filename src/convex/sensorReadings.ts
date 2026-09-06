/**
 * Sensor Readings – queries and mutations
 *
 * Handles storing ESP32 sensor data and retrieving it for the dashboard.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Store a new sensor reading from the ESP32 ─────────────────────
export const insertReading = mutation({
  args: {
    deviceId: v.string(),
    timestamp: v.number(),
    ph: v.number(),
    tds: v.number(),
    turbidity: v.number(),
    temperature: v.number(),
    flowRate: v.number(),
    pumpStatus: v.boolean(),
    solenoidStatus: v.boolean(),
    uvStatus: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate sensor values are within plausible ranges
    if (args.ph < 0 || args.ph > 14) throw new Error("Invalid pH value");
    if (args.tds < 0 || args.tds > 5000) throw new Error("Invalid TDS value");
    if (args.turbidity < 0 || args.turbidity > 100)
      throw new Error("Invalid turbidity value");
    if (args.temperature < -10 || args.temperature > 60)
      throw new Error("Invalid temperature value");

    const id = await ctx.db.insert("sensorReadings", args);

    // Update device status
    await upsertDeviceStatus(ctx, {
      deviceId: args.deviceId,
      online: true,
      lastSeen: args.timestamp,
      pump: args.pumpStatus,
      solenoid: args.solenoidStatus,
      uv: args.uvStatus,
      flowRate: args.flowRate,
    });

    return id;
  },
});

// ─── Get the latest sensor reading for a device ─────────────────────
export const getLatest = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const readings = await ctx.db
      .query("sensorReadings")
      .withIndex("by_device_time", (q) => q.eq("deviceId", args.deviceId))
      .order("desc")
      .take(1);
    return readings[0] ?? null;
  },
});

// ─── Get the latest reading across all devices ──────────────────────
export const getLatestAny = query({
  handler: async (ctx) => {
    const readings = await ctx.db
      .query("sensorReadings")
      .withIndex("by_timestamp")
      .order("desc")
      .take(1);
    return readings[0] ?? null;
  },
});

// ─── Get recent readings for live charts ────────────────────────────
export const getRecent = query({
  args: {
    deviceId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 60;

    if (args.deviceId) {
      return await ctx.db
        .query("sensorReadings")
        .withIndex("by_device_time", (q) =>
          q.eq("deviceId", args.deviceId!)
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("sensorReadings")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// ─── Get historical readings with optional date filtering ───────────
export const getHistory = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;

    if (args.startTime && args.endTime) {
      return await ctx.db
        .query("sensorReadings")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", args.startTime!).lte("timestamp", args.endTime!)
        )
        .order("desc")
        .take(limit);
    }

    if (args.startTime) {
      return await ctx.db
        .query("sensorReadings")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", args.startTime!)
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("sensorReadings")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// ─── Get all readings (unfiltered, for analytics) ───────────────────
export const getAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sensorReadings")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 500);
  },
});

// Helper to upsert device status
async function upsertDeviceStatus(
  ctx: any,
  data: {
    deviceId: string;
    online: boolean;
    lastSeen: number;
    pump: boolean;
    solenoid: boolean;
    uv: boolean;
    flowRate: number;
  }
) {
  const existing = await ctx.db
    .query("deviceStatus")
    .withIndex("by_device", (q: any) => q.eq("deviceId", data.deviceId))
    .take(1);

  if (existing.length > 0) {
    await ctx.db.patch(existing[0]._id, data);
  } else {
    await ctx.db.insert("deviceStatus", data);
  }
}

export { upsertDeviceStatus };
