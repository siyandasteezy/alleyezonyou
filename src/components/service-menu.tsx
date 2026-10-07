import Link from "next/link";
import type { Service } from "@/lib/catalog";
import { duration, money } from "@/lib/format";

export function ServiceMenu({ services }: { services: Service[] }) {
  const categories = [...new Set(services.map((s) => s.category))];
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {categories.map((category) => (
        <section key={category}>
          <h3 className="mb-4 text-2xl font-semibold">{category}</h3>
          <ul className="divide-y divide-line border-y border-line">
            {services
              .filter((s) => s.category === category)
              .map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    {s.description && <p className="mt-0.5 text-sm text-muted">{s.description}</p>}
                    <p className="mt-1 text-xs text-muted">{duration(s.durationMins)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="font-medium whitespace-nowrap">
                      {s.priceFrom && <span className="text-xs text-muted">from </span>}
                      {money(s.priceCents)}
                    </p>
                    <Link
                      href={`/book?service=${s.id}`}
                      className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Book
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-4xl font-semibold sm:text-5xl">{title}</h2>
      {children && <div className="mt-4 text-muted">{children}</div>}
    </div>
  );
}
