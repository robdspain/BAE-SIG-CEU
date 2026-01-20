import { query } from "./_generated/server";

export const getStats = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const attendees = await ctx.db.query("attendees").collect();
    const complaints = await ctx.db.query("complaints").collect();
    const feedback = await ctx.db.query("feedback").collect();
    const lateCheckIns = await ctx.db.query("lateCheckIns").collect();
    const users = await ctx.db.query("users").collect();

    return {
      eventCount: events.length,
      attendeeCount: attendees.length,
      openComplaints: complaints.filter(c => c.status === "Open").length,
      avgRating: feedback.length > 0 ? feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length : 0,
      pendingLateCheckIns: lateCheckIns.filter(l => l.status === "pending").length,
      pendingUsers: users.filter(u => u.status === "pending").length,
    };
  },
});

export const getCorrectionLogs = query({
    handler: async (ctx) => {
        const logs = await ctx.db.query("correctionLogs").order("desc").collect();
        return await Promise.all(logs.map(async log => {
            const attendee = await ctx.db.get(log.attendeeId);
            return {
                ...log,
                attendeeName: attendee ? `${attendee.firstName} ${attendee.lastName}` : "Unknown"
            };
        }));
    }
});

export const getVerificationFailures = query({
    handler: async (ctx) => {
        return await ctx.db.query("verificationFailures").order("desc").collect();
    }
});
