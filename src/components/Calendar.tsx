"use client";

import { useEffect, useState } from "react";
import { formatDateISO, parseDate } from "@/lib/dates";

const WEEKDAY_LABELS = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"];
const MONTH_LABELS = [
  "Ιανουάριος",
  "Φεβρουάριος",
  "Μάρτιος",
  "Απρίλιος",
  "Μάιος",
  "Ιούνιος",
  "Ιούλιος",
  "Αύγουστος",
  "Σεπτέμβριος",
  "Οκτώβριος",
  "Νοέμβριος",
  "Δεκέμβριος",
];

function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export default function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  isDateDisabled,
  onMonthChange,
}: {
  value: string;
  onChange: (dateISO: string) => void;
  minDate: string;
  maxDate: string;
  /** Επιπλέον έλεγχος αν μια ημερομηνία (μέσα στο εύρος) δεν επιλέγεται (κλειστό/πλήρες). */
  isDateDisabled: (dateISO: string) => boolean;
  /** Ειδοποιεί τον γονέα ποιος μήνας εμφανίζεται (1-index μήνας), ώστε να φέρει δεδομένα πληρότητας. */
  onMonthChange?: (year: number, month: number) => void;
}) {
  const initial = parseDate(value || minDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-11

  useEffect(() => {
    onMonthChange?.(viewYear, viewMonth + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewYear, viewMonth]);

  const min = parseDate(minDate);
  const max = parseDate(maxDate);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = mondayFirstWeekday(firstOfMonth);

  const canGoPrev =
    new Date(viewYear, viewMonth - 1, 1) >= new Date(min.getFullYear(), min.getMonth(), 1);
  const canGoNext =
    new Date(viewYear, viewMonth + 1, 1) <= new Date(max.getFullYear(), max.getMonth(), 1);

  function goPrev() {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function goNext() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const cells: (Date | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  return (
    <div className="rounded-xl border border-line bg-white p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Προηγούμενος μήνας"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-foreground">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Επόμενος μήνας"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-foreground/50 mb-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`b${i}`} />;
          const iso = formatDateISO(date);
          const outOfRange = date < min || date > max;
          const disabled = outOfRange || isDateDisabled(iso);
          const selected = iso === value;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`aspect-square rounded-lg text-sm transition-colors ${
                disabled
                  ? "text-foreground/25 cursor-not-allowed"
                  : selected
                    ? "bg-rose text-white font-semibold"
                    : "hover:bg-cream text-foreground"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
