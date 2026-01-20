"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { generateCertificatePDF } from "./pdfGenerator";
import type { CertificateInfo } from "./pdfGenerator";

type SendStatus = "sent" | "failed" | "skipped";
type DeliverySummary = {
  batchId: string;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
};

const EMAIL_PROVIDER = "gmail";
const DEFAULT_FROM_EMAIL = "california.bae.sig@gmail.com";
const DEFAULT_APP_URL = "https://bae-sig-ceu.web.app";

const normalizeEmail = (value?: string) => (value || "").trim().toLowerCase();

const buildCertificateLink = (
  appUrl: string,
  eventPublicId: string,
  attendee: { _id: string; email: string; bcbaNumber?: string | null; rbtNumber?: string | null; firstName?: string | null; lastName?: string | null }
) => {
  const params = new URLSearchParams();
  params.set("cert", attendee._id);
  params.set("email", attendee.email);
  const certNumber = attendee.bcbaNumber || attendee.rbtNumber;
  if (certNumber) params.set("bcba", certNumber);
  if (attendee.firstName) params.set("first", attendee.firstName);
  if (attendee.lastName) params.set("last", attendee.lastName);
  return `${appUrl}/event/${eventPublicId}?${params.toString()}`;
};

const buildEmailText = (
  event: { title: string; hours: number; type: string; legacyId?: string | null; providerId?: string | null },
  attendee: { _id: string; firstName?: string | null; lastName?: string | null },
  link: string
) => {
  const eventId = event.legacyId || event.providerId || "UNKNOWN";
  return [
    "Download your certificate:",
    link,
    "",
    `Dear ${attendee.firstName || ""} ${attendee.lastName || ""}`.trim() + ",",
    "",
    `Thank you for attending "${event.title}".`,
    "",
    "Your CEU certificate is now ready! Download it using the link above.",
    "",
    "Certificate Details:",
    `- Event ID: ${eventId}`,
    `- Certificate ID: ${attendee._id}`,
    `- CEU Hours: ${event.hours}`,
    `- Type: ${event.type}`,
    "",
    "If you have any questions, please don't hesitate to reach out.",
    "",
    "Best regards,",
    "BAE SIG CEU Registry Team",
  ].join("\n");
};

const buildEmailHtml = (text: string, link: string) => {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(link, `<a href="${link}">Download Certificate</a><br/>${link}`)
    .replace(/\n/g, "<br/>");
  return `<div style="font-family: Arial, sans-serif; line-height: 1.5;">${html}</div>`;
};

const base64UrlEncode = (value: string) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const getGmailAccessToken = async (clientId: string, clientSecret: string, refreshToken: string) => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    const message = payload.error_description || payload.error || "Failed to fetch Gmail access token.";
    throw new Error(message);
  }
  return payload.access_token as string;
};

const buildRawMessage = (
  fromName: string | undefined,
  fromEmail: string,
  toEmail: string,
  subject: string,
  text: string,
  html: string,
  attachment?: { filename: string; content: string; contentType: string }
) => {
  const boundary = `boundary_${Date.now()}`;
  const fromHeader = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  const parts = [
    `From: ${fromHeader}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="alt_${boundary}"`,
    "",
    `--alt_${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
    "",
    `--alt_${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
    "",
    `--alt_${boundary}--`,
  ];

  if (attachment) {
    parts.push(
      "",
      `--${boundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      "",
      attachment.content
    );
  }

  parts.push("", `--${boundary}--`);
  return parts.join("\r\n");
};

const sendWithGmail = async (
  accessToken: string,
  fromName: string | undefined,
  fromEmail: string,
  toEmail: string,
  subject: string,
  text: string,
  html: string,
  attachment?: { filename: string; content: string; contentType: string }
) => {
  const raw = buildRawMessage(fromName, fromEmail, toEmail, subject, text, html, attachment);
  const encoded = base64UrlEncode(raw);

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload.error?.message || "Gmail send failed.";
    return { ok: false, error: message };
  }

  return { ok: true, id: payload.id };
};

export const sendCertificateEmails = action({
  args: {
    eventId: v.id("events"),
    recipientEmails: v.optional(v.array(v.string())),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<DeliverySummary> => {
    const event = await ctx.runQuery(api.events.get, { id: args.eventId }) as Doc<"events"> | null;
    if (!event) throw new Error("Event not found.");

    const attendees = await ctx.runQuery(api.attendees.getByEvent, { eventId: args.eventId }) as Doc<"attendees">[];
    const legacyId = event.legacyId || event.providerId;
    if (!legacyId) throw new Error("Event missing legacyId/providerId.");

    const appUrl = process.env.PUBLIC_APP_URL || DEFAULT_APP_URL;
    const gmailClientId = process.env.GMAIL_CLIENT_ID || "";
    const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET || "";
    const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN || "";
    const fromEmail = process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_USER || DEFAULT_FROM_EMAIL;
    const fromName = process.env.GMAIL_FROM_NAME || "BAE SIG CEU Registry";
    const now = new Date().toISOString();
    const batchId = `${event._id}_${Date.now()}`;
    const fontUrl = `${appUrl}/fonts/AlexBrush-Regular.ttf`;

    // Fetch coordinator for signature if needed
    const coordinator = event.aceCoordinatorName ? await ctx.runQuery(api.users.getByName, {
      name: event.aceCoordinatorName
    }) : null;

    const recipientSet = args.recipientEmails
      ? new Set(args.recipientEmails.map(normalizeEmail))
      : null;

    let alreadySent = new Set<string>();
    if (!recipientSet) {
      const deliveries = await ctx.runQuery(api.email.getDeliveriesByEvent, { eventId: args.eventId }) as Doc<"emailDeliveries">[];
      deliveries
        .filter((d) => d.status === "sent")
        .forEach((d) => alreadySent.add(normalizeEmail(d.email)));
    }

    const summary: DeliverySummary = { batchId, attempted: 0, sent: 0, failed: 0, skipped: 0 };

    for (const attendee of attendees) {
      const email = normalizeEmail(attendee.email);
      if (!email) continue;
      if (recipientSet && !recipientSet.has(email)) continue;
      if (!recipientSet && alreadySent.has(email)) {
        await ctx.runMutation(api.email.logDelivery, {
          eventId: attendee.eventId,
          attendeeId: attendee._id,
          email,
          subject: event.emailSubject || "Your CEU Certificate is Ready!",
          body: "Skipped duplicate send.",
          link: "",
          status: "skipped",
          provider: EMAIL_PROVIDER,
          error: "already_sent",
          sentAt: now,
          batchId,
        });
        summary.skipped += 1;
        continue;
      }

      summary.attempted += 1;

      const link = buildCertificateLink(appUrl, legacyId, {
        _id: attendee._id,
        email: attendee.email,
        bcbaNumber: attendee.bcbaNumber,
        rbtNumber: attendee.rbtNumber,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
      });
      const subject = event.emailSubject || "Your CEU Certificate is Ready!";
      const textBody = buildEmailText(event, attendee, link);
      const htmlBody = buildEmailHtml(textBody, link);

      let status: SendStatus = "sent";
      let error: string | undefined;
      let messageId: string | undefined;

      if (args.dryRun) {
        status = "skipped";
        error = "dry_run";
        summary.skipped += 1;
      } else if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken || !fromEmail) {
        status = "failed";
        error = "Gmail credentials missing";
        summary.failed += 1;
      } else {
        const accessToken = await getGmailAccessToken(gmailClientId, gmailClientSecret, gmailRefreshToken);

        // Generate PDF
        let pdfBase64: string | undefined = undefined;
        try {
          const certInfo: CertificateInfo = {
            participantName: `${attendee.firstName} ${attendee.lastName}`,
            participantCertNumber: attendee.bcbaNumber || attendee.rbtNumber,
            courseTitle: event.title,
            issueDate: new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            hours: event.hours,
            ethicsHours: event.type === 'Ethics' ? event.hours : 0,
            supervisionHours: event.type === 'Supervision' ? event.hours : 0,
            instructor: event.instructorName,
            providerName: event.aceOrganizationName || "BAE SIG",
            providerId: event.providerId,
            aceCoordinator: event.aceCoordinatorName || "",
            aceOrganizationName: event.aceOrganizationName,
            aceProviderType: event.providerId === "OP-04-0012" ? "Organization" : "Individual",
            modality: "Online Synchronous",
            signatureUrl: coordinator?.signatureUrl
          };
          const pdfBytes = await generateCertificatePDF(certInfo, fontUrl);
          pdfBase64 = Buffer.from(pdfBytes).toString('base64');
        } catch (pdfErr) {
          console.error("Failed to generate PDF for attachment", pdfErr);
        }

        const attachment = pdfBase64 ? {
          filename: `CEU_Certificate_${attendee.lastName}.pdf`,
          content: pdfBase64,
          contentType: "application/pdf"
        } : undefined;

        const sendResult = await sendWithGmail(accessToken, fromName, fromEmail, email, subject, textBody, htmlBody, attachment);
        if (!sendResult.ok) {
          status = "failed";
          error = sendResult.error;
          summary.failed += 1;
        } else {
          messageId = sendResult.id;
          summary.sent += 1;
        }
      }

      await ctx.runMutation(api.email.logDelivery, {
        eventId: attendee.eventId,
        attendeeId: attendee._id,
        email,
        subject,
        body: textBody,
        link,
        status,
        provider: EMAIL_PROVIDER,
        providerMessageId: messageId,
        error,
        sentAt: now,
        batchId,
      });
    }

    return summary;
  },
});
