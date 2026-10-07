import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-2">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-semibold">{site.shortName}</p>
          <p className="mt-2 text-sm text-muted">{site.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Visit</p>
          <p className="text-muted">
            {site.address.line1}
            <br />
            {site.address.suburb}, {site.address.city}
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Hours</p>
          <ul className="space-y-1 text-muted">
            {site.hours.map((h) => (
              <li key={h.days}>
                {h.days}: {h.time}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Get in touch</p>
          <ul className="space-y-1 text-muted">
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            </li>
            <li>
              <a href={`https://wa.me/${site.whatsapp}`}>WhatsApp us</a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li className="flex gap-3 pt-2">
              <a href={site.social.instagram}>Instagram</a>
              <a href={site.social.facebook}>Facebook</a>
              <a href={site.social.tiktok}>TikTok</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {site.name}</p>
        <Link href="/admin">Staff login</Link>
      </div>
    </footer>
  );
}
