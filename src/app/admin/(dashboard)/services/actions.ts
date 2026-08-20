"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function listServices() {
  await requireAdmin();
  return db.service.findMany({ orderBy: { order: "asc" } });
}

export interface ServiceInput {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  order: number;
  isExtra: boolean;
  standalone: boolean;
}

export async function createService(input: ServiceInput) {
  await requireAdmin();
  await db.service.create({ data: input });
  revalidatePath("/services");
  revalidatePath("/appointments");
  revalidatePath("/admin/services");
}

export async function updateService(id: string, input: ServiceInput) {
  await requireAdmin();
  await db.service.update({ where: { id }, data: input });
  revalidatePath("/services");
  revalidatePath("/appointments");
  revalidatePath("/admin/services");
}

export async function deleteService(
  id: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  await requireAdmin();
  try {
    await db.service.delete({ where: { id } });
  } catch {
    return {
      status: "error",
      message:
        "Δεν μπορεί να διαγραφεί — υπάρχουν ραντεβού με αυτή την υπηρεσία. Απενεργοποίησέ την αντί να τη διαγράψεις.",
    };
  }
  revalidatePath("/services");
  revalidatePath("/appointments");
  revalidatePath("/admin/services");
  return { status: "ok" };
}
