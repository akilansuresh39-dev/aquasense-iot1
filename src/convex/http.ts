/**
 * HTTP Routes – ESP32 communication endpoints
 *
 * Provides HTTP endpoints that the ESP32 can call over the local network:
 *   POST /api/device/data      – receive sensor data
 *   GET  /api/device/commands/:deviceId – ESP32 polls for commands
 *   POST /api/device/command/ack        – acknowledge command execution
 *   GET  /api/health            – health check
 *
 * NOTE: ESP32 communicates via HTTP (not WebSocket/Socket.IO).
 * The Convex real-time subscriptions handle the dashboard updates.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Auth routes (do not remove)
auth.addHttpRoutes(http);

// ─── POST /api/device/data ──────────────────────────────────────────
// ESP32 sends sensor readings here. Data is validated, stored, and
// then the quality evaluator runs to check for limit violations.
http.route({
  path: "/api/device/data",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      // Validate required fields
      const required = [
        "deviceId",
        "ph",
        "tds",
        "turbidity",
        "temperature",
        "flowRate",
      ];
      for (const field of required) {
        if (body[field] === undefined) {
          return new Response(
            JSON.stringify({ error: `Missing required field: ${field}` }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // Validate sensor ranges
      if (body.ph < 0 || body.ph > 14) {
        return new Response(
          JSON.stringify({ error: "Invalid pH value (must be 0-14)" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const reading = {
        deviceId: String(body.deviceId),
        timestamp: Date.now(),
        ph: Number(body.ph),
        tds: Number(body.tds),
        turbidity: Number(body.turbidity),
        temperature: Number(body.temperature),
        flowRate: Number(body.flowRate),
        pumpStatus: Boolean(body.pump ?? body.pumpStatus ?? true),
        solenoidStatus: Boolean(
          body.solenoid ?? body.solenoidStatus ?? true
        ),
        uvStatus: Boolean(body.uv ?? body.uvStatus ?? true),
      };

      // Store the reading
      await ctx.runMutation(
        api.sensorReadings.insertReading,
        reading
      );

      // Evaluate quality
      await ctx.runAction(
        api.qualityEvaluator.evaluateReading,
        { reading }
      );

      return new Response(
        JSON.stringify({ status: "ok", timestamp: reading.timestamp }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// ─── GET /api/device/commands/:deviceId ─────────────────────────────
// ESP32 polls this endpoint to retrieve pending control commands.
http.route({
  path: "/api/device/commands/:deviceId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const deviceId = url.pathname.split("/").pop();

      if (!deviceId) {
        return new Response(
          JSON.stringify({ error: "Missing deviceId" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const command = await ctx.runQuery(
        api.commandQueue.getNextCommand,
        { deviceId }
      );

      if (command) {
        // Mark as executed
        await ctx.runMutation(api.commandQueue.markExecuted, {
          commandId: command._id,
        });
      }

      return new Response(
        JSON.stringify({ command: command?.command ?? null }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// ─── GET /api/health ────────────────────────────────────────────────
// Simple health check endpoint for monitoring.
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "healthy",
        timestamp: Date.now(),
        service: "Smart Water IoT Backend",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;
