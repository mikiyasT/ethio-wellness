import { env } from "../config/env.js";

export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
  ics?: { filename: string; content: string };
};

export function formatWhen(startsAt: Date, timeZone: string | null) {
  const zone = timeZone && isTimeZone(timeZone) ? timeZone : "UTC";
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(startsAt);
  return label;
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
  console.log(`\n----- Ayzon email (no provider; logged locally) -----\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n-----`);
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
      from: env.emailFrom,
      to: [message.to],
      subject: message.subject,
      text: message.text,
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
      From: env.emailFrom,
      To: message.to,
      Subject: message.subject,
      TextBody: message.text,
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
