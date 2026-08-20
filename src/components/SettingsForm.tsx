"use client";

import { useState, useTransition } from "react";
import { updateCredentials } from "@/app/admin/(dashboard)/settings/actions";

export default function SettingsForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSuccess(false);
    if (!currentPassword) {
      setError("Δώσε τον τρέχοντα κωδικό σου για επιβεβαίωση.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError("Οι νέοι κωδικοί δεν ταιριάζουν.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await updateCredentials({
        currentPassword,
        newEmail: email,
        newPassword: newPassword || undefined,
      });
      if (result.status === "ok") {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-cream/40 p-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line px-4 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Νέος κωδικός (άσε το κενό αν δεν θες να τον αλλάξεις)
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-line px-4 py-2.5"
          autoComplete="new-password"
        />
      </div>

      {newPassword && (
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Επιβεβαίωση νέου κωδικού
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-4 py-2.5"
            autoComplete="new-password"
          />
        </div>
      )}

      <div className="border-t border-line pt-4">
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Τρέχων κωδικός (για επιβεβαίωση) *
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-lg border border-line px-4 py-2.5"
          autoComplete="current-password"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-700">Οι αλλαγές αποθηκεύτηκαν!</p>
      )}

      <button
        onClick={save}
        disabled={isPending}
        className="self-start rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
      >
        {isPending ? "Αποθήκευση…" : "Αποθήκευση"}
      </button>
    </div>
  );
}
