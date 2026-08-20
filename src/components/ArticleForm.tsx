"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createArticle,
  updateArticle,
  ArticleInput,
} from "@/app/admin/(dashboard)/tips/actions";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB

export default function ArticleForm({
  articleId,
  initial,
}: {
  articleId?: string;
  initial?: ArticleInput;
}) {
  const [form, setForm] = useState<ArticleInput>(
    initial ?? { title: "", content: "", imageUrl: null, published: true }
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Η εικόνα είναι πολύ μεγάλη (μέγιστο 3MB).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function save() {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Συμπλήρωσε τίτλο και περιεχόμενο.");
      return;
    }
    setError("");
    startTransition(async () => {
      if (articleId) {
        await updateArticle(articleId, form);
      } else {
        await createArticle(form);
      }
      router.push("/admin/tips");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
        {articleId ? "Επεξεργασία άρθρου" : "Νέο άρθρο"}
      </h1>

      <div className="mt-6">
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Τίτλος *
        </label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-line px-4 py-2.5"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Εικόνα (προαιρετικό)
        </label>
        {form.imageUrl && (
          <div className="relative mb-2 w-full max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, όχι στατικό asset */}
            <img
              src={form.imageUrl}
              alt=""
              className="w-full rounded-lg border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}
              className="mt-1 text-xs text-red-600 hover:underline"
            >
              Αφαίρεση εικόνας
            </button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Περιεχόμενο *
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={12}
          className="w-full rounded-lg border border-line px-4 py-2.5"
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-foreground/80">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Δημοσιευμένο (ορατό στους πελάτες)
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push("/admin/tips")}
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          Άκυρο
        </button>
        <button
          onClick={save}
          disabled={isPending}
          className="rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
        >
          {isPending ? "Αποθήκευση…" : "Αποθήκευση"}
        </button>
      </div>
    </div>
  );
}
