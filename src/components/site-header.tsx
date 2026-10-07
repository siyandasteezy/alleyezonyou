"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { site } from "@/lib/site";
import { useCart } from "./cart";
import { Logo } from "./logo";

const NAV = [
  { href: "/services", label: "Treatments" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-blush text-ink">
        <div className="container-x flex h-9 items-center justify-center gap-6 text-[11px] font-medium tracking-[0.18em] uppercase sm:justify-between">
          <span>Book online · Pay at the spa</span>
          <a href={`https://wa.me/${site.whatsapp}`} className="hidden hover:text-accent sm:inline">
            WhatsApp {site.phone}
          </a>
        </div>
      </div>

      <div className="border-b border-white/10 bg-night/95 text-white backdrop-blur">
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <Link href="/" onClick={() => setOpen(false)} aria-label={`${site.name} home`}>
            <Logo tone="light" />
          </Link>

          <Suspense fallback={<DesktopNav pathname="" />}>
            <CurrentDesktopNav />
          </Suspense>

          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10"
              aria-label={`Cart, ${count} items`}
            >
              <CartIcon />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-semibold text-night">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/book" className="btn-primary hidden sm:inline-flex">
              Book now
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10 lg:hidden"
              aria-expanded={open}
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-white/10 lg:hidden">
            <div className="container-x flex flex-col py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-white/10 py-4 font-display text-2xl"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/book" className="btn-primary mt-5 mb-2" onClick={() => setOpen(false)}>
                Book a treatment
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function CurrentDesktopNav() {
  return <DesktopNav pathname={usePathname()} />;
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative py-2 text-xs font-medium tracking-[0.2em] uppercase transition hover:text-blush ${
              active ? "text-white" : "text-white/70"
            }`}
          >
            {item.label}
            {active && <span className="absolute inset-x-0 -bottom-0.5 h-px bg-gold" />}
          </Link>
        );
      })}
    </nav>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 016 0" />
    </svg>
  );
}
