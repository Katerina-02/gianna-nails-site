import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";
import { addDays, todayISO } from "@/lib/dates";

// Καλείται μία φορά τη μέρα από το Vercel Cron (βλ. vercel.json) και στέλνει
// email υπενθύμισης σε όσους πελάτες έχουν ραντεβού αύριο και έχουν δώσει
// email. Το reminderSent αποτρέπει διπλή αποστολή αν το cron ξανατρέξει.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const tomorrow = addDays(todayISO(), 1);
  const appointments = await db.appointment.findMany({
    where: { date: tomorrow, reminderSent: false, clientEmail: { not: null } },
    include: { service: true, extras: { include: { service: true } } },
  });

  let sent = 0;
  for (const a of appointments) {
    if (!a.clientEmail) continue;
    await sendReminderEmail({
      clientName: a.clientName,
      clientEmail: a.clientEmail,
      serviceName: a.service.name,
      extraNames: a.extras.map((e) => e.service.name),
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
    });
    await db.appointment.update({ where: { id: a.id }, data: { reminderSent: true } });
    sent++;
  }

  return NextResponse.json({ date: tomorrow, sent, total: appointments.length });
}
