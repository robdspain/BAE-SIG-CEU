import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
    args: {
        eventId: v.id("events"),
        attendeeId: v.id("attendees"),
        rating: v.number(),
        comments: v.string(),
    },
    handler: async (ctx, args) => {
        // Record feedback
        await ctx.db.insert("feedback", {
            ...args,
            timestamp: new Date().toISOString(),
        });

        // Mark attendee as having submitted feedback
        await ctx.db.patch(args.attendeeId, {
            feedbackSubmitted: true
        });
    }
});

export const getByEvent = query({
    args: { eventId: v.union(v.id("events"), v.literal("all")) },
    handler: async (ctx, args) => {
        if (args.eventId === "all") {
            return await ctx.db.query("feedback").order("desc").collect();
        }
        return await ctx.db
            .query("feedback")
            .filter(q => q.eq(q.field("eventId"), args.eventId))
            .collect();
    }
});