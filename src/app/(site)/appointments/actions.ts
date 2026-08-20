"use server";

import { db } from "@/lib/db";
import {
  computeSlots,
  isSlotStillAvailable,
  timeToMinutes,
  minutesToTime,
  SlotInfo,
} from "@/lib/slots";
import { addDays, todayISO } from "@/lib/dates";
import { isShopClosed } from "@/lib/closedDays";
import { sendConfirmationEmail } from "@/lib/email";

async function totalExtraMinutes(extraServiceIds: string[]): Promise<number> {
  if (extraServiceIds.length === 0) return 0;
  const extras = await db.service.findMany({ where: { id: { in: extraServiceIds } } });
  return extras.reduce((sum, e) => sum + e.durationMinutes, 0);
}

async function isDateManuallyClosed(date: string): Promise<boolean> {
  const match = await db.closedPeriod.findFirst({
    where: { startDate: { lte: date }, endDate: { gte: date } },
  });
  return !!match;
}

/**
 * Επιστρέφει τις ημερομηνίες μέσα στο δοσμένο μήνα που είναι χειροκίνητα
 * κλειστές (διακοπές), ώστε το ημερολόγιο να τις εμφανίζει ως μη επιλέξιμες.
 */
export async function getClosedDatesInMonth(year: number, month: number): Promise<string[]> {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const monthStart = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${pad(month)}-${pad(lastDay)}`;

  const periods = await db.closedPeriod.findMany({
    where: { startDate: { lte: monthEnd }, endDate: { gte: monthStart } },
  });

  const dates = new Set<string>();
  for (const p of periods) {
    let d = p.startDate > monthStart ? p.startDate : monthStart;
    const end = p.endDate < monthEnd ? p.endDate : monthEnd;
    while (d <= end) {
      dates.add(d);
      d = addDays(d, 1);
    }
  }
  return [...dates];
}

export async function getSlots(
  date: string,
  serviceId: string,
  extraServiceIds: string[] = []
): Promise<SlotInfo[]> {
  if (!date || !serviceId) return [];
  if (date < todayISO()) return [];
  if (isShopClosed(date)) return [];
  if (await isDateManuallyClosed(date)) return [];

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const extraMinutes = await totalExtraMinutes(extraServiceIds);

  const dayAppointments = await db.appointment.findMany({ where: { date } });
  const booked = dayAppointments.map((a) => ({
    startMinutes: timeToMinutes(a.startTime),
    endMinutes: timeToMinutes(a.endTime),
  }));

  return computeSlots(service.durationMinutes + extraMinutes, booked);
}

/**
 * Επιστρέφει τις ημερομηνίες μέσα στο δοσμένο μήνα που ΕΙΝΑΙ ανοιχτές
 * (όχι ΣΚ/Δευτέρα/αργία) αλλά είναι πλήρως κλεισμένες για τη συγκεκριμένη
 * υπηρεσία (+ έξτρα) — ώστε το ημερολόγιο να τις εμφανίζει επίσης ως μη
 * επιλέξιμες.
 */
export async function getFullyBookedDates(
  serviceId: string,
  year: number,
  month: number, // 1-12
  extraServiceIds: string[] = []
): Promise<string[]> {
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];
  const extraMinutes = await totalExtraMinutes(extraServiceIds);
  const totalMinutes = service.durationMinutes + extraMinutes;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const monthStart = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${pad(month)}-${pad(lastDay)}`;

  const appointments = await db.appointment.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  const byDate = new Map<string, { startMinutes: number; endMinutes: number }[]>();
  for (const a of appointments) {
    const arr = byDate.get(a.date) ?? [];
    arr.push({
      startMinutes: timeToMinutes(a.startTime),
      endMinutes: timeToMinutes(a.endTime),
    });
    byDate.set(a.date, arr);
  }

  const fullyBooked: string[] = [];
  for (const [date, booked] of byDate) {
    if (isShopClosed(date)) continue;
    const slots = computeSlots(totalMinutes, booked);
    if (slots.length > 0 && slots.every((s) => !s.available)) {
      fullyBooked.push(date);
    }
  }
  return fullyBooked;
}

export interface CreateAppointmentInput {
  date: string;
  startTime: string;
  serviceId: string;
  extraServiceIds?: string[];
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  facebookUsername?: string;
  instagramUsername?: string;
  comments?: string;
  confirmed?: boolean;
}

export type CreateAppointmentResult =
  | {
      status: "ok";
      appointment: {
        date: string;
        startTime: string;
        endTime: string;
        serviceName: string;
        extraNames: string[];
        totalPrice: number;
      };
    }
  | {
      status: "needs_confirmation";
      conflicts: { date: string; serviceName: string }[];
    }
  | { status: "slot_taken" }
  | { status: "error"; message: string };

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<CreateAppointmentResult> {
  const clientName = input.clientName?.trim();
  const clientPhone = input.clientPhone?.trim();
  const extraServiceIds = input.extraServiceIds ?? [];

  if (!clientName || !clientPhone) {
    return {
      status: "error",
      message: "Το όνομα και το τηλέφωνο είναι υποχρεωτικά.",
    };
  }
  if (!input.date || input.date < todayISO()) {
    return { status: "error", message: "Μη έγκυρη ημερομηνία." };
  }
  if (isShopClosed(input.date)) {
    return { status: "error", message: "Το μαγαζί είναι κλειστό αυτή την ημέρα." };
  }
  if (await isDateManuallyClosed(input.date)) {
    return { status: "error", message: "Το μαγαζί είναι κλειστό αυτή την ημέρα (διακοπές)." };
  }

  const service = await db.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service || !service.active) {
    return { status: "error", message: "Η υπηρεσία δεν βρέθηκε." };
  }

  const extraServices = extraServiceIds.length
    ? await db.service.findMany({ where: { id: { in: extraServiceIds } } })
    : [];
  const totalMinutes =
    service.durationMinutes + extraServices.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalPrice = service.price + extraServices.reduce((sum, e) => sum + e.price, 0);

  if (!input.confirmed) {
    const from = addDays(input.date, -20);
    const to = addDays(input.date, 20);
    const existing = await db.appointment.findMany({
      where: {
        clientPhone,
        date: { gte: from, lte: to },
      },
      include: { service: true },
      orderBy: { date: "asc" },
    });
    if (existing.length > 0) {
      return {
        status: "needs_confirmation",
        conflicts: existing.map((e) => ({
          date: e.date,
          serviceName: e.service.name,
        })),
      };
    }
  }

  const result = await db.$transaction(async (tx) => {
    const dayAppointments = await tx.appointment.findMany({
      where: { date: input.date },
    });
    const booked = dayAppointments.map((a) => ({
      startMinutes: timeToMinutes(a.startTime),
      endMinutes: timeToMinutes(a.endTime),
    }));

    if (!isSlotStillAvailable(input.startTime, totalMinutes, booked)) {
      return { status: "slot_taken" as const };
    }

    const endMinutes = timeToMinutes(input.startTime) + totalMinutes;
    const created = await tx.appointment.create({
      data: {
        date: input.date,
        startTime: input.startTime,
        endTime: minutesToTime(endMinutes),
        serviceId: input.serviceId,
        clientName,
        clientPhone,
        clientEmail: input.clientEmail?.trim() || null,
        facebookUsername: input.facebookUsername?.trim() || null,
        instagramUsername: input.instagramUsername?.trim() || null,
        comments: input.comments?.trim() || null,
      },
    });

    if (extraServices.length > 0) {
      await tx.appointmentExtra.createMany({
        data: extraServices.map((e) => ({
          appointmentId: created.id,
          serviceId: e.id,
        })),
      });
    }

    return {
      status: "ok" as const,
      appointment: {
        date: created.date,
        startTime: created.startTime,
        endTime: created.endTime,
        serviceName: service.name,
        extraNames: extraServices.map((e) => e.name),
        totalPrice,
      },
    };
  });

  const clientEmail = input.clientEmail?.trim();
  if (result.status === "ok" && clientEmail) {
    await sendConfirmationEmail({
      clientName,
      clientEmail,
      serviceName: result.appointment.serviceName,
      extraNames: result.appointment.extraNames,
      date: result.appointment.date,
      startTime: result.appointment.startTime,
      endTime: result.appointment.endTime,
    });
  }

  return result;
}
