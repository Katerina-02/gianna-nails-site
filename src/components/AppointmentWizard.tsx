"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createAppointment,
  getClosedDatesInMonth,
  getFullyBookedDates,
  getSlots,
} from "@/app/(site)/appointments/actions";
import { formatDateGreek, todayISO, addDays } from "@/lib/dates";
import { isShopClosed } from "@/lib/closedDays";
import type { SlotInfo } from "@/lib/slots";
import Calendar from "@/components/Calendar";
import { SHOP } from "@/lib/shop";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  isExtra: boolean;
  standalone: boolean;
}

interface Conflict {
  date: string;
  serviceName: string;
}

type Step = "pick" | "details" | "success";

export default function AppointmentWizard({
  services,
}: {
  services: ServiceOption[];
}) {
  const minDate = todayISO();
  const maxDate = addDays(minDate, 90);

  const primaryServices = useMemo(
    () => services.filter((s) => !s.isExtra || s.standalone),
    [services]
  );

  const [step, setStep] = useState<Step>("pick");
  const [date, setDate] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startTime, setStartTime] = useState("");

  const [calYear, setCalYear] = useState<number | null>(null);
  const [calMonth, setCalMonth] = useState<number | null>(null);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
  const [closedDates, setClosedDates] = useState<string[]>([]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [comments, setComments] = useState("");

  const [conflicts, setConflicts] = useState<Conflict[] | null>(null);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    serviceName: string;
    extraNames: string[];
    totalPrice: number;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const extraOptions = useMemo(
    () => services.filter((s) => s.isExtra && s.id !== serviceId),
    [services, serviceId]
  );

  const selectedExtras = useMemo(
    () => services.filter((s) => extraIds.includes(s.id)),
    [services, extraIds]
  );

  const totalPrice =
    (selectedService?.price ?? 0) + selectedExtras.reduce((sum, e) => sum + e.price, 0);

  useEffect(() => {
    if (!serviceId || !calYear || !calMonth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern
      setFullyBookedDates([]);
      return;
    }
    getFullyBookedDates(serviceId, calYear, calMonth, extraIds).then(setFullyBookedDates);
  }, [serviceId, extraIds, calYear, calMonth]);

  useEffect(() => {
    if (!calYear || !calMonth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern
      setClosedDates([]);
      return;
    }
    getClosedDatesInMonth(calYear, calMonth).then(setClosedDates);
  }, [calYear, calMonth]);

  useEffect(() => {
    if (!date || !serviceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    getSlots(date, serviceId, extraIds)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [date, serviceId, extraIds]);

  function isDateDisabled(iso: string): boolean {
    return isShopClosed(iso) || fullyBookedDates.includes(iso) || closedDates.includes(iso);
  }

  function toggleExtra(id: string) {
    setExtraIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setDate("");
    setStartTime("");
    setError("");
  }

  function goToDetails() {
    if (!date || !serviceId || !startTime) return;
    setError("");
    setStep("details");
  }

  function submit(confirmed = false) {
    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Συμπλήρωσε όνομα και τηλέφωνο.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await createAppointment({
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
        confirmed,
      });

      if (result.status === "ok") {
        setConflicts(null);
        setSuccessInfo(result.appointment);
        setStep("success");
      } else if (result.status === "needs_confirmation") {
        setConflicts(result.conflicts);
      } else if (result.status === "slot_taken") {
        setError(
          "Δυστυχώς αυτή η ώρα μόλις κλείστηκε από κάποια άλλη. Διάλεξε άλλη ώρα."
        );
        setConflicts(null);
        setStep("pick");
        setStartTime("");
        getSlots(date, serviceId, extraIds).then(setSlots);
      } else {
        setError(result.message);
      }
    });
  }

  if (step === "success" && successInfo) {
    return (
      <div className="rounded-2xl border border-line bg-cream/60 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose flex items-center justify-center text-white text-2xl">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Το ραντεβού σου κλείστηκε!
        </h2>
        <p className="mt-2 text-foreground/70">
          {successInfo.serviceName}
          {successInfo.extraNames.length > 0 && ` + ${successInfo.extraNames.join(", ")}`} ·{" "}
          {formatDateGreek(successInfo.date)} · {successInfo.startTime}–{successInfo.endTime}
        </p>
        <p className="mt-1 text-foreground/70 font-medium">
          Σύνολο: {successInfo.totalPrice.toFixed(2)} €
        </p>
        <p className="mt-4 text-sm text-rose-dark font-medium">
          Δωρεάν ακύρωση έως τις{" "}
          {formatDateGreek(addDays(successInfo.date, -SHOP.cancellationDays))}.
        </p>
        <p className="mt-2 text-sm text-foreground/50">
          Σε περιμένουμε! Αν χρειαστεί να το αλλάξεις, επικοινώνησε μαζί μας.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          1. Υπηρεσία
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {primaryServices.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id);
                setExtraIds([]);
                setStep("pick");
                setDate("");
                setStartTime("");
                setError("");
              }}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                serviceId === s.id
                  ? "border-rose bg-rose/10"
                  : "border-line hover:border-rose/50"
              }`}
            >
              <div className="font-medium text-foreground">{s.name}</div>
              <div className="text-sm text-foreground/60">
                {s.durationMinutes} λεπτά · {s.price.toFixed(2)} €
              </div>
            </button>
          ))}
        </div>
      </div>

      {serviceId && extraOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            2. Έξτρα (προαιρετικά)
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {extraOptions.map((s) => {
              const checked = extraIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleExtra(s.id)}
                  className={`text-left rounded-xl border px-4 py-3 transition-colors flex items-start gap-2 ${
                    checked
                      ? "border-rose bg-rose/10"
                      : "border-line hover:border-rose/50"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center text-[10px] ${
                      checked ? "bg-rose border-rose text-white" : "border-line"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span>
                    <div className="font-medium text-foreground">{s.name}</div>
                    <div className="text-sm text-foreground/60">
                      +{s.durationMinutes} λεπτά · +{s.price.toFixed(2)} €
                    </div>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {serviceId && (
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            3. Ημερομηνία
          </label>
          <p className="mb-2 text-xs text-foreground/50">
            Κλειστά Σάββατο, Κυριακή, Δευτέρα και επίσημες αργίες.
          </p>
          <Calendar
            value={date}
            onChange={(iso) => {
              setDate(iso);
              setStep("pick");
              setStartTime("");
              setError("");
            }}
            minDate={minDate}
            maxDate={maxDate}
            isDateDisabled={isDateDisabled}
            onMonthChange={(y, m) => {
              setCalYear(y);
              setCalMonth(m);
            }}
          />
        </div>
      )}

      {date && serviceId && (
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            4. Ώρα
          </label>
          {loadingSlots ? (
            <p className="text-sm text-foreground/50">
              Έλεγχος διαθεσιμότητας…
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-foreground/50">
              Δεν χωράει η υπηρεσία αυτή μέσα στο ωράριο μας. Δοκίμασε άλλη
              ημερομηνία.
            </p>
          ) : (
            <>
              {slots.every((s) => !s.available) && (
                <p className="mb-2 text-sm text-foreground/50">
                  Δεν υπάρχουν ελεύθερες ώρες αυτή την ημέρα για την
                  επιλεγμένη υπηρεσία. Δοκίμασε άλλη ημερομηνία.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => slot.available && setStartTime(slot.time)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                      !slot.available
                        ? "border-line bg-foreground/5 text-foreground/30 line-through cursor-not-allowed"
                        : startTime === slot.time
                          ? "border-rose bg-rose text-white"
                          : "border-line hover:border-rose/50"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === "pick" && date && serviceId && startTime && (
        <button
          type="button"
          onClick={goToDetails}
          className="rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose-dark transition-colors self-start"
        >
          Συνέχεια →
        </button>
      )}

      {step === "details" && selectedService && (
        <div className="rounded-2xl border border-line bg-cream/60 p-6 flex flex-col gap-4">
          <div className="text-sm text-foreground/70">
            <p>
              {selectedService.name}
              {selectedExtras.length > 0 &&
                ` + ${selectedExtras.map((e) => e.name).join(", ")}`}
            </p>
            <p>
              {formatDateGreek(date)} · {startTime}
            </p>
            <p className="font-medium text-foreground">Σύνολο: {totalPrice.toFixed(2)} €</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Ονοματεπώνυμο *
            </label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="π.χ. Μαρία Παπαδοπούλου"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Τηλέφωνο *
            </label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              type="tel"
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="π.χ. 6912345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Email (προαιρετικό)
            </label>
            <input
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              type="email"
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="π.χ. maria@example.com"
            />
            <p className="mt-1 text-xs text-foreground/50">
              Αν το δώσεις, θα λάβεις email επιβεβαίωσης και υπενθύμιση μια
              μέρα πριν.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Facebook (προαιρετικό)
              </label>
              <input
                value={facebookUsername}
                onChange={(e) => setFacebookUsername(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Instagram (προαιρετικό)
              </label>
              <input
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Σχόλια (προαιρετικό)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="π.χ. προτίμηση χρώματος, αλλεργίες, ό,τι θες να ξέρουμε πριν έρθεις"
            />
          </div>

          <p className="text-sm text-rose-dark font-medium">
            {SHOP.cancellationPolicyText} Για αυτό το ραντεβού, δωρεάν ακύρωση
            έως τις {formatDateGreek(addDays(date, -SHOP.cancellationDays))}.{" "}
            <Link href="/policy" className="underline hover:text-rose">
              Δες την πλήρη πολιτική
            </Link>
            .
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              ← Πίσω
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => submit(false)}
              className="rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose-dark transition-colors disabled:opacity-60"
            >
              {isPending ? "Γίνεται κράτηση…" : "Κλείσε το ραντεβού"}
            </button>
          </div>
        </div>
      )}

      {conflicts && conflicts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-sm w-full rounded-2xl bg-white p-6">
            <h3 className="font-semibold text-foreground">
              Έχεις ήδη ραντεβού κοντά σε αυτή την ημερομηνία
            </h3>
            <ul className="mt-3 text-sm text-foreground/70 flex flex-col gap-1">
              {conflicts.map((c, i) => (
                <li key={i}>
                  {formatDateGreek(c.date)} — {c.serviceName}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-foreground/60">
              Θέλεις σίγουρα να κλείσεις κι αυτό το ραντεβού;
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConflicts(null)}
                className="text-sm text-foreground/60 hover:text-foreground"
              >
                Άκυρο
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => submit(true)}
                className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark transition-colors disabled:opacity-60"
              >
                Ναι, κλείσε το
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
