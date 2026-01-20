import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMyCertificates = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // Find all attendance records for this email
        const records = await ctx.db
            .query("attendees")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .collect();

        // Join with event details
        // Note: In a larger app we might store a denormalized "certificate" document
        // but for now, joining on read is fast enough for <1000 records
        const certificates = await Promise.all(records.map(async (record) => {
            const event = await ctx.db.get(record.eventId);
            return {
                ...record,
                eventTitle: event?.title || "Unknown Event",
                eventDate: event?.date || "",
                hours: event?.hours || 0,
                type: event?.type || "Learning",
                instructor: event?.instructorName || "Unknown"
            };
        }));

        return certificates.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    }
});
