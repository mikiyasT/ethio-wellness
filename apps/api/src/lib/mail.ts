import { env } from "../config/env.js";

/** Inbox display name stays Amharic. Resend RFC 2047-encodes it; do not fold this to ASCII. */
export const BRAND_FROM = "አይዞን <bookings@ayzoncare.com>";
export const BRAND_REPLY_TO = "support@ayzoncare.com";
const LEGACY_FROM = "Ayzon <bookings@ayzoncare.com>";
const BRAND_SIGNOFF = "አይዞን!";
const BRAND_SITE = "ayzoncare.com";
const BRAND_GOLD = "#f5c35a";

export type MailAudience = "guest" | "provider";

const FOOTER_LINE: Record<MailAudience, string> = {
  guest: "We got you.",
  provider: "Your work heals.",
};

export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
  audience?: MailAudience;
  ics?: { filename: string; content: string };
};

export function fromAddress() {
  const configured = env.emailFrom.trim();
  if (!configured || configured === LEGACY_FROM) return BRAND_FROM;
  return configured;
}

export function withBrandFooter(text: string, audience: MailAudience = "guest") {
  return `${text.replace(/\s+$/, "")}\n\n${BRAND_SIGNOFF}\n${FOOTER_LINE[audience]}\n${BRAND_SITE}`;
}

/** HTML part uses the OS Ethiopic font. No webfont link or @font-face. */
export function renderMailHtml(text: string, audience: MailAudience = "guest") {
  const paragraphs = text
    .replace(/\s+$/, "")
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px;">${linkify(escapeHtml(block)).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const line = escapeHtml(FOOTER_LINE[audience]);
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#1c1917;">${paragraphs}<p style="margin:28px 0 0;font-size:22px;font-weight:700;color:${BRAND_GOLD};">${BRAND_SIGNOFF}</p><p style="margin:4px 0 0;">${line}</p><p style="margin:4px 0 0;font-size:12px;color:#78716c;">${BRAND_SITE}</p></body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function linkify(escaped: string) {
  return escaped.replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}">${url}</a>`);
}

export function formatWhen(startsAt: Date, timeZone: string | null) {
  const zone = timeZone && isTimeZone(timeZone) ? timeZone : "UTC";
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(startsAt);
  return `${label} ${zoneLabel(startsAt, zone)}`;
}

function zoneLabel(startsAt: Date, timeZone: string) {
  if (timeZone === "Africa/Addis_Ababa") return "EAT";
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(startsAt);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function isTimeZone(value: string) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Send through Resend or Postmark. Without a key, development logs the message and production skips it. */
export async function sendMail(message: OutboundMail): Promise<"sent" | "logged" | "skipped"> {
  if (env.resendApiKey) {
    await sendResend(message);
    return "sent";
  }
  if (env.postmarkToken) {
    await sendPostmark(message);
    return "sent";
  }
  if (process.env.NODE_ENV === "production") {
    console.error(`Email skipped (no provider configured): ${message.subject}`);
    return "skipped";
  }
  const text = withBrandFooter(message.text, message.audience);
  console.log(`\n----- email (no provider; logged locally) -----\nFrom: ${fromAddress()}\nReply-To: ${BRAND_REPLY_TO}\nTo: ${message.to}\nSubject: ${message.subject}\n\n${text}\n-----`);
  return "logged";
}

async function sendResend(message: OutboundMail) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      reply_to: BRAND_REPLY_TO,
      to: [message.to],
      subject: message.subject,
      text: withBrandFooter(message.text, message.audience),
      html: renderMailHtml(message.text, message.audience),
      attachments: message.ics
        ? [{ filename: message.ics.filename, content: Buffer.from(message.ics.content).toString("base64") }]
        : undefined,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 240)}`);
  }
}

async function sendPostmark(message: OutboundMail) {
  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": env.postmarkToken!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      From: fromAddress(),
      ReplyTo: BRAND_REPLY_TO,
      To: message.to,
      Subject: message.subject,
      TextBody: withBrandFooter(message.text, message.audience),
      HtmlBody: renderMailHtml(message.text, message.audience),
      MessageStream: "outbound",
      Attachments: message.ics
        ? [
            {
              Name: message.ics.filename,
              Content: Buffer.from(message.ics.content).toString("base64"),
              ContentType: "text/calendar",
            },
          ]
        : undefined,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Postmark ${response.status}: ${detail.slice(0, 240)}`);
  }
}
