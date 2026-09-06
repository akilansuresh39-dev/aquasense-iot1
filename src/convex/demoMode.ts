/**
 * Demo Mode – actions
 *
 * Generates realistic sensor readings when the ESP32 is not connected.
 * Uses the same processing pipeline as real data: validate → store → evaluate → alert.
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Realistic base values with slight variations
const BASE_VALUES = {
  ph: 7.2,
  tds: 145,
  turbidity: 1.6,
  temperature: 27.5,
  flowRate: 2.3,
};

// Generate a random variation around a base value
function vary(base: number, range: number): number {
  return Math.round((base + (Math.random() - 0.5) * range) * 100) / 100;
}

// Generate occasional anomalous readings for demo alerts
function shouldAnomaly(): boolean {
  return Math.random() < 0.08; // 8% chance of anomaly
}

/**
 * Generate and process a single demo sensor reading.
 * Called by the cron job every 5 seconds when DEMO_MODE is true.
 */
export const generateReading = action({
  args: {},
  handler: async (ctx) => {
    const deviceId = "ESP32_WATER_01";
    const timestamp = Date.now();

    // Generate realistic values with small random variations
    let ph = vary(BASE_VALUES.ph, 0.4);
    let tds = vary(BASE_VALUES.tds, 30);
    let turbidity = vary(BASE_VALUES.turbidity, 0.8);
    let temperature = vary(BASE_VALUES.temperature, 2);

    // Occasionally generate anomalous values to trigger alerts
    if (shouldAnomaly()) {
      const anomalyType = Math.random();
      if (anomalyType < 0.3) {
        turbidity = vary(7.0, 2); // High turbidity
      } else if (anomalyType < 0.5) {
        ph = vary(9.0, 0.5); // High pH
      } else if (anomalyType < 0.7) {
        tds = vary(450, 50); // High TDS
      } else {
        temperature = vary(40, 3); // High temperature
      }
    }

    const reading = {
      deviceId,
      timestamp,
      ph,
      tds,
      turbidity,
      temperature,
      flowRate: vary(BASE_VALUES.flowRate, 0.5),
      pumpStatus: true,
      solenoidStatus: true,
      uvStatus: true,
    };

    // Store the reading (same pipeline as real ESP32 data)
    await ctx.runMutation(api.sensorReadings.insertReading, reading);

    // Evaluate quality and generate alerts if needed
    await ctx.runAction(api.qualityEvaluator.evaluateReading, {
      reading,
    });

    return reading;
  },
});
