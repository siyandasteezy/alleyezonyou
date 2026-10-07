// South Africa has no daylight saving, so salon-local time is always UTC+02:00.
const OFFSET = "+02:00";
const OFFSET_MS = 2 * 60 * 60 * 1000;

/** "YYYY-MM-DD" for the given instant in salon-local time. */
export function localDateString(d: Date = new Date()) {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

/** "HH:MM" for the given instant in salon-local time. */
export function localTimeString(d: Date) {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(11, 16);
}

/** Instant for a salon-local date ("YYYY-MM-DD") and time ("HH:MM"). */
export function toInstant(date: string, time: string) {
  return new Date(`${date}T${time}:00${OFFSET}`);
}

/** 0 = Sunday … 6 = Saturday for a salon-local date string. */
export function weekdayOf(date: string) {
  return new Date(`${date}T12:00:00${OFFSET}`).getUTCDay();
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function minutesOf(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function timeOf(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const isDateString = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isTimeString = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
