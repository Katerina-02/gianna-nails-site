import { db } from "@/lib/db";
import AlbumManager from "@/components/AlbumManager";

export const dynamic = "force-dynamic";

export default async function AdminAlbumPage() {
  const photos = await db.photo.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
        Άλμπουμ
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Ανέβασε φωτογραφίες από τη δουλειά σου — θα εμφανίζονται στη δημόσια
        σελίδα Άλμπουμ.
      </p>
      <AlbumManager
        initialPhotos={photos.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          caption: p.caption,
        }))}
      />
    </div>
  );
}
