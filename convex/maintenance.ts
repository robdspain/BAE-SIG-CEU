import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const consolidateLegacyData = mutation({
    handler: async (ctx) => {
        const targetEventId = "jd7fdm3fqajwappzs0wbs4nay17z779s" as any;
        const sourceEventId = "jd73n6wnjecrkwkg4sfsxe1yk17z6ndf" as any;

        const attendees = await ctx.db
            .query("attendees")
            .withIndex("by_event", (q) => q.eq("eventId", sourceEventId))
            .collect();

        let moved = 0;
        for (const attendee of attendees) {
            const existing = await ctx.db
                .query("attendees")
                .withIndex("by_event_and_email", q => q.eq("eventId", targetEventId).eq("email", attendee.email))
                .first();
            
            if (!existing) {
                await ctx.db.patch(attendee._id, { eventId: targetEventId });
                moved++;
            } else {
                await ctx.db.delete(attendee._id);
            }
        }
        await ctx.db.delete(sourceEventId);
        return { moved };
    }
});

export const mergeAttendeesByName = mutation({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const attendees = await ctx.db
            .query("attendees")
            .withIndex("by_event", q => q.eq("eventId", args.eventId))
            .collect();
        
        const seenNames = new Map();
        let deleted = 0;

        for (const attendee of attendees) {
            const key = `${attendee.firstName.toLowerCase().trim()}-${attendee.lastName.toLowerCase().trim()}`;
            const existing = seenNames.get(key);

            if (existing) {
                if (!attendee.email.includes("placeholder.com") && existing.email.includes("placeholder.com")) {
                    await ctx.db.delete(existing._id);
                    seenNames.set(key, attendee);
                    deleted++;
                } else {
                    await ctx.db.delete(attendee._id);
                    deleted++;
                }
            } else {
                seenNames.set(key, attendee);
            }
        }
        return deleted;
    }
});
