import { site } from "./site";

const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
});

export function money(cents: number) {
  return zar.format(cents / 100);
}

export function duration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: site.timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(new Date(d));
}

export function formatTime(d: Date | string) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: site.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(d));
}

export function formatDateTime(d: Date | string) {
  return `${formatDate(d)} · ${formatTime(d)}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}
