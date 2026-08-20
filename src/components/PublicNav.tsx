"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SHOP } from "@/lib/shop";

const LINKS = [
  { href: "/", label: "Αρχική" },
  { href: "/services", label: "Υπηρεσίες" },
  { href: "/album", label: "Άλμπουμ" },
  { href: "/tips", label: "Συμβουλές" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-xl font-semibold text-rose-dark"
        >
          {SHOP.name}
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-rose-dark"
                    : "text-foreground/70 hover:text-rose-dark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/appointments"
            className="rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose-dark transition-colors"
          >
            Κλείσε ραντεβού
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 text-rose-dark"
          aria-label="Μενού"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="sm:hidden border-t border-line bg-cream px-4 py-3 flex flex-col gap-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-foreground/80"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/appointments"
            onClick={() => setOpen(false)}
            className="rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white text-center hover:bg-rose-dark transition-colors"
          >
            Κλείσε ραντεβού
          </Link>
        </nav>
      )}
    </header>
  );
}
