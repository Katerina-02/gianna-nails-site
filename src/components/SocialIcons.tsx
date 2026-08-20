import { SHOP } from "@/lib/shop";

export default function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={SHOP.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="text-foreground/60 hover:text-rose-dark transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      </a>
      <a
        href={SHOP.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="text-foreground/60 hover:text-rose-dark transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 8.5h2.2V5.3h-2.2c-2.1 0-3.6 1.5-3.6 3.6v1.6H8.5v3.2h1.9V19h3.2v-5.3h2.2l.5-3.2h-2.7V9c0-.3.2-.5.4-.5Z"
            stroke="currentColor"
            strokeWidth="0.6"
            fill="currentColor"
          />
        </svg>
      </a>
    </div>
  );
}
