import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("brandConfig").first();
  },
});

export const update = mutation({
  args: {
    tone: v.string(),
    forbiddenWords: v.array(v.string()),
    examplePosts: v.array(v.string()),
    customInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("brandConfig").first();
    const data = {
        ...args,
        lastUpdated: new Date().toISOString(),
    };

    if (existing) {
        await ctx.db.patch(existing._id, data);
    } else {
        await ctx.db.insert("brandConfig", data);
    }
  },
});
