type Props = { showText?: boolean; light?: boolean; className?: string };

export function Crown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 34" className={className} fill="currentColor" aria-hidden>
      <path d="M4 26 L9 7 L20 17 L32 1 L44 17 L55 7 L60 26 Z" />
      <rect x="4" y="28" width="56" height="5" rx="1.5" />
      <circle cx="9" cy="5" r="2.5" />
      <circle cx="32" cy="2" r="2.5" />
      <circle cx="55" cy="5" r="2.5" />
    </svg>
  );
}

export default function Logo({ showText = true, light = false, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-2 xs:gap-3 ${className}`}>
      <div className="flex shrink-0 flex-col items-center leading-none text-or">
        <Crown className="h-3 w-6 xs:h-3.5 xs:w-7" />
        <span className="font-serif text-xl font-medium xs:text-2xl">RB</span>
      </div>
      {showText && (
        <div className="min-w-0 leading-tight">
          <p
            className={`whitespace-nowrap font-display text-base tracking-wide xs:text-lg ${
              light ? "text-ivoire" : "text-encre"
            }`}
          >
            Royalty Beauty
          </p>
          <p
            className={`whitespace-nowrap text-[0.5rem] uppercase tracking-[0.25em] xs:text-[0.6rem] xs:tracking-[0.35em] ${
              light ? "text-ivoire/60" : "text-encre/60"
            }`}
          >
            Salon de coiffure
          </p>
        </div>
      )}
    </div>
  );
}