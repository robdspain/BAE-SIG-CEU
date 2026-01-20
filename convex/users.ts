import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("name"), args.name))
            .first();
    }
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("board_member"), v.literal("ace_coordinator"), v.literal("lead_instructor"), v.literal("learner")),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      status: "pending",
    });
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateStatus = mutation({
  args: { id: v.id("users"), status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateRole = mutation({
  args: { id: v.id("users"), role: v.union(v.literal("board_member"), v.literal("ace_coordinator"), v.literal("lead_instructor"), v.literal("learner")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
  },
});

export const updateSignature = mutation({
    args: { id: v.id("users"), signatureUrl: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { signatureUrl: args.signatureUrl });
    }
});
