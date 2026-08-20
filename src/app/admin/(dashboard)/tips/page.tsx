import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateGreek, formatDateISO } from "@/lib/dates";
import DeleteArticleButton from "@/components/DeleteArticleButton";

export const dynamic = "force-dynamic";

export default async function AdminTipsPage() {
  const articles = await db.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
          Συμβουλές
        </h1>
        <Link
          href="/admin/tips/new"
          className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
        >
          + Νέο άρθρο
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {articles.length === 0 && (
          <p className="text-foreground/60">Δεν υπάρχουν άρθρα ακόμα.</p>
        )}
        {articles.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-line p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {a.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset
                <img
                  src={a.imageUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
              )}
              <div>
                <div className="font-medium text-foreground flex items-center gap-2">
                  {a.title}
                  {!a.published && (
                    <span className="text-xs rounded-full bg-foreground/10 px-2 py-0.5 text-foreground/50">
                      πρόχειρο
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/50 mt-1">
                  {formatDateGreek(formatDateISO(a.createdAt))}
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href={`/admin/tips/${a.id}/edit`}
                className="text-sm text-rose-dark hover:underline"
              >
                Επεξεργασία
              </Link>
              <DeleteArticleButton id={a.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
