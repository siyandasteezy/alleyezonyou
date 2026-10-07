"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/customers";
import { WEEKDAYS } from "@/lib/time";
import { saveStylist } from "../../../actions";

type Props = {
  services: { id: number; name: string; category: string }[];
  stylist: {
    id: number;
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
    capacity: number;
    active: boolean;
    serviceIds: number[];
    hours: { weekday: number; startTime: string; endTime: string }[];
  } | null;
};

// Monday first, the way the salon reads a week.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function StylistForm({ services, stylist }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveStylist, {});
  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <form action={action} className="card space-y-6 p-6">
      {stylist && <input type="hidden" name="id" value={stylist.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" defaultValue={stylist?.name} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="role">
            Role
          </label>
          <input id="role" name="role" defaultValue={stylist?.role ?? "Stylist"} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="bio">
            Short bio <span className="font-normal text-muted">(shown on the About page)</span>
          </label>
          <textarea id="bio" name="bio" rows={2} defaultValue={stylist?.bio} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="imageUrl">
            Photo URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={stylist?.imageUrl}
            placeholder="https://…"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="capacity">
            Clients at the same time
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            max={10}
            defaultValue={stylist?.capacity ?? 1}
            className="input"
          />
        </div>
      </div>

      <fieldset>
        <legend className="label">Working hours</legend>
        <div className="divide-y divide-line rounded-lg border border-line">
          {WEEK_ORDER.map((d) => {
            const h = stylist?.hours.find((x) => x.weekday === d);
            return (
              <div key={d} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <label className="flex w-32 items-center gap-2 text-sm">
                  <input type="checkbox" name={`day-${d}`} defaultChecked={!!h} /> {WEEKDAYS[d]}
                </label>
                <input
                  type="time"
                  name={`start-${d}`}
                  defaultValue={h?.startTime ?? "08:00"}
                  step={900}
                  className="input w-32 py-1.5"
                />
                <span className="text-muted">to</span>
                <input
                  type="time"
                  name={`end-${d}`}
                  defaultValue={h?.endTime ?? "17:00"}
                  step={900}
                  className="input w-32 py-1.5"
                />
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Services they offer</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c}>
              <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">{c}</p>
              {services
                .filter((s) => s.category === c)
                .map((s) => (
                  <label key={s.id} className="flex items-center gap-2 py-0.5 text-sm">
                    <input
                      type="checkbox"
                      name="serviceIds"
                      value={s.id}
                      defaultChecked={stylist?.serviceIds.includes(s.id)}
                    />{" "}
                    {s.name}
                  </label>
                ))}
            </div>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={stylist?.active ?? true} /> Available for online booking
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.fieldErrors && <p className="text-sm text-danger">Please check the highlighted details.</p>}
      <button className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
