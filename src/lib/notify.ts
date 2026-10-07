import "server-only";
import { site } from "./site";

type Email = { to: string; subject: string; text: string };

/**
 * Sends a transactional email through Resend when RESEND_API_KEY is set,
 * otherwise logs it so the flow still works in development.
 * Never throws: a failed email must not fail a booking or order.
 */
export async function sendEmail({ to, subject, text }: Email) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email:dev] to=${to} subject="${subject}"\n${text}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to,
        subject,
        text,
      }),
    });
    if (!res.ok) console.error("[email] send failed", res.status, await res.text());
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

/** Sends a copy to the salon owner when SALON_NOTIFY_EMAIL is configured. */
export async function notifySalon(subject: string, text: string) {
  const to = process.env.SALON_NOTIFY_EMAIL;
  if (to) await sendEmail({ to, subject, text });
}
