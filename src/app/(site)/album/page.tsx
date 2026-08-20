import { db } from "@/lib/db";
import AlbumGrid from "@/components/AlbumGrid";

export const dynamic = "force-dynamic";

export default async function AlbumPage() {
  const photos = await db.photo.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-rose-dark text-center">
        Άλμπουμ
      </h1>
      <p className="mt-3 text-center text-foreground/70">
        Λίγα δείγματα από τη δουλειά μας.
      </p>

      {photos.length === 0 ? (
        <p className="mt-10 text-center text-foreground/60">
          Δεν υπάρχουν ακόμα φωτογραφίες.
        </p>
      ) : (
        <AlbumGrid
          photos={photos.map((p) => ({
            id: p.id,
            imageUrl: p.imageUrl,
            caption: p.caption,
          }))}
        />
      )}
    </div>
  );
}
