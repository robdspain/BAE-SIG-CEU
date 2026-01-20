import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logDelivery = mutation({
  args: {
    eventId: v.id("events"),
    attendeeId: v.id("attendees"),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    link: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("skipped")),
    provider: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
    sentAt: v.string(),
    batchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailDeliveries", args);
  },
});

export const getDeliveriesByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailDeliveries")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});
