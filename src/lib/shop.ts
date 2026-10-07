import { site } from "./site";

export type Fulfilment = "delivery" | "pickup";

export function deliveryFee(subtotalCents: number, fulfilment: Fulfilment) {
  if (fulfilment === "pickup" || subtotalCents >= site.freeDeliveryFromCents) return 0;
  return site.deliveryFeeCents;
}
