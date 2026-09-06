/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alerts from "../alerts.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as commandQueue from "../commandQueue.js";
import type * as crons from "../crons.js";
import type * as demoMode from "../demoMode.js";
import type * as deviceStatus from "../deviceStatus.js";
import type * as http from "../http.js";
import type * as qualityEvaluator from "../qualityEvaluator.js";
import type * as qualityLimits from "../qualityLimits.js";
import type * as sensorReadings from "../sensorReadings.js";
import type * as systemConfig from "../systemConfig.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alerts: typeof alerts;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  commandQueue: typeof commandQueue;
  crons: typeof crons;
  demoMode: typeof demoMode;
  deviceStatus: typeof deviceStatus;
  http: typeof http;
  qualityEvaluator: typeof qualityEvaluator;
  qualityLimits: typeof qualityLimits;
  sensorReadings: typeof sensorReadings;
  systemConfig: typeof systemConfig;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
