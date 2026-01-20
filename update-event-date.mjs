import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function updateEventDate() {
  console.log("Fetching event...");
  const event = await client.query(api.events.getByLegacyId, { legacyId: "OP-04-0012" });
  
  if (!event) {
      console.error("Event not found!");
      process.exit(1);
  }

  console.log(`Updating event: ${event.title}`);
  
  // Set date to today (Jan 14, 2026)
  const newDate = new Date("2026-01-14T12:00:00.000Z");

  // Prepare payload
  const payload = { ...event };
  
  // Remove problematic fields
  delete payload._id;
  delete payload._creationTime;
  delete payload.isArchived;
  delete payload.emailSubject;
  delete payload.documents;
  
  // Set the fields for the update mutation
  payload.id = event._id;
  payload.date = newDate.toISOString();

  console.log("Keys being sent:", Object.keys(payload));

  try {
      await client.mutation(api.events.update, payload);
      console.log(`✅ Updated date to: ${newDate.toISOString()}`);
  } catch (err) {
      console.error("Failed to update event:", err);
  }
  process.exit(0);
}

updateEventDate();
