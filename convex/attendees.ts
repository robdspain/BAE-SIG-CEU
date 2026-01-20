import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Check in a user for an event
export const checkIn = mutation({
  args: {
    eventId: v.id("events"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    bcbaNumber: v.optional(v.string()),
    rbtNumber: v.optional(v.string()),
    secretWordAnswers: v.optional(v.array(v.string())),
    migrationTime: v.optional(v.string()), // Renamed to ensure uniqueness in validator sync
  },
  handler: async (ctx, args) => {
    // Normalize email
    const email = args.email.toLowerCase().trim();

    // 1. Check if already registered
    const existing = await ctx.db
      .query("attendees")
      .withIndex("by_event_and_email", (q) => 
        q.eq("eventId", args.eventId).eq("email", email)
      )
      .first();

    const timestamp = args.migrationTime || new Date().toISOString();

    // CRM Integration: Sync attendee to contacts table
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const contactData = {
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      certificationNumber: args.bcbaNumber || args.rbtNumber,
      source: "event-checkin",
      lastEventId: args.eventId,
    };

    if (contact) {
      const newTags = Array.from(new Set([...contact.tags, `event-${args.eventId}`]));
      await ctx.db.patch(contact._id, { ...contactData, tags: newTags });
    } else {
      await ctx.db.insert("contacts", {
        ...contactData,
        tags: [`event-${args.eventId}`],
        subscribedAt: new Date().toISOString(),
        status: "active",
      });
    }

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        checkInTime: timestamp, 
        firstName: args.firstName,
        lastName: args.lastName,
        bcbaNumber: args.bcbaNumber,
        rbtNumber: args.rbtNumber,
        secretWordAnswers: args.secretWordAnswers,
      });
      return { id: existing._id, status: "updated" };
    } else {
      // Create new record
      const newId = await ctx.db.insert("attendees", {
        eventId: args.eventId,
        firstName: args.firstName,
        lastName: args.lastName,
        email: email,
        bcbaNumber: args.bcbaNumber,
        rbtNumber: args.rbtNumber,
        checkInTime: timestamp,
        secretWordAnswers: args.secretWordAnswers,
        certificateIssued: false,
      });
      return { id: newId, status: "created" };
    }
  },
});

export const getAttendeeByEmail = query({
    args: { eventId: v.id("events"), email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("attendees")
            .withIndex("by_event_and_email", (q) => 
                q.eq("eventId", args.eventId).eq("email", args.email.toLowerCase().trim())
            )
            .first();
    }
});

export const getByEvent = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("attendees")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .collect();
    }
});

export const getByEventUnindexed = query({
    args: { eventId: v.string() },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("attendees").collect();
        return all.filter(a => a.eventId === args.eventId);
    }
});

export const getByLegacyEventId = query({
    args: { legacyEventId: v.string() },
    handler: async (ctx, args) => {
        const event = await ctx.db
            .query("events")
            .withIndex("by_legacy_id", q => q.eq("legacyId", args.legacyEventId))
            .first();
        if (!event) return [];
        
        return await ctx.db
            .query("attendees")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect();
    }
});

export const getById = query({
    args: { id: v.id("attendees") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
});

export const getAllGlobal = query({
    handler: async (ctx) => {
        return await ctx.db.query("attendees").order("desc").collect();
    }
});

export const deduplicate = mutation({
    handler: async (ctx) => {
        const attendees = await ctx.db.query("attendees").collect();
        const seen = new Map();
        let deleted = 0;

        for (const attendee of attendees) {
            const key = `${attendee.eventId}-${attendee.email.toLowerCase().trim()}`;
            const existing = seen.get(key);

            if (existing) {
                // Keep the one with a checkInTime if available
                if (attendee.checkInTime && !existing.checkInTime) {
                    await ctx.db.delete(existing._id);
                    seen.set(key, attendee);
                    deleted++;
                } else {
                    await ctx.db.delete(attendee._id);
                    deleted++;
                }
            } else {
                seen.set(key, attendee);
            }
        }
        return deleted;
    }
});
