"use client";

import { useState, useTransition } from "react";
import { addPhoto, deletePhoto } from "@/app/admin/(dashboard)/album/actions";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB

interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
}

export default function AlbumManager({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Η εικόνα είναι πολύ μεγάλη (μέγιστο 3MB).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function upload() {
    if (!pendingImage) {
      setError("Διάλεξε μια φωτογραφία.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await addPhoto(pendingImage, caption);
      if (result.status === "ok") {
        setPhotos((prev) => [
          { id: `tmp-${Date.now()}`, imageUrl: pendingImage, caption: caption || null },
          ...prev,
        ]);
        setPendingImage(null);
        setCaption("");
      } else {
        setError(result.message);
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Να διαγραφεί αυτή η φωτογραφία;")) return;
    startTransition(async () => {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div>
      <div className="mt-6 rounded-2xl border border-line bg-cream/40 p-5">
        <h2 className="font-medium text-foreground mb-3">Νέα φωτογραφία</h2>
        {pendingImage && (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset
          <img
            src={pendingImage}
            alt=""
            className="mb-3 w-full max-w-xs rounded-lg border border-line object-cover"
          />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
        <div className="mt-3">
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Λεζάντα (προαιρετικό)
          </label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="π.χ. Ημιμόνιμο σε ροζ αποχρώσεις"
            className="w-full rounded-lg border border-line px-4 py-2.5"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={upload}
          disabled={isPending || !pendingImage}
          className="mt-4 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
        >
          {isPending ? "Ανέβασμα…" : "Ανέβασμα"}
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="mt-6 text-foreground/60">Δεν υπάρχουν ακόμα φωτογραφίες.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="rounded-xl overflow-hidden border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset */}
              <img src={p.imageUrl} alt="" className="w-full aspect-square object-cover" />
              <div className="p-2">
                {p.caption && <p className="text-xs text-foreground/60">{p.caption}</p>}
                <button
                  onClick={() => remove(p.id)}
                  className="mt-1 text-xs text-red-600 hover:underline"
                >
                  Διαγραφή
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
