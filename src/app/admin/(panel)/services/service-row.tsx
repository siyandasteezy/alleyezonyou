"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/customers";
import { saveService } from "../../actions";

type Service = {
  id: number;
  name: string;
  category: string;
  description: string;
  durationMins: number;
  price: string;
  priceFrom: boolean;
  active: boolean;
};

export function ServiceRow({ service }: { service: Service | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveService, {});
  return (
    <form
      action={action}
      className={`card grid gap-3 p-4 md:grid-cols-[2fr_1.2fr_0.8fr_0.9fr_auto] md:items-end ${service && !service.active ? "opacity-60" : ""}`}
    >
      {service && <input type="hidden" name="id" value={service.id} />}
      <div>
        <label className="label text-xs">Name</label>
        <input name="name" defaultValue={service?.name} required className="input" />
      </div>
      <div>
        <label className="label text-xs">Category</label>
        <input name="category" list="service-categories" defaultValue={service?.category} required className="input" />
      </div>
      <div>
        <label className="label text-xs">Minutes</label>
        <input
          name="durationMins"
          type="number"
          min={15}
          max={600}
          step={15}
          defaultValue={service?.durationMins ?? 60}
          required
          className="input"
        />
      </div>
      <div>
        <label className="label text-xs">Price (R)</label>
        <input
          name="price"
          type="number"
          min={0}
          step="0.01"
          defaultValue={service?.price}
          required
          className="input"
        />
      </div>
      <button className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : service ? "Save" : "Add"}
      </button>
      <div className="md:col-span-5">
        <input
          name="description"
          defaultValue={service?.description}
          placeholder="Short description"
          className="input"
        />
      </div>
      <div className="flex flex-wrap gap-5 text-sm md:col-span-5">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="priceFrom" defaultChecked={service?.priceFrom} /> Show as &ldquo;from&rdquo;
          price
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={service?.active ?? true} /> Bookable online
        </label>
        {state.error && <span className="text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
