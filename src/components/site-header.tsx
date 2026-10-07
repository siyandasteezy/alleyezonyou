"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { site } from "@/lib/site";
import { useCart } from "./cart";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl font-semibold" onClick={() => setOpen(false)}>
          {site.shortName}
        </Link>

        <Suspense fallback={<DesktopNav pathname="" />}>
          <CurrentDesktopNav />
        </Suspense>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="btn-ghost relative px-3" aria-label={`Cart, ${count} items`}>
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-ink">
                {count}
              </span>
            )}
          </Link>
          <Link href="/book" className="btn-primary hidden sm:inline-flex">
            Book now
          </Link>
          <button
            type="button"
            className="btn-ghost px-3 md:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-bg md:hidden">
          <div className="container-x flex flex-col py-2">
            {[...NAV, { href: "/book", label: "Book an appointment" }].map((item) => (
              <Link key={item.href} href={item.href} className="py-3 text-base" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function CurrentDesktopNav() {
  return <DesktopNav pathname={usePathname()} />;
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full px-4 py-2 text-sm transition hover:bg-surface-2 ${
            pathname.startsWith(item.href) ? "font-semibold" : "text-muted"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 016 0" />
    </svg>
  );
}
