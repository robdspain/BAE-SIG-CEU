import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    eventId: v.optional(v.id("events")),
    name: v.string(),
    email: v.string(),
    concern: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("complaints", {
      ...args,
      status: "Open",
      timestamp: new Date().toISOString(),
    });
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("complaints").order("desc").collect();
  },
});

export const resolve = mutation({
    args: { id: v.id("complaints"), notes: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: "Resolved",
            resolutionNotes: args.notes
        });
    }
});
