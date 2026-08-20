"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export interface ArticleInput {
  title: string;
  content: string;
  imageUrl?: string | null;
  published: boolean;
}

export async function createArticle(input: ArticleInput) {
  await requireAdmin();
  const article = await db.article.create({ data: input });
  revalidatePath("/tips");
  revalidatePath("/admin/tips");
  return article.id;
}

export async function updateArticle(id: string, input: ArticleInput) {
  await requireAdmin();
  await db.article.update({ where: { id }, data: input });
  revalidatePath("/tips");
  revalidatePath(`/tips/${id}`);
  revalidatePath("/admin/tips");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await db.article.delete({ where: { id } });
  revalidatePath("/tips");
  revalidatePath("/admin/tips");
}
