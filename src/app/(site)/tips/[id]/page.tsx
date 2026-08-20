import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateGreek, formatDateISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function TipArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });

  if (!article || !article.published) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <Link href="/tips" className="text-sm text-rose-dark hover:underline">
        ← Πίσω στις συμβουλές
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-semibold text-foreground">
        {article.title}
      </h1>
      <p className="mt-2 text-xs text-foreground/50">
        {formatDateGreek(formatDateISO(article.createdAt))}
      </p>
      {article.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset
        <img
          src={article.imageUrl}
          alt=""
          className="mt-6 w-full rounded-2xl border border-line object-cover max-h-96"
        />
      )}
      <div className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/80">
        {article.content}
      </div>
    </div>
  );
}
