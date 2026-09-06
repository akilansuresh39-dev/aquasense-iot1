/**
 * System Config – queries and mutations
 *
 * General key-value configuration for safety responses, thresholds, etc.
 * Values are serialised as strings; consumers parse them as needed.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Get a config value ─────────────────────────────────────────────
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .take(1);
    return results[0]?.value ?? null;
  },
});

// ─── Get all config values ──────────────────────────────────────────
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("systemConfig").collect();
  },
});

// ─── Set a config value ─────────────────────────────────────────────
export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .take(1);

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, { value: args.value });
      return existing[0]._id;
    }

    return await ctx.db.insert("systemConfig", {
      key: args.key,
      value: args.value,
    });
  },
});

// ─── Seed default safety response config ────────────────────────────
export const seedDefaults = mutation({
  handler: async (ctx) => {
    const defaults: Record<string, string> = {
      // When quality is unsafe, apply these states:
      safety_pump: "off", // off | on
      safety_solenoid: "close", // close | open | redirect
      safety_uv: "on", // on | off
      safety_flow: "stopped", // stopped | redirected | normal

      // ESP32 offline timeout (seconds)
      esp32_timeout: "15",

      // Demo mode toggle
      demo_mode: "true",

      // Device IDs (comma-separated)
      device_ids: "ESP32_WATER_01",
    };

    let seeded = 0;
    for (const [key, value] of Object.entries(defaults)) {
      const existing = await ctx.db
        .query("systemConfig")
        .withIndex("by_key", (q) => q.eq("key", key))
        .take(1);

      if (existing.length === 0) {
        await ctx.db.insert("systemConfig", { key, value });
        seeded++;
      }
    }

    return `seeded ${seeded} config entries`;
  },
});
