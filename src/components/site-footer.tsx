import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="bg-night text-white/70">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{site.tagline}</p>
          <Link href="/book" className="btn-primary mt-6">
            Book a treatment
          </Link>
        </div>
        <FooterCol title="Visit">
          <p>
            {site.address.line1}
            <br />
            {site.address.suburb}, {site.address.city}
          </p>
        </FooterCol>
        <FooterCol title="Hours">
          <ul className="space-y-1.5">
            {site.hours.map((h) => (
              <li key={h.days}>
                <span className="text-white">{h.days}</span>
                <br />
                {h.time}
              </li>
            ))}
          </ul>
        </FooterCol>
        <FooterCol title="Get in touch">
          <ul className="space-y-1.5">
            <li>
              <a className="hover:text-white" href={`tel:${site.phone.replace(/\s/g, "")}`}>
                {site.phone}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`tel:${site.altPhone.replace(/\s/g, "")}`}>
                {site.altPhone}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`https://wa.me/${site.whatsapp}`}>
                WhatsApp us
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-4 text-[11px] font-semibold tracking-[0.2em] uppercase">
            <a className="hover:text-gold" href={site.social.instagram}>
              Instagram
            </a>
            <a className="hover:text-gold" href={site.social.tiktok}>
              TikTok
            </a>
            <a className="hover:text-gold" href={site.social.facebook}>
              Facebook
            </a>
          </div>
        </FooterCol>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs sm:flex-row sm:justify-between">
          <p>
            © {site.name} · <span className="italic">Beauty intensifi-eye-d</span>
          </p>
          <Link href="/admin" className="hover:text-white">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm">
      <p className="mb-4 text-[11px] font-semibold tracking-[0.28em] text-gold uppercase">{title}</p>
      {children}
    </div>
  );
}
