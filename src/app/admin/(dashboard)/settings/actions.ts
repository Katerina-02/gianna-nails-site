"use server";

import { db } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function getCurrentAdminEmail(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const admin = await db.adminUser.findUnique({ where: { id: session.adminId } });
  return admin?.email ?? null;
}

export interface UpdateCredentialsInput {
  currentPassword: string;
  newEmail: string;
  newPassword?: string;
}

export type UpdateCredentialsResult =
  | { status: "ok" }
  | { status: "error"; message: string };

export async function updateCredentials(
  input: UpdateCredentialsInput
): Promise<UpdateCredentialsResult> {
  const session = await getSession();
  if (!session) return { status: "error", message: "Δεν είσαι συνδεδεμένη." };

  const admin = await db.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin) return { status: "error", message: "Ο χρήστης δεν βρέθηκε." };

  const validCurrent = await verifyPassword(input.currentPassword, admin.passwordHash);
  if (!validCurrent) {
    return { status: "error", message: "Ο τρέχων κωδικός δεν είναι σωστός." };
  }

  const newEmail = input.newEmail.trim().toLowerCase();
  if (!newEmail || !newEmail.includes("@")) {
    return { status: "error", message: "Δώσε ένα έγκυρο email." };
  }

  if (newEmail !== admin.email) {
    const existing = await db.adminUser.findUnique({ where: { email: newEmail } });
    if (existing) {
      return { status: "error", message: "Αυτό το email χρησιμοποιείται ήδη." };
    }
  }

  if (input.newPassword && input.newPassword.length < 8) {
    return { status: "error", message: "Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες." };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: {
      email: newEmail,
      passwordHash: input.newPassword
        ? await hashPassword(input.newPassword)
        : admin.passwordHash,
    },
  });

  return { status: "ok" };
}
