/**
 * Command Queue – queries and mutations
 *
 * Manages the control flow: Dashboard → Backend → ESP32.
 * Commands are queued and polled by the ESP32.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Queue a command for a device ───────────────────────────────────
export const queueCommand = mutation({
  args: {
    deviceId: v.string(),
    command: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate command type
    const validCommands = [
      "pump_on",
      "pump_off",
      "solenoid_open",
      "solenoid_close",
      "uv_on",
      "uv_off",
    ];
    if (!validCommands.includes(args.command)) {
      throw new Error(`Invalid command: ${args.command}`);
    }

    return await ctx.db.insert("commandQueue", {
      deviceId: args.deviceId,
      command: args.command,
      timestamp: Date.now(),
      executed: false,
    });
  },
});

// ─── Get next unexecuted command for a device (ESP32 polls this) ────
export const getNextCommand = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("commandQueue")
      .withIndex("by_device_executed", (q) =>
        q.eq("deviceId", args.deviceId).eq("executed", false)
      )
      .order("asc")
      .take(1);

    return pending[0] ?? null;
  },
});

// ─── Mark a command as executed ─────────────────────────────────────
export const markExecuted = mutation({
  args: { commandId: v.id("commandQueue") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commandId, { executed: true });
  },
});

// ─── Get command history for a device ───────────────────────────────
export const getHistory = query({
  args: {
    deviceId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.deviceId) {
      return await ctx.db
        .query("commandQueue")
        .withIndex("by_device_executed", (q) =>
          q.eq("deviceId", args.deviceId!)
        )
        .order("desc")
        .take(limit);
    }

    // Return all commands if no device specified
    return await ctx.db
      .query("commandQueue")
      .filter((q) => q.eq(q.field("executed"), true))
      .order("desc")
      .take(limit);
  },
});
