/* eslint-disable @next/next/no-img-element -- product/team images are arbitrary URLs set in admin */
import { EyeMark } from "./logo";

// Shows the real image when one is set, otherwise a branded blush tile marking where imagery goes.
export function PlaceholderImage({
  src,
  alt,
  label,
  className = "",
}: {
  src?: string | null;
  alt: string;
  label?: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,#fff_0%,var(--blush)_55%,#e7c3cb_100%)] text-ink/60 ${className}`}
    >
      <EyeMark className="h-8 w-10 opacity-60" />
      {label && <span className="text-[10px] font-semibold tracking-[0.25em] uppercase">{label}</span>}
    </div>
  );
}
