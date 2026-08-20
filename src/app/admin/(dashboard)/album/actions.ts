"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function listPhotos() {
  await requireAdmin();
  return db.photo.findMany({ orderBy: { createdAt: "desc" } });
}

export async function addPhoto(
  imageUrl: string,
  caption?: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  await requireAdmin();
  if (!imageUrl) {
    return { status: "error", message: "Διάλεξε μια φωτογραφία." };
  }
  await db.photo.create({ data: { imageUrl, caption: caption?.trim() || null } });
  revalidatePath("/album");
  revalidatePath("/admin/album");
  return { status: "ok" };
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  await db.photo.delete({ where: { id } });
  revalidatePath("/album");
  revalidatePath("/admin/album");
}
