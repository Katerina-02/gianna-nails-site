"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/app/admin/logout/actions";

const LINKS = [
  { href: "/admin", label: "Ραντεβού" },
  { href: "/admin/services", label: "Υπηρεσίες" },
  { href: "/admin/tips", label: "Συμβουλές" },
  { href: "/admin/album", label: "Άλμπουμ" },
  { href: "/admin/closed-dates", label: "Διακοπές" },
  { href: "/admin/settings", label: "Ρυθμίσεις" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="no-print sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-16">
        <span className="font-[family-name:var(--font-heading)] text-lg font-semibold text-rose-dark">
          Πίνακας διαχείρισης
        </span>
        <nav className="flex items-center gap-5">
          {LINKS.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  active ? "text-rose-dark" : "text-foreground/70 hover:text-rose-dark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() =>
              logout().then(() => {
                router.replace("/admin/login");
                router.refresh();
              })
            }
            className="text-sm font-medium text-foreground/50 hover:text-red-600"
          >
            Αποσύνδεση
          </button>
        </nav>
      </div>
    </header>
  );
}
