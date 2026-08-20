"use client";

import { useState } from "react";

interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
}

export default function AlbumGrid({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p)}
            className="rounded-xl overflow-hidden border border-line group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset */}
            <img
              src={p.imageUrl}
              alt={p.caption ?? ""}
              className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset */}
            <img
              src={selected.imageUrl}
              alt={selected.caption ?? ""}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            {selected.caption && (
              <p className="mt-3 text-center text-cream">{selected.caption}</p>
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-3 mx-auto block rounded-full bg-white/10 px-5 py-2 text-sm text-white hover:bg-white/20"
            >
              Κλείσιμο
            </button>
          </div>
        </div>
      )}
    </>
  );
}
