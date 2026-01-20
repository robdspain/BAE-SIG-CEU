import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function importEvents() {
  console.log("Reading legacy events data...");
  const data = JSON.parse(readFileSync("../events_export.json", "utf-8"));
  
  console.log(`Found ${data.length} events to migrate...`);

  let count = 0;
  for (const event of data) {
    try {
      // Parse date
      const dateStr = event.eventDate;
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid date for event ${event.id}: ${dateStr}`);
          continue;
      }

      // Map quiz questions
      const quiz = event.quiz?.map(q => ({
          id: q.id || `legacy-${Math.random().toString(36).substring(7)}`,
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          type: q.type || "multiple_choice"
      })) || [];

      // Validate Type
      let type = event.type;
      if (!["Learning", "Ethics", "Supervision"].includes(type)) {
          // Default to Learning if unknown or fix simple mapping
          if (type === "General") type = "Learning"; 
          else type = "Learning"; 
      }

      const eventPayload = {
        legacyId: event.id,
        title: event.courseTitle || event.name || "Untitled Event",
        description: event.description,
        date: parsedDate.toISOString(),
        startTime: event.startTime,
        endTime: event.endTime,
        hours: Number(event.hours) || 0,
        type: type,
        modality: event.modality || "Online Synchronous", // Defaulting
        instructorName: event.instructor || "Unknown",
        instructorExpertise: event.instructorExpertise,
        aceCoordinatorName: event.aceCoordinator || "System",
        aceOrganizationName: event.aceOrganizationName,
        aceProviderType: event.aceProviderType === "Organization" ? "Organization" : "Individual",
        providerId: event.providerId || "UNKNOWN",
        syllabusUrl: event.instructorSyllabusUrl,
        instructorCVUrl: event.instructorCVUrl,
        instructorSlidesUrl: event.instructorSlidesUrl,
        slideUrl: event.slideUrl,
        zoomUrl: event.zoomUrl,
        recordingUrl: event.recordingUrl,
        learningObjectives: event.learningObjectives?.filter(o => o && o.trim() !== "") || [],
        quiz: quiz,
        status: "published", // Assuming migrated events are published
        isArchived: false, // Or true if they are old? Assuming false for now to be visible
      };

      // Check if event already exists (by legacyId) to avoid duplicates
      const existing = await client.query(api.events.getByLegacyId, { legacyId: event.id });
      
      if (existing) {
          console.log(`Event ${event.id} already exists. Skipping.`);
          // Optionally update? For now, skip.
      } else {
          await client.mutation(api.events.create, eventPayload);
          console.log(`Imported event: ${eventPayload.title}`);
          count++;
      }

    } catch (err) {
      console.error(`Failed to import event ${event.id}:`, err);
    }
  }

  console.log(`
✅ SUCCESS! ${count} events imported to Convex.`);
  process.exit(0);
}

importEvents();
