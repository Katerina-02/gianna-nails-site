import { Resend } from "resend";
import { SHOP } from "@/lib/shop";
import { formatDateGreek, addDays } from "@/lib/dates";

const FROM_ADDRESS = process.env.EMAIL_FROM || "GIANNA Nails & More <onboarding@resend.dev>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

interface AppointmentEmailInfo {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  extraNames?: string[];
  date: string;
  startTime: string;
  endTime: string;
}

export async function sendConfirmationEmail(info: AppointmentEmailInfo) {
  const client = getClient();
  if (!client) return; // Δεν έχει ρυθμιστεί ακόμα RESEND_API_KEY — απλά δεν στέλνει, δεν σκάει.

  const services = info.extraNames?.length
    ? `${info.serviceName} + ${info.extraNames.join(", ")}`
    : info.serviceName;
  const cancelBy = formatDateGreek(addDays(info.date, -SHOP.cancellationDays));

  try {
    await client.emails.send({
      from: FROM_ADDRESS,
      to: info.clientEmail,
      subject: `Επιβεβαίωση ραντεβού — ${SHOP.name}`,
      html: `
        <p>Γεια σου ${escapeHtml(info.clientName)},</p>
        <p>Το ραντεβού σου επιβεβαιώθηκε!</p>
        <p>
          <strong>${escapeHtml(services)}</strong><br/>
          ${formatDateGreek(info.date)} · ${info.startTime}–${info.endTime}
        </p>
        <p>Δωρεάν ακύρωση έως τις ${cancelBy}.</p>
        <p>${SHOP.name}<br/>${escapeHtml(SHOP.address)}<br/>${SHOP.phone}</p>
      `,
    });
  } catch (err) {
    console.error("Αποτυχία αποστολής email επιβεβαίωσης:", err);
  }
}

export async function sendReminderEmail(info: AppointmentEmailInfo) {
  const client = getClient();
  if (!client) return;

  const services = info.extraNames?.length
    ? `${info.serviceName} + ${info.extraNames.join(", ")}`
    : info.serviceName;

  try {
    await client.emails.send({
      from: FROM_ADDRESS,
      to: info.clientEmail,
      subject: `Υπενθύμιση ραντεβού αύριο — ${SHOP.name}`,
      html: `
        <p>Γεια σου ${escapeHtml(info.clientName)},</p>
        <p>Μια υπενθύμιση ότι αύριο σε περιμένουμε!</p>
        <p>
          <strong>${escapeHtml(services)}</strong><br/>
          ${formatDateGreek(info.date)} · ${info.startTime}–${info.endTime}
        </p>
        <p>${SHOP.name}<br/>${escapeHtml(SHOP.address)}<br/>${SHOP.phone}</p>
      `,
    });
  } catch (err) {
    console.error("Αποτυχία αποστολής email υπενθύμισης:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
