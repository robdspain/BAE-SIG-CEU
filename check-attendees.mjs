import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function checkAttendees() {
  const legacyId = "OP-04-0012";
  console.log(`Checking attendees for event: ${legacyId}...`);
  
  const attendees = await client.query(api.attendees.getByLegacyEventId, { legacyEventId: legacyId });
  
  console.log(`Found ${attendees.length} attendees.`);
  
  if (attendees.length > 0) {
      console.log("Sample attendee:", attendees[0]);
  } else {
      console.warn("No attendees found! You might need to import them.");
  }
}

checkAttendees();