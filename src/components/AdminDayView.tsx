"use client";

import { useEffect, useState, useTransition } from "react";
import {
  adminCreateAppointment,
  deleteAppointment,
  getAppointmentsForDate,
} from "@/app/admin/(dashboard)/actions";
import { getSlots } from "@/app/(site)/appointments/actions";
import { formatDateGreek, todayISO } from "@/lib/dates";
import { telHref } from "@/lib/phone";
import type { SlotInfo } from "@/lib/slots";

interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  isExtra: boolean;
  standalone: boolean;
}

interface AppointmentRow {
  id: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  extraNames: string[];
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  facebookUsername: string | null;
  instagramUsername: string | null;
  comments: string | null;
}

export default function AdminDayView({ services }: { services: ServiceOption[] }) {
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    setLoading(true);
    getAppointmentsForDate(date)
      .then(setRows)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern
    setLoading(true);
    getAppointmentsForDate(date)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [date]);

  function handleDelete(id: string) {
    if (!confirm("Να διαγραφεί αυτό το ραντεβού;")) return;
    startTransition(async () => {
      await deleteAppointment(id);
      refresh();
    });
  }

  return (
    <div>
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
            Ραντεβού ημέρας
          </h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-3 rounded-lg border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-full border border-rose px-5 py-2.5 text-sm font-semibold text-rose-dark hover:bg-cream"
          >
            + Νέο ραντεβού
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
          >
            Εκτύπωση
          </button>
        </div>
      </div>

      <h2 className="hidden print:block text-xl font-semibold mb-4">
        Ραντεβού — {formatDateGreek(date)}
      </h2>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-foreground/60">Φόρτωση…</p>
        ) : rows.length === 0 ? (
          <p className="text-foreground/60">
            Δεν υπάρχουν ραντεβού για {formatDateGreek(date)}.
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-line text-foreground/60">
                <th className="py-2 pr-4">Ώρα</th>
                <th className="py-2 pr-4">Υπηρεσία</th>
                <th className="py-2 pr-4">Όνομα</th>
                <th className="py-2 pr-4">Τηλέφωνο</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Facebook</th>
                <th className="py-2 pr-4">Instagram</th>
                <th className="py-2 pr-4">Σχόλια</th>
                <th className="py-2 pr-4 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {r.startTime}–{r.endTime}
                  </td>
                  <td className="py-2 pr-4">
                    {r.serviceName}
                    {r.extraNames.length > 0 && (
                      <div className="text-xs text-foreground/50">
                        + {r.extraNames.join(", ")} · σύνολο {r.totalPrice.toFixed(2)} €
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">{r.clientName}</td>
                  <td className="py-2 pr-4">
                    <a href={telHref(r.clientPhone)} className="hover:text-rose-dark hover:underline">
                      {r.clientPhone}
                    </a>
                  </td>
                  <td className="py-2 pr-4">
                    {r.clientEmail ? (
                      <a href={`mailto:${r.clientEmail}`} className="hover:text-rose-dark hover:underline">
                        {r.clientEmail}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 pr-4">{r.facebookUsername ?? "—"}</td>
                  <td className="py-2 pr-4">{r.instagramUsername ?? "—"}</td>
                  <td className="py-2 pr-4 max-w-[16rem]">{r.comments ?? "—"}</td>
                  <td className="py-2 pr-4 no-print">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={isPending}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Διαγραφή
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <AddAppointmentModal
          date={date}
          services={services}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function AddAppointmentModal({
  date,
  services,
  onClose,
  onCreated,
}: {
  date: string;
  services: ServiceOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const primaryServices = services.filter((s) => !s.isExtra || s.standalone);
  const [serviceId, setServiceId] = useState(primaryServices[0]?.id ?? "");
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [startTime, setStartTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const extraOptions = services.filter((s) => s.isExtra && s.id !== serviceId);

  useEffect(() => {
    if (!serviceId) return;
    getSlots(date, serviceId, extraIds).then(setSlots);
  }, [date, serviceId, extraIds]);

  function toggleExtra(id: string) {
    setExtraIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setStartTime("");
  }

  function submit() {
    if (!clientName.trim() || !clientPhone.trim() || !startTime) {
      setError("Συμπλήρωσε ώρα, όνομα και τηλέφωνο.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await adminCreateAppointment({
        date,
        startTime,
        serviceId,
        extraServiceIds: extraIds,
        clientName,
        clientPhone,
        clientEmail,
        facebookUsername,
        instagramUsername,
        comments,
      });
      if (result.status === "ok") {
        onCreated();
      } else if (result.status === "slot_taken") {
        setError("Η ώρα αυτή μόλις καταλήφθηκε. Διάλεξε άλλη.");
        getSlots(date, serviceId, extraIds).then(setSlots);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-w-md w-full rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-lg text-foreground">
          Νέο ραντεβού — {formatDateGreek(date)}
        </h3>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Υπηρεσία
          </label>
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setExtraIds([]);
              setStartTime("");
            }}
            className="w-full rounded-lg border border-line px-4 py-2.5"
          >
            {primaryServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMinutes} λεπτά)
              </option>
            ))}
          </select>
        </div>

        {extraOptions.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Έξτρα (προαιρετικά)
            </label>
            <div className="flex flex-col gap-1.5">
              {extraOptions.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm text-foreground/80">
                  <input
                    type="checkbox"
                    checked={extraIds.includes(s.id)}
                    onChange={() => toggleExtra(s.id)}
                  />
                  {s.name} (+{s.durationMinutes}′)
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Ώρα
          </label>
          <div className="flex flex-wrap gap-2">
            {slots.length === 0 ? (
              <p className="text-sm text-foreground/50">Καμία ελεύθερη ώρα.</p>
            ) : (
              slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => slot.available && setStartTime(slot.time)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    !slot.available
                      ? "border-line bg-foreground/5 text-foreground/30 line-through cursor-not-allowed"
                      : startTime === slot.time
                        ? "border-rose bg-rose text-white"
                        : "border-line hover:border-rose/50"
                  }`}
                >
                  {slot.time}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Ονοματεπώνυμο *
          </label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-lg border border-line px-4 py-2.5"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Τηλέφωνο *
          </label>
          <input
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full rounded-lg border border-line px-4 py-2.5"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Email
          </label>
          <input
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            type="email"
            className="w-full rounded-lg border border-line px-4 py-2.5"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Facebook
            </label>
            <input
              value={facebookUsername}
              onChange={(e) => setFacebookUsername(e.target.value)}
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Instagram
            </label>
            <input
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Σχόλια
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-line px-4 py-2.5"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-foreground/60 hover:text-foreground">
            Άκυρο
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
          >
            {isPending ? "Αποθήκευση…" : "Προσθήκη"}
          </button>
        </div>
      </div>
    </div>
  );
}
