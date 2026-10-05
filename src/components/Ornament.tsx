type Props = { align?: "center" | "start"; className?: string };

export default function Ornament({ align = "center", className = "" }: Props) {
  return (
    <div
      className={`flex items-center gap-3 text-or ${align === "center" ? "justify-center" : "justify-start"} ${className}`}
    >
      <span className="h-px w-14 bg-current opacity-60" />
      <svg viewBox="0 0 28 12" className="h-3 w-7" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
        <path d="M14 1 L19 6 L14 11 L9 6 Z" />
        <circle cx="3" cy="6" r="1.4" fill="currentColor" />
        <circle cx="25" cy="6" r="1.4" fill="currentColor" />
      </svg>
      <span className="h-px w-14 bg-current opacity-60" />
    </div>
  );
}