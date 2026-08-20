import { db } from "@/lib/db";
import ClosedDatesManager from "@/components/ClosedDatesManager";

export const dynamic = "force-dynamic";

export default async function ClosedDatesPage() {
  const periods = await db.closedPeriod.findMany({ orderBy: { startDate: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
        Διακοπές / Κλειστές ημέρες
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Όσες ημερομηνίες προσθέσεις εδώ δεν θα μπορούν να επιλεγούν από τους
        πελάτες στο ραντεβού. Το Σάββατο, η Κυριακή, η Δευτέρα και οι
        επίσημες αργίες είναι ήδη κλειστά πάντα — δεν χρειάζεται να τα
        προσθέσεις.
      </p>
      <ClosedDatesManager
        initialPeriods={periods.map((p) => ({
          id: p.id,
          startDate: p.startDate,
          endDate: p.endDate,
          reason: p.reason,
        }))}
      />
    </div>
  );
}
