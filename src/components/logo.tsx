// Wordmark modelled on the spa's flyer: crowned lashed eye, spaced capitals, "Beauty Spa" underline.
export function Logo({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const ink = tone === "light" ? "text-white" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-3 ${ink} ${className}`}>
      <EyeMark className="h-8 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[15px] font-semibold tracking-[0.28em] uppercase">All Eyez On You</span>
        <span className="mt-1 font-sans text-[9px] font-medium tracking-[0.55em] text-gold uppercase">Beauty Spa</span>
      </span>
    </span>
  );
}

export function EyeMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 38" fill="none" className={className} aria-hidden="true">
      {/* crown */}
      <path
        d="M18 9.5 20 4l3.2 3.4L24 2.5l.8 4.9L28 4l2 5.5z"
        fill="var(--gold)"
        stroke="var(--gold)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* brow */}
      <path d="M8 16c7-6 25-7 33-1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* eye */}
      <path d="M7 26c6-6.5 28-6.5 34 0-6 5.5-28 5.5-34 0z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="24" cy="26" r="4.2" fill="var(--accent)" />
      <circle cx="24" cy="26" r="1.7" fill="currentColor" />
      {/* lashes */}
      <path
        d="M10 22.5 7.5 19M15 20.5l-1.6-3.8M20.5 19.6 20 15.6M27.5 19.6l.5-4M33 20.5l1.6-3.8M38 22.5l2.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
