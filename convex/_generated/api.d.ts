/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as announcements from "../announcements.js";
import type * as appointments from "../appointments.js";
import type * as attendance from "../attendance.js";
import type * as badges from "../badges.js";
import type * as behavior from "../behavior.js";
import type * as classes from "../classes.js";
import type * as discussions from "../discussions.js";
import type * as marks from "../marks.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as pajsk from "../pajsk.js";
import type * as resources from "../resources.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  announcements: typeof announcements;
  appointments: typeof appointments;
  attendance: typeof attendance;
  badges: typeof badges;
  behavior: typeof behavior;
  classes: typeof classes;
  discussions: typeof discussions;
  marks: typeof marks;
  messages: typeof messages;
  notifications: typeof notifications;
  pajsk: typeof pajsk;
  resources: typeof resources;
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
