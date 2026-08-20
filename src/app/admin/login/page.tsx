"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await login(email, password);
      if (result.status === "ok") {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(result.message ?? "Κάτι πήγε στραβά.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-8"
      >
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-rose-dark text-center">
          Είσοδος διαχειριστή
        </h1>

        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
            autoComplete="username"
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Κωδικός
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose-dark transition-colors disabled:opacity-60"
        >
          {isPending ? "Σύνδεση…" : "Σύνδεση"}
        </button>

        <Link
          href="/"
          className="mt-3 block w-full rounded-full border border-rose px-6 py-3 text-center text-sm font-semibold text-rose-dark hover:bg-cream transition-colors"
        >
          Επιστροφή στην Αρχική Σελίδα
        </Link>
      </form>
    </div>
  );
}
