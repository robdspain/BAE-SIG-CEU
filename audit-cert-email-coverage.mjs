import fs from "node:fs";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(name);

const legacyId = getArg("--event");
const sentPath = getArg("--sent");
const outPath = getArg("--out") || path.resolve(process.cwd(), "missing-emails.json");
const doSend = hasFlag("--send");
const dryRun = hasFlag("--dry-run");

if (!legacyId || !sentPath) {
  console.error("Usage: node audit-cert-email-coverage.mjs --event OP-04-0012 --sent sent.csv [--send] [--dry-run] [--out missing.json]");
  process.exit(1);
}

const convexUrl = process.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.error("Missing VITE_CONVEX_URL. Set it in your environment.");
  process.exit(1);
}

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

const parseSentEmails = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (!raw) return [];

  if (raw.startsWith("[")) {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data.map((item) => (typeof item === "string" ? item : item.email)).filter(Boolean);
    }
  }

  if (raw.startsWith("{")) {
    const data = JSON.parse(raw);
    const candidates = data.sent || data.emails || data.data || Object.values(data).find(Array.isArray);
    if (Array.isArray(candidates)) {
      return candidates.map((item) => (typeof item === "string" ? item : item.email)).filter(Boolean);
    }
  }

  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const header = lines[0].toLowerCase();
  if (header.includes(",") && header.includes("email")) {
    const headers = header.split(",").map((h) => h.trim());
    const emailIndex = headers.findIndex((h) => h === "email" || h.includes("email"));
    if (emailIndex >= 0) {
      return lines.slice(1).map((line) => line.split(",")[emailIndex]).filter(Boolean);
    }
  }

  return lines;
};

const client = new ConvexHttpClient(convexUrl);

const event = await client.query(api.events.getByLegacyId, { legacyId });
if (!event) {
  console.error(`Event not found for legacyId: ${legacyId}`);
  process.exit(1);
}

const attendees = await client.query(api.attendees.getByLegacyEventId, { legacyEventId: legacyId });
const attendeeEmails = attendees.map((a) => normalizeEmail(a.email)).filter(Boolean);
const attendeeSet = new Set(attendeeEmails);

const sentEmails = parseSentEmails(sentPath).map(normalizeEmail).filter(Boolean);
const sentSet = new Set(sentEmails);

const missing = attendeeEmails.filter((email) => !sentSet.has(email));
const extras = [...sentSet].filter((email) => !attendeeSet.has(email));

fs.writeFileSync(outPath, JSON.stringify(missing, null, 2));

console.log(`Attendees: ${attendeeSet.size}`);
console.log(`Sent list: ${sentSet.size}`);
console.log(`Missing: ${missing.length}`);
console.log(`Extra: ${extras.length}`);
console.log(`Missing list saved to: ${outPath}`);

if (doSend && missing.length) {
  const result = await client.action(api.emailActions.sendCertificateEmails, {
    eventId: event._id,
    recipientEmails: missing,
    dryRun,
  });
  console.log("Send result:", result);
}
