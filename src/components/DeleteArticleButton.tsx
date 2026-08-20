"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticle } from "@/app/admin/(dashboard)/tips/actions";

export default function DeleteArticleButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm("Να διαγραφεί αυτό το άρθρο;")) return;
        startTransition(async () => {
          await deleteArticle(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-60"
    >
      Διαγραφή
    </button>
  );
}
