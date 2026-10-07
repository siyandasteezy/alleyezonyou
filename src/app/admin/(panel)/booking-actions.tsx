import Link from "next/link";
import { SubmitButton } from "@/components/confirm-button";
import type { BookingStatus } from "@/db/schema";
import { setBookingStatus } from "../actions";

export function BookingActions({
  id,
  status,
  showEdit = true,
}: {
  id: number;
  status: BookingStatus;
  showEdit?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {status === "pending" && (
        <form action={setBookingStatus.bind(null, id, "confirmed")}>
          <SubmitButton className="btn-primary btn-sm">Confirm</SubmitButton>
        </form>
      )}
      {status === "confirmed" && (
        <form action={setBookingStatus.bind(null, id, "completed")}>
          <SubmitButton>Complete</SubmitButton>
        </form>
      )}
      {showEdit && (status === "pending" || status === "confirmed") && (
        <Link href={`/admin/bookings/${id}`} className="btn-outline btn-sm">
          Reschedule
        </Link>
      )}
      {(status === "pending" || status === "confirmed") && (
        <form action={setBookingStatus.bind(null, id, "cancelled")}>
          <SubmitButton
            confirm="Cancel this booking? The client will be emailed."
            className="btn-ghost btn-sm text-danger"
          >
            Cancel
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
