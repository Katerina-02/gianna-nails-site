"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  isSlotStillAvailable,
  minutesToTime,
  timeToMinutes,
} from "@/lib/slots";
import { sendConfirmationEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function getAppointmentsForDate(date: string) {
  await requireAdmin();
  const appointments = await db.appointment.findMany({
    where: { date },
    include: { service: true, extras: { include: { service: true } } },
    orderBy: { startTime: "asc" },
  });
  return appointments.map((a) => ({
    id: a.id,
    startTime: a.startTime,
    endTime: a.endTime,
    serviceName: a.service.name,
    extraNames: a.extras.map((e) => e.service.name),
    totalPrice: a.service.price + a.extras.reduce((sum, e) => sum + e.service.price, 0),
    clientName: a.clientName,
    clientPhone: a.clientPhone,
    clientEmail: a.clientEmail,
    facebookUsername: a.facebookUsername,
    instagramUsername: a.instagramUsername,
    comments: a.comments,
  }));
}

export async function deleteAppointment(id: string) {
  await requireAdmin();
  await db.appointment.delete({ where: { id } });
}

export interface AdminCreateAppointmentInput {
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
}

export type AdminCreateAppointmentResult =
  | { status: "ok" }
  | { status: "slot_taken" }
  | { status: "error"; message: string };

export async function adminCreateAppointment(
  input: AdminCreateAppointmentInput
): Promise<AdminCreateAppointmentResult> {
  await requireAdmin();

  const clientName = input.clientName?.trim();
  const clientPhone = input.clientPhone?.trim();
  if (!clientName || !clientPhone) {
    return { status: "error", message: "Όνομα και τηλέφωνο είναι υποχρεωτικά." };
  }

  const service = await db.service.findUnique({ where: { id: input.serviceId } });
  if (!service) {
    return { status: "error", message: "Η υπηρεσία δεν βρέθηκε." };
  }

  const extraServiceIds = input.extraServiceIds ?? [];
  const extraServices = extraServiceIds.length
    ? await db.service.findMany({ where: { id: { in: extraServiceIds } } })
    : [];
  const totalMinutes =
    service.durationMinutes + extraServices.reduce((sum, e) => sum + e.durationMinutes, 0);

  const result = await db.$transaction(async (tx) => {
    const dayAppointments = await tx.appointment.findMany({ where: { date: input.date } });
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
        data: extraServices.map((e) => ({ appointmentId: created.id, serviceId: e.id })),
      });
    }

    return { status: "ok" as const, endTime: minutesToTime(endMinutes) };
  });

  const clientEmail = input.clientEmail?.trim();
  if (result.status === "ok" && clientEmail) {
    await sendConfirmationEmail({
      clientName,
      clientEmail,
      serviceName: service.name,
      extraNames: extraServices.map((e) => e.name),
      date: input.date,
      startTime: input.startTime,
      endTime: result.endTime,
    });
  }

  return result;
}
