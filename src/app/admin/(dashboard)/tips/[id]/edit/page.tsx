import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ArticleForm from "@/components/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <ArticleForm
      articleId={article.id}
      initial={{
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl,
        published: article.published,
      }}
    />
  );
}
