import Image from "next/image";
import type { Photo } from "@/lib/images";

/** Dark banner used at the top of inner pages. */
export function PageHero({
  eyebrow,
  title,
  accent,
  children,
  photo,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: React.ReactNode;
  photo?: Photo;
}) {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      {photo && (
        <>
          <Image
            src={photo.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
            style={{ objectPosition: photo.position }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/20" />
        </>
      )}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/25 blur-[110px]" />
      <div className="container-x relative py-20 sm:py-24">
        <p className="eyebrow mb-5 !text-gold">{eyebrow}</p>
        <h1 className="max-w-3xl text-5xl leading-[1.02] sm:text-7xl">
          {title} {accent && <em className="text-blush">{accent}</em>}
        </h1>
        {children && <div className="mt-6 max-w-xl text-white/70 sm:text-lg">{children}</div>}
      </div>
    </section>
  );
}
