import Link from "next/link";

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-4xl font-semibold">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {hasRows ? (
            children
          ) : (
            <tr>
              <td colSpan={head.length} className="px-4 py-10 text-center text-muted">
                {empty ?? "Nothing here yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function FilterTabs({
  items,
  active,
}: {
  items: { href: string; label: string; key: string }[];
  active: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((i) => (
        <Link
          key={i.key}
          href={i.href}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
            i.key === active ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}

export function Stat({ label, value, href }: { label: string; value: React.ReactNode; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="card block p-5 transition hover:border-accent">
      {body}
    </Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}
