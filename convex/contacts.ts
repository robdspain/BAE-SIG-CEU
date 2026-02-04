import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("contacts").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    certificationNumber: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.string(),
    tags: v.array(v.string()),
    lastEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      // Merge tags
      const newTags = Array.from(new Set([...existing.tags, ...args.tags]));
      await ctx.db.patch(existing._id, {
        ...args,
        email,
        tags: newTags,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("contacts", {
        ...args,
        email,
        subscribedAt: new Date().toISOString(),
        status: "active",
      });
    }
  },
});

export const batchUpsert = mutation({
    args: { 
        contacts: v.array(v.object({
            email: v.string(),
            firstName: v.string(),
            lastName: v.string(),
            organization: v.optional(v.string()),
            certificationNumber: v.optional(v.string()),
            phone: v.optional(v.string()),
            source: v.string(),
            tags: v.array(v.string()),
            lastEventId: v.optional(v.string()),
        }))
    },
    handler: async (ctx, args) => {
        let success = 0;
        let failed = 0;
        for (const contact of args.contacts) {
            try {
                const email = contact.email.toLowerCase().trim();
                const existing = await ctx.db
                    .query("contacts")
                    .withIndex("by_email", (q) => q.eq("email", email))
                    .unique();

                if (existing) {
                    const newTags = Array.from(new Set([...existing.tags, ...contact.tags]));
                    await ctx.db.patch(existing._id, { ...contact, email, tags: newTags });
                } else {
                    await ctx.db.insert("contacts", {
                        ...contact,
                        email,
                        subscribedAt: new Date().toISOString(),
                        status: "active",
                    });
                }
                success++;
            } catch (e) {
                failed++;
            }
        }
        return { success, failed };
    }
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Sync all existing attendees to contacts table
export const syncFromAttendees = mutation({
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    let synced = 0;
    let skipped = 0;

    for (const attendee of attendees) {
      const email = attendee.email.toLowerCase().trim();
      
      const existing = await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();

      if (existing) {
        // Update with latest info and merge tags
        const newTags = Array.from(new Set([...existing.tags, `event-${attendee.eventId}`]));
        await ctx.db.patch(existing._id, {
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          certificationNumber: attendee.bcbaNumber || attendee.rbtNumber || existing.certificationNumber,
          tags: newTags,
          lastEventId: String(attendee.eventId),
        });
        skipped++;
      } else {
        await ctx.db.insert("contacts", {
          email,
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          certificationNumber: attendee.bcbaNumber || attendee.rbtNumber,
          source: "event-checkin",
          tags: [`event-${attendee.eventId}`],
          lastEventId: String(attendee.eventId),
          subscribedAt: attendee.checkInTime || new Date().toISOString(),
          status: "active",
        });
        synced++;
      }
    }

    return { synced, updated: skipped, total: attendees.length };
  },
});
