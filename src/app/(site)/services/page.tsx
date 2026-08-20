import Link from "next/link";
import { db } from "@/lib/db";
import { SHOP } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  const mainServices = services.filter((s) => !s.isExtra);
  const extraServices = services.filter((s) => s.isExtra);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-rose-dark text-center">
        Υπηρεσίες
      </h1>
      <p className="mt-3 text-center text-foreground/70">
        Οι τιμές και οι διάρκειες είναι ενδεικτικές — ρωτήστε μας για ό,τι δεν
        βλέπετε στη λίστα.
      </p>
      <p className="mt-4 text-center text-sm text-rose-dark font-medium">
        {SHOP.cancellationPolicyText}{" "}
        <Link href="/policy" className="underline hover:text-rose">
          Δες την πλήρη πολιτική
        </Link>
        .
      </p>

      {mainServices.length === 0 ? (
        <p className="mt-10 text-center text-foreground/60">
          Δεν υπάρχουν ακόμα καταχωρημένες υπηρεσίες.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-4">
          {mainServices.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-line bg-cream/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <h2 className="font-semibold text-lg text-foreground">
                  {s.name}
                </h2>
                {s.description && (
                  <p className="mt-1 text-sm text-foreground/70">
                    {s.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-foreground/50">
                  Διάρκεια ~ {s.durationMinutes} λεπτά
                </p>
              </div>
              <div className="text-rose-dark font-semibold text-lg whitespace-nowrap">
                {s.price.toFixed(2)} €
              </div>
            </div>
          ))}
        </div>
      )}

      {extraServices.length > 0 && (
        <div className="mt-14">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-rose-dark text-center">
            Έξτρα
          </h2>
          <p className="mt-2 text-center text-sm text-foreground/60">
            Προστίθενται πάνω σε μια υπηρεσία, κατά την κράτηση του ραντεβού
            σας.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {extraServices.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-line bg-cream/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    {s.name}
                    {!s.standalone && (
                      <span className="text-xs rounded-full bg-rose/15 text-rose-dark px-2 py-0.5">
                        Πρόσθετη υπηρεσία
                      </span>
                    )}
                  </h3>
                  {s.description && (
                    <p className="mt-1 text-sm text-foreground/70">{s.description}</p>
                  )}
                  <p className="mt-1 text-xs text-foreground/50">
                    +{s.durationMinutes} λεπτά
                  </p>
                </div>
                <div className="text-rose-dark font-semibold whitespace-nowrap">
                  +{s.price.toFixed(2)} €
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
