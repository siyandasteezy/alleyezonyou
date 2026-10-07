"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/customers";
import { saveProduct } from "../../../actions";

type Props = {
  categories: { id: number; name: string }[];
  product: {
    id: number;
    name: string;
    categoryId: number | null;
    price: string;
    stock: number;
    description: string;
    images: string;
    active: boolean;
  } | null;
};

export function ProductForm({ categories, product }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={action} className="card space-y-4 p-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input id="name" name="name" defaultValue={product?.name} required className="input" />
        {err("name") && <p className="mt-1 text-xs text-danger">{err("name")}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="categoryId">
            Category
          </label>
          <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? 0} className="input">
            <option value={0}>None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price">
            Price (R)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price}
            required
            className="input"
          />
          {err("price") && <p className="mt-1 text-xs text-danger">{err("price")}</p>}
        </div>
        <div>
          <label className="label" htmlFor="stock">
            Stock on hand
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            required
            className="input"
          />
          {err("stock") && <p className="mt-1 text-xs text-danger">{err("stock")}</p>}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea id="description" name="description" rows={5} defaultValue={product?.description} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="images">
          Image URLs <span className="font-normal text-muted">(one per line; the first is the main image)</span>
        </label>
        <textarea
          id="images"
          name="images"
          rows={3}
          defaultValue={product?.images}
          placeholder="https://…"
          className="input font-mono text-xs"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Visible in the shop
      </label>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
