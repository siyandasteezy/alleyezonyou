"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/customers";
import { rescheduleBooking } from "../../../actions";

export function RescheduleForm({
  id,
  stylists,
  defaults,
}: {
  id: number;
  stylists: { id: number; name: string }[];
  defaults: { stylistId: number; date: string; time: string };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(rescheduleBooking, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className="label" htmlFor="stylistId">
          Stylist
        </label>
        <select id="stylistId" name="stylistId" defaultValue={defaults.stylistId} className="input">
          {stylists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="date">
            Date
          </label>
          <input id="date" name="date" type="date" defaultValue={defaults.date} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="time">
            Time
          </label>
          <input id="time" name="time" type="time" step={900} defaultValue={defaults.time} required className="input" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="override" /> Ignore availability (double-book or outside hours)
      </label>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save & notify client"}
      </button>
    </form>
  );
}
