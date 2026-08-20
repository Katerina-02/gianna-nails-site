"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function listClosedPeriods() {
  await requireAdmin();
  return db.closedPeriod.findMany({ orderBy: { startDate: "asc" } });
}

export interface ClosedPeriodInput {
  startDate: string;
  endDate: string;
  reason?: string;
}

export async function createClosedPeriod(
  input: ClosedPeriodInput
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  await requireAdmin();

  if (!input.startDate || !input.endDate) {
    return { status: "error", message: "Διάλεξε ημερομηνία έναρξης και λήξης." };
  }
  if (input.endDate < input.startDate) {
    return { status: "error", message: "Η ημερομηνία λήξης πρέπει να είναι μετά την έναρξη." };
  }

  await db.closedPeriod.create({
    data: {
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason?.trim() || null,
    },
  });
  revalidatePath("/admin/closed-dates");
  revalidatePath("/appointments");
  return { status: "ok" };
}

export async function deleteClosedPeriod(id: string) {
  await requireAdmin();
  await db.closedPeriod.delete({ where: { id } });
  revalidatePath("/admin/closed-dates");
  revalidatePath("/appointments");
}
