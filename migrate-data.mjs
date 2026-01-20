import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function migrate() {
  console.log("Reading legacy data...");
  const data = JSON.parse(readFileSync("../attendees-for-ceu.json", "utf-8"));
  
  console.log(`Found ${data.length} records. Creating legacy event...`);
  
  const eventId = await client.mutation(api.events.create, {
    title: "Legacy Event Migration",
    date: new Date().toISOString(),
    hours: 1.0,
    type: "Learning",
    providerId: "LEGACY-IMPORT",
    instructorName: "Various",
    aceCoordinatorName: "System",
  });

  console.log(`Event created: ${eventId}. Importing attendees...`);

  let count = 0;
  for (const row of data) {
    try {
      await client.mutation(api.attendees.checkIn, {
        eventId,
        firstName: row.firstName || "Unknown",
        lastName: row.lastName || "Unknown",
        email: row.email,
        bcbaNumber: row.bcbaNumber,
      });
      count++;
      if (count % 50 === 0) console.log(`Imported ${count}...`);
    } catch (err) {
      console.error(`Failed: ${row.email}`, err);
    }
  }

  console.log(`\n✅ SUCCESS! ${count} attendees migrated to Convex.`);
  process.exit(0);
}

migrate();
