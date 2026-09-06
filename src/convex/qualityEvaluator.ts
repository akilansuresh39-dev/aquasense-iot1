/**
 * Quality Evaluator – action
 *
 * Evaluates sensor readings against configured quality limits.
 * Generates alerts when parameters cross thresholds and determines
 * the appropriate system safety response.
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

interface SensorReading {
  deviceId: string;
  timestamp: number;
  ph: number;
  tds: number;
  turbidity: number;
  temperature: number;
  flowRate: number;
  pumpStatus: boolean;
  solenoidStatus: boolean;
  uvStatus: boolean;
}

// Default limits (used as fallback if DB config is not yet seeded)
const DEFAULT_LIMITS: Record<
  string,
  { minValue?: number; maxValue: number; unit: string }
> = {
  ph: { minValue: 6.5, maxValue: 8.5, unit: "" },
  tds: { maxValue: 300, unit: "ppm" },
  turbidity: { maxValue: 5, unit: "NTU" },
  temperature: { minValue: 5, maxValue: 35, unit: "°C" },
};

/**
 * Evaluate a single reading against all quality limits.
 * Creates alerts for any parameters that are out of range.
 */
export const evaluateReading = action({
  args: {
    reading: v.object({
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
    }),
  },
  handler: async (ctx, { reading }) => {
    // Fetch configured limits from the database
    let limits = await ctx.runQuery(api.qualityLimits.getAll);

    // If no limits are configured, seed defaults and re-fetch
    if (limits.length === 0) {
      await ctx.runMutation(api.qualityLimits.seedDefaults);
      await ctx.runMutation(api.systemConfig.seedDefaults);
      limits = await ctx.runQuery(api.qualityLimits.getAll);
    }

    // Build a lookup map from the limits array
    const limitMap: Record<
      string,
      { minValue?: number; maxValue: number; unit: string }
    > = {};
    for (const limit of limits) {
      limitMap[limit.parameter] = {
        minValue: limit.minValue,
        maxValue: limit.maxValue,
        unit: limit.unit,
      };
    }

    // Check each parameter against its limits
    const violations: {
      parameter: string;
      value: number;
      limit: string;
      severity: string;
      message: string;
    }[] = [];

    const params = [
      { key: "ph", value: reading.ph, label: "pH" },
      { key: "tds", value: reading.tds, label: "TDS" },
      { key: "turbidity", value: reading.turbidity, label: "Turbidity" },
      { key: "temperature", value: reading.temperature, label: "Temperature" },
    ];

    for (const param of params) {
      const limit = limitMap[param.key] ?? DEFAULT_LIMITS[param.key];
      if (!limit) continue;

      let violated = false;
      let limitStr = "";

      if (limit.minValue !== undefined && param.value < limit.minValue) {
        violated = true;
        limitStr = `Min ${limit.minValue}${limit.unit}`;
      }
      if (param.value > limit.maxValue) {
        violated = true;
        limitStr = limitStr
          ? `${limitStr} / Max ${limit.maxValue}${limit.unit}`
          : `Max ${limit.maxValue}${limit.unit}`;
      }

      if (violated) {
        // Determine severity based on how far out of range
        let severity = "MEDIUM";
        if (param.key === "ph") {
          const deviation = Math.max(
            0,
            limit.maxValue - param.value,
            param.value - (limit.minValue ?? 0)
          );
          if (deviation > 2) severity = "CRITICAL";
          else if (deviation > 1) severity = "HIGH";
        } else {
          const ratio = param.value / limit.maxValue;
          if (ratio > 2) severity = "CRITICAL";
          else if (ratio > 1.5) severity = "HIGH";
        }

        violations.push({
          parameter: param.key,
          value: param.value,
          limit: limitStr,
          severity,
          message: `${param.label} exceeded monitored limit (${param.value} ${limit.unit})`,
        });
      }
    }

    // Generate alerts for violations
    for (const violation of violations) {
      // Determine system response based on severity
      let systemResponse = "Monitoring increased";
      if (violation.severity === "HIGH") {
        systemResponse = "Water flow redirected to waste outlet";
      } else if (violation.severity === "CRITICAL") {
        systemResponse = "System shutdown initiated — pump stopped, valve closed";
      }

      await ctx.runMutation(api.alerts.createAlert, {
        deviceId: reading.deviceId,
        timestamp: reading.timestamp,
        parameter: violation.parameter,
        value: violation.value,
        limitValue: parseFloat(violation.limit.replace(/[^0-9.]/g, "")),
        severity: violation.severity,
        message: violation.message,
        systemResponse,
      });
    }

    // If no violations, resolve any existing unresolved alerts
    if (violations.length === 0) {
      const unresolved = await ctx.runQuery(api.alerts.getUnresolved);
      for (const alert of unresolved) {
        if (alert.deviceId === reading.deviceId) {
          await ctx.runMutation(api.alerts.resolveAlert, {
            alertId: alert._id,
          });
        }
      }
    }

    return {
      isNormal: violations.length === 0,
      violations,
    };
  },
});
