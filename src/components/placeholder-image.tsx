/* eslint-disable @next/next/no-img-element -- product/team images are arbitrary URLs set in admin */

// Shows the real image when one is set, otherwise a labelled block marking where imagery goes.
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
      className={`grid h-full w-full place-items-center bg-gradient-to-br from-accent-soft to-surface-2 text-xs tracking-widest text-muted uppercase ${className}`}
    >
      {label ?? alt}
    </div>
  );
}
