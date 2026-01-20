import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function importYesterdayEvent() {
  console.log("Reading exported event data...");
  const events = JSON.parse(readFileSync("../events_export.json", "utf-8"));
  const yesterdayEvent = events.find(e => e.id === "OP-04-0012");

  if (!yesterdayEvent) {
    console.error("Could not find event OP-04-0012 in export.");
    return;
  }

  console.log("Reading matched attendee data...");
  const matchedData = JSON.parse(readFileSync("../matched-attendees.json", "utf-8"));
  const attendeesToImport = matchedData.matched;

  // 1. Create/Update Event in Convex
  const eventPayload = {
    legacyId: yesterdayEvent.id, // "OP-04-0012"
    title: yesterdayEvent.courseTitle,
    description: yesterdayEvent.description || "",
    date: new Date(yesterdayEvent.eventDate).toISOString(),
    hours: yesterdayEvent.hours,
    type: yesterdayEvent.type === "Ethics" ? "Ethics" : yesterdayEvent.type === "Supervision" ? "Supervision" : "Learning",
    modality: yesterdayEvent.modality || "Online Synchronous",
    instructorName: yesterdayEvent.instructor,
    instructorExpertise: yesterdayEvent.instructorExpertise || "",
    instructorProviderId: yesterdayEvent.instructorProviderId || "",
    aceCoordinatorName: yesterdayEvent.aceCoordinator,
    aceOrganizationName: "Behavior Analysts in Education SIG",
    aceProviderType: "Organization",
    providerId: yesterdayEvent.providerId,
    syllabusUrl: yesterdayEvent.instructorSyllabusUrl || "",
    instructorCVUrl: yesterdayEvent.instructorCVUrl || "",
    slideUrl: yesterdayEvent.slideUrl || "",
    zoomUrl: yesterdayEvent.zoomUrl || "",
    recordingUrl: yesterdayEvent.recordingUrl || "",
    quiz: yesterdayEvent.quiz || [],
    learningObjectives: yesterdayEvent.learningObjectives || [],
    monitoringProcedures: yesterdayEvent.monitoringProcedures || "",
    secretWords: yesterdayEvent.secretWords || [],
    verificationMode: yesterdayEvent.verificationMode || "flexible",
    requiresFeedback: yesterdayEvent.requiresFeedback !== undefined ? yesterdayEvent.requiresFeedback : true,
    feedbackPrompt: yesterdayEvent.feedbackPrompt || "How would you rate this training?",
    status: "published",
  };

  // CHECK IF EXISTS FIRST
  console.log(`Checking for existing event ${eventPayload.legacyId}...`);
  let eventRecord = await client.query(api.events.getByLegacyId, { legacyId: eventPayload.legacyId });
  let eventId;

  if (eventRecord) {
    console.log(`Updating existing event ${eventRecord._id}...`);
    await client.mutation(api.events.update, { id: eventRecord._id, ...eventPayload });
    eventId = eventRecord._id;
  } else {
    console.log(`Creating new event...`);
    eventId = await client.mutation(api.events.create, eventPayload);
  }
  
  console.log(`✅ Event ID: ${eventId}`);

  // 2. Import Attendees
  console.log(`Importing ${attendeesToImport.length} matched attendees...`);
  let count = 0;
  for (const person of attendeesToImport) {
    try {
      await client.mutation(api.attendees.checkIn, {
        eventId,
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email.toLowerCase().trim(),
        bcbaNumber: person.bcbaNumber,
        migrationTime: person.timestamp ? new Date(person.timestamp).toISOString() : new Date().toISOString(),
      });
      count++;
      if (count % 20 === 0) console.log(`Imported ${count} attendees...`);
    } catch (err) {
      console.error(`❌ Failed to import attendee ${person.firstName} ${person.lastName}:`, err.message);
    }
  }

  console.log(`\n🎉 SUCCESS! Event and ${count} attendees synced to Convex.`);
  process.exit(0);
}

importYesterdayEvent();
