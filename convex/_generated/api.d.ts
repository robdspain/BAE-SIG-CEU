/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as attendees from "../attendees.js";
import type * as brand from "../brand.js";
import type * as certificates from "../certificates.js";
import type * as complaints from "../complaints.js";
import type * as contacts from "../contacts.js";
import type * as email from "../email.js";
import type * as emailActions from "../emailActions.js";
import type * as events from "../events.js";
import type * as feedback from "../feedback.js";
import type * as files from "../files.js";
import type * as lateCheckIns from "../lateCheckIns.js";
import type * as maintenance from "../maintenance.js";
import type * as pdfGenerator from "../pdfGenerator.js";
import type * as registry from "../registry.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  attendees: typeof attendees;
  brand: typeof brand;
  certificates: typeof certificates;
  complaints: typeof complaints;
  contacts: typeof contacts;
  email: typeof email;
  emailActions: typeof emailActions;
  events: typeof events;
  feedback: typeof feedback;
  files: typeof files;
  lateCheckIns: typeof lateCheckIns;
  maintenance: typeof maintenance;
  pdfGenerator: typeof pdfGenerator;
  registry: typeof registry;
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
