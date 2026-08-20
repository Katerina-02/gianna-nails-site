"use server";

import { db } from "@/lib/db";
import { createSessionCookie, verifyPassword } from "@/lib/auth";

export interface LoginResult {
  status: "ok" | "error";
  message?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) {
    return { status: "error", message: "Συμπλήρωσε email και κωδικό." };
  }

  const admin = await db.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!admin) {
    return { status: "error", message: "Λάθος email ή κωδικός." };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { status: "error", message: "Λάθος email ή κωδικός." };
  }

  await createSessionCookie(admin.id);
  return { status: "ok" };
}
