import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateGreek, formatDateISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function TipsPage() {
  const articles = await db.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-rose-dark text-center">
        Συμβουλές
      </h1>
      <p className="mt-3 text-center text-foreground/70">
        Μικρά άρθρα και συμβουλές φροντίδας για τα νύχια σας.
      </p>

      {articles.length === 0 ? (
        <p className="mt-10 text-center text-foreground/60">
          Δεν υπάρχουν ακόμα άρθρα.
        </p>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {articles.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl border border-line bg-cream/60 p-5 flex items-center gap-4"
            >
              {a.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset
                <img
                  src={a.imageUrl}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
              )}
              <div>
                <Link
                  href={`/tips/${a.id}`}
                  className="text-lg font-semibold text-foreground hover:text-rose-dark transition-colors"
                >
                  {a.title}
                </Link>
                <p className="mt-1 text-xs text-foreground/50">
                  {formatDateGreek(formatDateISO(a.createdAt))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
