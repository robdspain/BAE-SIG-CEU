import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function listEvents() {
  console.log("Listing all events in Convex...");
  const events = await client.query(api.events.getAll);
  
  if (events.length === 0) {
      console.log("No events found.");
  } else {
      console.log(`Found ${events.length} events:`);
      events.forEach(e => {
          console.log(`- [${e.legacyId || "NO_LEGACY_ID"}] ${e.title} (Status: ${e.status}, Date: ${e.date})`);
      });
  }
  process.exit(0);
}

listEvents();
