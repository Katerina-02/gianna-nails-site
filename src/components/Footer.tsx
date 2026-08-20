import Link from "next/link";
import { SHOP } from "@/lib/shop";
import SocialIcons from "@/components/SocialIcons";

export default function Footer() {
  return (
    <footer className="no-print border-t border-line bg-cream mt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/60">
        <div className="text-center sm:text-left">
          <p className="font-medium text-foreground/80">{SHOP.name}</p>
          <a
            href={SHOP.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rose-dark"
          >
            {SHOP.address}
          </a>
          <p>
            <a href={`tel:${SHOP.phoneHref}`} className="hover:text-rose-dark">
              {SHOP.phone}
            </a>{" "}
            · {SHOP.hoursText}
          </p>
          <p>{SHOP.closedText}</p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-2">
          <SocialIcons />
          <p>© {new Date().getFullYear()} {SHOP.name}</p>
          <Link href="/policy" className="hover:text-rose-dark">
            Πολιτική καταστήματος
          </Link>
          <Link href="/admin/login" className="hover:text-rose-dark">
            Είσοδος διαχειριστή
          </Link>
        </div>
      </div>
    </footer>
  );
}
