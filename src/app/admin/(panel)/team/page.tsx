import Link from "next/link";
import { asc } from "drizzle-orm";
import { PageHeader, Table, Td } from "@/components/admin-ui";
import { db, schema } from "@/db";
import { WEEKDAYS } from "@/lib/time";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Team & hours" };

export default async function TeamPage() {
  await requireAdmin();
  const stylists = await db.query.stylists.findMany({
    with: { hours: true, services: true },
    orderBy: [asc(schema.stylists.sortOrder), asc(schema.stylists.name)],
  });

  return (
    <>
      <PageHeader title="Team & hours">
        <Link href="/admin/team/new" className="btn-primary">
          Add team member
        </Link>
      </PageHeader>
      <Table head={["Name", "Working days", "Services", "Clients per slot", "Bookable"]}>
        {stylists.map((s) => (
          <tr key={s.id}>
            <Td>
              <Link href={`/admin/team/${s.id}`} className="font-medium text-accent hover:underline">
                {s.name}
              </Link>
              <p className="text-xs text-muted">{s.role}</p>
            </Td>
            <Td>
              {s.hours.length
                ? s.hours
                    .toSorted((a, b) => a.weekday - b.weekday)
                    .map((h) => `${WEEKDAYS[h.weekday].slice(0, 3)} ${h.startTime}–${h.endTime}`)
                    .join(", ")
                : "—"}
            </Td>
            <Td>{s.services.length}</Td>
            <Td>{s.capacity}</Td>
            <Td>{s.active ? "Yes" : <span className="text-muted">No</span>}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
