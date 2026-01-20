import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    eventId: v.id("events"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    bcbaNumber: v.optional(v.string()),
    rbtNumber: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lateCheckIns", {
      ...args,
      status: "pending",
      timestamp: new Date().toISOString(),
    });
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("lateCheckIns").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: { 
    id: v.id("lateCheckIns"), 
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
    reviewedBy: v.string()
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
        ...updates,
        reviewNotes: args.notes
    });
  },
});
