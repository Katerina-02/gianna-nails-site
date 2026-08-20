import { db } from "@/lib/db";
import AppointmentWizard from "@/components/AppointmentWizard";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-rose-dark text-center">
        Κλείσε ραντεβού
      </h1>
      <p className="mt-3 text-center text-foreground/70">
        Διαλέξτε ημερομηνία και υπηρεσία, και θα σας δείξουμε τις ελεύθερες
        ώρες εκείνης της μέρας.
      </p>

      <div className="mt-10">
        <AppointmentWizard
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            durationMinutes: s.durationMinutes,
            isExtra: s.isExtra,
            standalone: s.standalone,
          }))}
        />
      </div>
    </div>
  );
}
