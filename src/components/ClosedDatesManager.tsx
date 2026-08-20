"use client";

import { useState, useTransition } from "react";
import {
  createClosedPeriod,
  deleteClosedPeriod,
} from "@/app/admin/(dashboard)/closed-dates/actions";
import { formatDateGreek, todayISO } from "@/lib/dates";

interface ClosedPeriod {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export default function ClosedDatesManager({
  initialPeriods,
}: {
  initialPeriods: ClosedPeriod[];
}) {
  const [periods, setPeriods] = useState(initialPeriods);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function add() {
    setError("");
    startTransition(async () => {
      const result = await createClosedPeriod({ startDate, endDate, reason });
      if (result.status === "ok") {
        setPeriods((prev) =>
          [...prev, { id: `tmp-${Date.now()}`, startDate, endDate, reason: reason || null }].sort(
            (a, b) => a.startDate.localeCompare(b.startDate)
          )
        );
        setStartDate("");
        setEndDate("");
        setReason("");
      } else {
        setError(result.message);
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Να διαγραφεί αυτή η περίοδος κλεισίματος;")) return;
    startTransition(async () => {
      await deleteClosedPeriod(id);
      setPeriods((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div>
      <div className="mt-6 rounded-2xl border border-line bg-cream/40 p-5">
        <h2 className="font-medium text-foreground mb-3">Νέα περίοδος κλεισίματος</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Από</label>
            <input
              type="date"
              min={todayISO()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Έως</label>
            <input
              type="date"
              min={startDate || todayISO()}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Σημείωση (προαιρετικό)
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="π.χ. Καλοκαιρινές διακοπές"
            className="w-full rounded-lg border border-line px-4 py-2.5"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={add}
          disabled={isPending || !startDate || !endDate}
          className="mt-4 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
        >
          {isPending ? "Προσθήκη…" : "Προσθήκη"}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {periods.length === 0 ? (
          <p className="text-foreground/60">Δεν υπάρχουν προγραμματισμένες διακοπές.</p>
        ) : (
          periods.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-line p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-medium text-foreground">
                  {p.startDate === p.endDate
                    ? formatDateGreek(p.startDate)
                    : `${formatDateGreek(p.startDate)} — ${formatDateGreek(p.endDate)}`}
                </div>
                {p.reason && <p className="text-sm text-foreground/60 mt-1">{p.reason}</p>}
              </div>
              <button
                onClick={() => remove(p.id)}
                className="text-sm text-red-600 hover:underline shrink-0"
              >
                Διαγραφή
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
