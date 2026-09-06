/**
 * Alerts – queries and mutations
 *
 * Manages water quality alerts generated when parameters cross limits.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Create a new alert ─────────────────────────────────────────────
export const createAlert = mutation({
  args: {
    deviceId: v.string(),
    timestamp: v.number(),
    parameter: v.string(),
    value: v.number(),
    limitValue: v.number(),
    severity: v.string(),
    message: v.string(),
    systemResponse: v.string(),
  },
  handler: async (ctx, args) => {
    // Prevent duplicate alerts: check if an identical unresolved alert
    // already exists for the same parameter and device within the last 60s
    const recent = await ctx.db
      .query("alerts")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .order("desc")
      .take(20);

    const duplicate = recent.find(
      (a) =>
        a.parameter === args.parameter &&
        !a.resolved &&
        args.timestamp - a.timestamp < 60_000
    );

    if (duplicate) return duplicate._id;

    return await ctx.db.insert("alerts", {
      ...args,
      resolved: false,
    });
  },
});

// ─── Resolve an alert ───────────────────────────────────────────────
export const resolveAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { resolved: true });
  },
});

// ─── Resolve all alerts for a device ────────────────────────────────
export const resolveAll = mutation({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const unresolved = await ctx.db
      .query("alerts")
      .withIndex("by_resolved", (q) => q.eq("resolved", false))
      .collect();

    for (const alert of unresolved) {
      if (alert.deviceId === args.deviceId) {
        await ctx.db.patch(alert._id, { resolved: true });
      }
    }
  },
});

// ─── Get all alerts (newest first) ──────────────────────────────────
export const getAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 100);
  },
});

// ─── Get unresolved alerts ──────────────────────────────────────────
export const getUnresolved = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_resolved", (q) => q.eq("resolved", false))
      .order("desc")
      .take(50);
  },
});

// ─── Get alert count ────────────────────────────────────────────────
export const getCount = query({
  handler: async (ctx) => {
    const unresolved = await ctx.db
      .query("alerts")
      .withIndex("by_resolved", (q) => q.eq("resolved", false))
      .collect();
    return unresolved.length;
  },
});
