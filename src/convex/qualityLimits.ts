/**
 * Quality Limits – queries and mutations
 *
 * Centralised configuration for water quality parameter limits.
 * All limits are stored in one place and used by both the backend
 * evaluation logic and the frontend display.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Get all quality limits ─────────────────────────────────────────
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("qualityLimits").collect();
  },
});

// ─── Get a specific parameter's limit ───────────────────────────────
export const getByParameter = query({
  args: { parameter: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("qualityLimits")
      .withIndex("by_parameter", (q) => q.eq("parameter", args.parameter))
      .take(1);
    return results[0] ?? null;
  },
});

// ─── Seed default limits (run once) ─────────────────────────────────
export const seedDefaults = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("qualityLimits").collect();
    if (existing.length > 0) return "already_seeded";

    const defaults = [
      {
        parameter: "ph",
        minValue: 6.5,
        maxValue: 8.5,
        unit: "",
        normalMin: 6.5,
        normalMax: 8.5,
      },
      {
        parameter: "tds",
        maxValue: 300,
        unit: "ppm",
      },
      {
        parameter: "turbidity",
        maxValue: 5,
        unit: "NTU",
      },
      {
        parameter: "temperature",
        minValue: 5,
        maxValue: 35,
        unit: "°C",
        normalMin: 5,
        normalMax: 35,
      },
    ];

    for (const limit of defaults) {
      await ctx.db.insert("qualityLimits", limit);
    }

    return "seeded";
  },
});

// ─── Update a limit ─────────────────────────────────────────────────
export const update = mutation({
  args: {
    parameter: v.string(),
    minValue: v.optional(v.number()),
    maxValue: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("qualityLimits")
      .withIndex("by_parameter", (q) => q.eq("parameter", args.parameter))
      .take(1);

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        minValue: args.minValue,
        maxValue: args.maxValue,
        unit: args.unit,
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("qualityLimits", args);
  },
});
