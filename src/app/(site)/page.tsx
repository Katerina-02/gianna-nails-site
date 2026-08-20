import Link from "next/link";
import Image from "next/image";
import { SHOP } from "@/lib/shop";

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-cream to-background">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="flex justify-center">
            <Image
              src="/logo.png"
              alt={SHOP.name}
              width={3464}
              height={3464}
              priority
              className="w-48 sm:w-56 h-auto"
            />
          </h1>
          {/* Πρόχειρο κείμενο — θα αλλάξει μόλις οριστικοποιηθούν τα λόγια της ιδιοκτήτριας */}
          <p className="mt-5 text-lg text-foreground/70 max-w-2xl mx-auto">
            Καλωσήρθατε! Στο μαγαζί μας φροντίζουμε τα χέρια και τα πόδια σας
            με αγάπη και προσοχή στη λεπτομέρεια — από απλό περιποιημένο
            μανικιούρ μέχρι επιμήκυνση νυχιών, πάντα με το χαμόγελο στα
            χείλη.
          </p>
          <p className="mt-3 text-lg text-foreground/70 max-w-2xl mx-auto">
            Κλείστε το ραντεβού σας online, εύκολα και γρήγορα, όποια ώρα
            θέλετε — χωρίς τηλεφώνημα.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/appointments"
              className="rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose-dark transition-colors"
            >
              Κλείσε ραντεβού
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-rose px-6 py-3 text-sm font-semibold text-rose-dark hover:bg-cream transition-colors"
            >
              Δες τις υπηρεσίες
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 grid sm:grid-cols-3 gap-8 text-center">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-rose-dark">
            Ωράριο
          </h2>
          <p className="mt-2 text-foreground/70">{SHOP.hoursText}</p>
          <p className="mt-1 text-sm text-foreground/50">{SHOP.closedText}</p>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-rose-dark">
            Πού θα μας βρείτε
          </h2>
          <a
            href={SHOP.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-foreground/70 hover:text-rose-dark"
          >
            {SHOP.address}
          </a>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-rose-dark">
            Επικοινωνία
          </h2>
          <p className="mt-2 text-foreground/70">
            <a href={`tel:${SHOP.phoneHref}`} className="hover:text-rose-dark">
              {SHOP.phone}
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <a
          href={SHOP.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-2xl border border-line"
        >
          <iframe
            src={SHOP.mapsEmbedUrl}
            title="Χάρτης τοποθεσίας"
            className="w-full h-72 pointer-events-none"
            loading="lazy"
          />
        </a>
        <div className="mt-3 text-center">
          <a
            href={SHOP.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-rose px-5 py-2 text-sm font-semibold text-rose-dark hover:bg-cream transition-colors"
          >
            Άνοιξε στο Google Maps
          </a>
        </div>
      </section>
    </div>
  );
}
