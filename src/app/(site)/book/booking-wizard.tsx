"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type { Slot } from "@/lib/availability";
import type { Service, Stylist } from "@/lib/catalog";
import type { FormState } from "@/lib/customers";
import { duration, money } from "@/lib/format";
import { addDays } from "@/lib/time";
import { createBooking, fetchSlots } from "./actions";

type Props = {
  services: Service[];
  stylists: Stylist[];
  minDate: string;
  maxDate: string;
};

const ANY = 0;

export function BookingWizard({ services, stylists, minDate, maxDate }: Props) {
  const params = useSearchParams();
  const [serviceId, setServiceId] = useState<number | null>(() => {
    const id = Number(params.get("service"));
    return services.some((s) => s.id === id) ? id : null;
  });
  const [stylistId, setStylistId] = useState<number | null>(() => {
    const id = Number(params.get("stylist"));
    return stylists.some((s) => s.id === id) ? id : null;
  });
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, startLoadingSlots] = useTransition();
  const [state, submit, submitting] = useActionState<FormState, FormData>(createBooking, {});

  const service = services.find((s) => s.id === serviceId) ?? null;
  const eligibleStylists = useMemo(
    () => (serviceId ? stylists.filter((s) => s.serviceIds.includes(serviceId)) : stylists),
    [serviceId, stylists],
  );
  // A stylist picked from the team page may not offer the chosen service.
  const stylistValid = stylistId === ANY || eligibleStylists.some((s) => s.id === stylistId);
  const stylistName = (id: number) => stylists.find((s) => s.id === id)?.name ?? "";

  useEffect(() => {
    if (!serviceId || stylistId === null || !stylistValid) return;
    let cancelled = false;
    startLoadingSlots(async () => {
      const result = await fetchSlots({ serviceId, stylistId: stylistId || null, date });
      if (!cancelled) {
        setSlots(result);
        setTime(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, stylistId, stylistValid, date]);

  const days = useMemo(() => {
    const start = weekStart(date, minDate);
    return Array.from({ length: 14 }, (_, i) => addDays(start, i)).filter((d) => d <= maxDate);
  }, [date, minDate, maxDate]);

  const step = !service ? 1 : stylistId === null || !stylistValid ? 2 : !time ? 3 : 4;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        {/* 1. Service */}
        <Step
          n={1}
          title="Choose a service"
          active={step === 1}
          done={!!service}
          onEdit={() => setServiceId(null)}
          summary={service?.name}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className="card p-4 text-left transition hover:border-accent"
              >
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {s.category} · {duration(s.durationMins)} · {s.priceFrom && "from "}
                  {money(s.priceCents)}
                </p>
              </button>
            ))}
          </div>
        </Step>

        {/* 2. Stylist */}
        <Step
          n={2}
          title="Choose your stylist"
          active={step === 2}
          done={step > 2}
          onEdit={() => setStylistId(null)}
          summary={stylistId === ANY ? "Any available stylist" : stylistId ? stylistName(stylistId) : undefined}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStylistId(ANY)}
              className="card p-4 text-left transition hover:border-accent"
            >
              <p className="font-medium">Any available stylist</p>
              <p className="mt-1 text-xs text-muted">Most availability</p>
            </button>
            {eligibleStylists.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStylistId(s.id)}
                className="card p-4 text-left transition hover:border-accent"
              >
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-xs text-muted">{s.role}</p>
              </button>
            ))}
          </div>
        </Step>

        {/* 3. Date & time */}
        <Step
          n={3}
          title="Pick a date & time"
          active={step === 3}
          done={step > 3}
          onEdit={() => setTime(null)}
          summary={time ? `${prettyDate(date)} at ${time}` : undefined}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-outline px-3"
              disabled={days[0] <= minDate}
              onClick={() => setDate(clamp(addDays(days[0], -14), minDate, maxDate))}
              aria-label="Earlier dates"
            >
              ←
            </button>
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 text-sm transition ${
                    d === date ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:border-ink"
                  }`}
                >
                  <span className="text-[11px] uppercase opacity-80">{prettyDate(d, { weekday: "short" })}</span>
                  <span className="text-lg font-semibold">{Number(d.slice(8))}</span>
                  <span className="text-[11px] opacity-80">{prettyDate(d, { month: "short" })}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn-outline px-3"
              disabled={days[days.length - 1] >= maxDate}
              onClick={() => setDate(clamp(addDays(days[0], 14), minDate, maxDate))}
              aria-label="Later dates"
            >
              →
            </button>
          </div>

          <div className="mt-5 min-h-24">
            {loadingSlots || slots === null ? (
              <p className="text-sm text-muted">Checking availability…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted">No openings on {prettyDate(date)}. Try another day.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    onClick={() => setTime(s.time)}
                    className="rounded-lg border border-line bg-surface py-2.5 text-sm font-medium transition hover:border-accent"
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Step>

        {/* 4. Details */}
        <Step n={4} title="Your details" active={step === 4} done={false}>
          <form action={submit} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="serviceId" value={serviceId ?? ""} />
            <input type="hidden" name="stylistId" value={stylistId ?? ""} />
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="time" value={time ?? ""} />
            <Field label="Full name" name="name" autoComplete="name" errors={state.fieldErrors?.name} />
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" errors={state.fieldErrors?.phone} />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              errors={state.fieldErrors?.email}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">
                Anything we should know? <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="input"
                placeholder="Hair length, inspiration, allergies…"
              />
            </div>
            {state.error && <p className="text-sm text-danger sm:col-span-2">{state.error}</p>}
            <button className="btn-primary py-3 text-base sm:col-span-2" disabled={submitting}>
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        </Step>
      </div>

      {/* Summary */}
      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="text-2xl font-semibold">Your appointment</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Service" value={service?.name} />
          <Row label="Duration" value={service && duration(service.durationMins)} />
          <Row
            label="Stylist"
            value={stylistId === ANY ? "Any available" : stylistId ? stylistName(stylistId) : undefined}
          />
          <Row label="When" value={time ? `${prettyDate(date)}, ${time}` : undefined} />
        </dl>
        {service && (
          <p className="mt-5 flex justify-between border-t border-line pt-4 font-semibold">
            <span>{service.priceFrom ? "From" : "Price"}</span>
            <span>{money(service.priceCents)}</span>
          </p>
        )}
        <p className="mt-4 text-xs text-muted">Payment is made at the spa after your appointment.</p>
      </aside>
    </div>
  );
}

function Step({
  n,
  title,
  active,
  done,
  summary,
  onEdit,
  children,
}: {
  n: number;
  title: string;
  active: boolean;
  done: boolean;
  summary?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`card p-5 sm:p-6 ${active ? "" : "opacity-90"}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-xl font-semibold">
          <span
            className={`grid h-7 w-7 place-items-center rounded-full text-sm ${done ? "bg-accent text-accent-ink" : "bg-surface-2"}`}
          >
            {done ? "✓" : n}
          </span>
          {title}
        </h2>
        {done && onEdit && (
          <button type="button" onClick={onEdit} className="text-sm font-medium text-accent">
            Change
          </button>
        )}
      </div>
      {done && summary && !active && <p className="mt-2 pl-10 text-sm text-muted">{summary}</p>}
      {active && <div className="mt-5">{children}</div>}
    </section>
  );
}

function Field({
  label,
  name,
  errors,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
  errors?: string[];
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} required className="input" {...rest} />
      {errors?.[0] && <p className="mt-1 text-xs text-danger">{errors[0]}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}

function prettyDate(
  d: string,
  opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" },
) {
  return new Intl.DateTimeFormat("en-ZA", { timeZone: "UTC", ...opts }).format(new Date(`${d}T12:00:00Z`));
}

function clamp(d: string, min: string, max: string) {
  return d < min ? min : d > max ? max : d;
}

// Keep the visible 14-day strip stable while the selected date moves within it.
function weekStart(date: string, minDate: string) {
  const diff = Math.round((Date.parse(date) - Date.parse(minDate)) / 86_400_000);
  return addDays(minDate, Math.floor(diff / 14) * 14);
}
