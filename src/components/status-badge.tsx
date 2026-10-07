const STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-success/10 text-success",
  paid: "bg-success/10 text-success",
  ready: "bg-accent-soft text-accent",
  shipped: "bg-accent-soft text-accent",
  completed: "bg-surface-2 text-ink",
  cancelled: "bg-danger/10 text-danger",
};

const LABELS: Record<string, string> = {
  ready: "Ready for pickup",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STYLES[status] ?? "bg-surface-2"}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
