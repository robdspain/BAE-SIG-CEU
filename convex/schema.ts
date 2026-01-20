import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("board_member"), v.literal("ace_coordinator"), v.literal("lead_instructor"), v.literal("learner")),
    clerkId: v.string(),
    signatureUrl: v.optional(v.string()),
    providerId: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  }).index("by_clerk_id", ["clerkId"]).index("by_email", ["email"]).index("by_status", ["status"]),

  events: defineTable({
    legacyId: v.optional(v.string()), // For backwards compatibility with old links
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
    
    // Documents & Links
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
    
    // Quiz
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
    marketingCopy: v.optional(v.object({
        instagram: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        facebook: v.optional(v.string()),
        email: v.optional(v.string()),
    })),
    emailSubject: v.optional(v.string()),
    imagePrompt: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("completed")),
    isArchived: v.boolean(),
  }).index("by_status", ["status"]).index("by_legacy_id", ["legacyId"]),

  attendees: defineTable({
    eventId: v.id("events"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    bcbaNumber: v.optional(v.string()),
    rbtNumber: v.optional(v.string()),
    checkInTime: v.optional(v.string()),
    secretWordAnswers: v.optional(v.array(v.string())),
    feedbackSubmitted: v.optional(v.boolean()),
    certificateIssued: v.boolean(),
  }).index("by_event", ["eventId"]).index("by_email", ["email"]).index("by_event_and_email", ["eventId", "email"]),

  feedback: defineTable({
    eventId: v.id("events"),
    attendeeId: v.id("attendees"),
    rating: v.number(),
    comments: v.string(),
    timestamp: v.string(),
  }).index("by_event", ["eventId"]),

  complaints: defineTable({
    eventId: v.optional(v.id("events")),
    name: v.string(),
    email: v.string(),
    concern: v.string(),
    status: v.union(v.literal("Open"), v.literal("In Progress"), v.literal("Resolved")),
    timestamp: v.string(),
    resolutionNotes: v.optional(v.string()),
    resolvedAt: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
  }).index("by_status", ["status"]),

  lateCheckIns: defineTable({
    eventId: v.id("events"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    bcbaNumber: v.optional(v.string()),
    rbtNumber: v.optional(v.string()),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    timestamp: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
  }).index("by_status", ["status"]),

  verificationFailures: defineTable({
    email: v.string(),
    attempts: v.number(),
    timestamp: v.string(),
    details: v.optional(v.string()),
  }).index("by_email", ["email"]),

  correctionLogs: defineTable({
    attendeeId: v.id("attendees"),
    fieldChanged: v.string(),
    oldValue: v.string(),
    newValue: v.string(),
    reason: v.string(),
    adminEmail: v.string(),
    timestamp: v.string(),
  }).index("by_attendee", ["attendeeId"]),

  emailIssues: defineTable({
    requesterEmail: v.string(),
    requesterName: v.optional(v.string()),
    subject: v.string(),
    status: v.union(v.literal("open"), v.literal("resolved")),
    lastUserMessageAt: v.string(),
    messageCount: v.number(),
  }).index("by_status", ["status"]),

  emailDeliveries: defineTable({
    eventId: v.id("events"),
    attendeeId: v.id("attendees"),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    link: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("skipped")),
    provider: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
    sentAt: v.string(),
    batchId: v.optional(v.string()),
  })
    .index("by_event", ["eventId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_event_and_email", ["eventId", "email"]),

  brandConfig: defineTable({
    tone: v.string(),
    forbiddenWords: v.array(v.string()),
    examplePosts: v.array(v.string()),
    customInstructions: v.optional(v.string()),
    lastUpdated: v.string(),
  }),

  contacts: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    certificationNumber: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.string(), // e.g. "event-registration", "manual-import"
    tags: v.array(v.string()),
    lastEventId: v.optional(v.string()),
    subscribedAt: v.string(),
    status: v.union(v.literal("active"), v.literal("unsubscribed")),
  }).index("by_email", ["email"]).index("by_status", ["status"]),
});
