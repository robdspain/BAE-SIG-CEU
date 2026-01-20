import { query } from "./_generated/server";
import { v } from "convex/values";

// Global search for any attendee across any event
export const searchRegistry = query({
    args: { queryText: v.string() },
    handler: async (ctx, args) => {
        const searchTerm = args.queryText.toLowerCase().trim();
        if (!searchTerm) return [];

        // Search by last name or email
        const records = await ctx.db
            .query("attendees")
            .filter((q) => 
                q.or(
                    q.eq(q.field("lastName"), searchTerm),
                    q.eq(q.field("email"), searchTerm)
                )
            )
            .take(20);

        return await Promise.all(records.map(async (r) => {
            const event = await ctx.db.get(r.eventId);
            return {
                ...r,
                eventTitle: event?.title || "Unknown",
                eventDate: event?.date || "",
                providerId: event?.providerId || ""
            };
        }));
    }
});
