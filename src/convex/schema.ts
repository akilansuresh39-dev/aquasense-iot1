import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema(
  {
    // Auth tables (do not remove)
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(
        v.union(v.literal("admin"), v.literal("user"), v.literal("member"))
      ),
    }).index("email", ["email"]),

    // ─── Sensor Readings ───────────────────────────────────────────
    // Stores every reading received from ESP32 devices.
    sensorReadings: defineTable({
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
    })
      .index("by_device_time", ["deviceId", "timestamp"])
      .index("by_timestamp", ["timestamp"]),

    // ─── Quality Alerts ────────────────────────────────────────────
    // Generated when a parameter crosses its configured limit.
    alerts: defineTable({
      deviceId: v.string(),
      timestamp: v.number(),
      parameter: v.string(),
      value: v.number(),
      limitValue: v.number(),
      severity: v.string(),
      message: v.string(),
      systemResponse: v.string(),
      resolved: v.boolean(),
    })
      .index("by_timestamp", ["timestamp"])
      .index("by_resolved", ["resolved"])
      .index("by_device", ["deviceId"]),

    // ─── Quality Limits ────────────────────────────────────────────
    // Centralised configuration for monitored parameter limits.
    qualityLimits: defineTable({
      parameter: v.string(),
      minValue: v.optional(v.number()),
      maxValue: v.number(),
      unit: v.string(),
      normalMin: v.optional(v.number()),
      normalMax: v.optional(v.number()),
    }).index("by_parameter", ["parameter"]),

    // ─── Command Queue ─────────────────────────────────────────────
    // Dashboard → Backend → ESP32 control flow.
    commandQueue: defineTable({
      deviceId: v.string(),
      command: v.string(),
      timestamp: v.number(),
      executed: v.boolean(),
    }).index("by_device_executed", ["deviceId", "executed"]),

    // ─── Device Status ─────────────────────────────────────────────
    // Tracks the last known status of each ESP32 device.
    deviceStatus: defineTable({
      deviceId: v.string(),
      online: v.boolean(),
      lastSeen: v.number(),
      pump: v.boolean(),
      solenoid: v.boolean(),
      uv: v.boolean(),
      flowRate: v.number(),
    }).index("by_device", ["deviceId"]),

    // ─── System Config ─────────────────────────────────────────────
    // General key-value configuration (safety response, demo mode, etc.)
    systemConfig: defineTable({
      key: v.string(),
      value: v.string(),
    }).index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;
