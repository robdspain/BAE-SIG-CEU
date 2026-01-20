import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const eventFields = {
    legacyId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    hours: v.number(),
    type: v.union(v.literal("Learning"), v.literal("Ethics"), v.literal("Supervision")),
    modality: v.optional(v.union(v.literal("In-Person"), v.literal("Online Synchronous"), v.literal("Online Asynchronous"))),
    instructorName: v.string(),
    instructorExpertise: v.optional(v.string()),
    instructorProviderId: v.optional(v.string()),
    aceCoordinatorName: v.string(),
    aceOrganizationName: v.optional(v.string()),
    aceProviderType: v.optional(v.union(v.literal("Organization"), v.literal("Individual"))),
    providerId: v.string(),
    syllabusUrl: v.optional(v.string()),
    instructorCVUrl: v.optional(v.string()),
    instructorSlidesUrl: v.optional(v.string()),
    slideUrl: v.optional(v.string()),
    zoomUrl: v.optional(v.string()),
    recordingUrl: v.optional(v.string()),
    documents: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        url: v.string(),
        fileType: v.string(),
        uploadedAt: v.string(),
    }))),
    learningObjectives: v.optional(v.array(v.string())),
    monitoringProcedures: v.optional(v.string()),
    quiz: v.optional(v.array(v.object({
        id: v.string(),
        question: v.string(),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.string(),
        type: v.string(),
    }))),
    secretWords: v.optional(v.array(v.string())),
    verificationMode: v.optional(v.union(v.literal("strict"), v.literal("flexible"))),
    requiresFeedback: v.optional(v.boolean()),
    feedbackPrompt: v.optional(v.string()),
    imagePrompt: v.optional(v.string()),
    marketingCopy: v.optional(v.object({
        instagram: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        facebook: v.optional(v.string()),
        email: v.optional(v.string()),
    })),
    emailSubject: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("completed")),
    isArchived: v.optional(v.boolean()),
};

export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("events").order("desc").collect();
    }
});

export const getByLegacyId = query({
    args: { legacyId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("events")
            .withIndex("by_legacy_id", q => q.eq("legacyId", args.legacyId))
            .first();
    }
});

export const getActive = query({
    handler: async (ctx) => {
        return await ctx.db.query("events").withIndex("by_status", q => q.eq("status", "published")).order("desc").first();
    }
});

export const create = mutation({
    args: eventFields,
    handler: async (ctx, args) => {
        return await ctx.db.insert("events", {
            ...args,
            isArchived: false,
        });
    }
});

export const update = mutation({
    args: { id: v.id("events"), ...eventFields },
        handler: async (ctx, args) => {
            const { id, ...fields } = args;
            await ctx.db.patch(id, fields);
        }
    });
    
    export const deduplicate = mutation({
        handler: async (ctx) => {
            const events = await ctx.db.query("events").collect();
            const seen = new Map();
            let deleted = 0;
                        for (const event of events) {
    
                        const key = `${event.title}-${event.date}`;
    
                        const existing = seen.get(key);
    
                        
    
                        if (existing) {
    
                            // If the new one has a legacyId and the old one doesn't, swap them so we delete the one without legacyId
    
                            if (event.legacyId && !existing.legacyId) {
    
                                await ctx.db.delete(existing._id);
    
                                // Cleanup orphans for the one we just deleted
    
                                const attendees = await ctx.db.query("attendees").withIndex("by_event", q => q.eq("eventId", existing._id)).collect();
    
                                for (const attendee of attendees) await ctx.db.delete(attendee._id);
    
                                
    
                                seen.set(key, event);
    
                                deleted++;
    
                            } else {
    
                                // Delete the current one
    
                                await ctx.db.delete(event._id);
    
                                const attendees = await ctx.db.query("attendees").withIndex("by_event", q => q.eq("eventId", event._id)).collect();
    
                                for (const attendee of attendees) await ctx.db.delete(attendee._id);
    
                                deleted++;
    
                            }
    
                        } else {
    
                            seen.set(key, event);
    
                        }
    
                    }
    
            
            return deleted;
        }
    });
    