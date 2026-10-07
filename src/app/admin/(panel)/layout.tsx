import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { site } from "@/lib/site";
import { logout } from "../actions";
import { AdminNav } from "./admin-nav";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-b border-line bg-surface md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center justify-between p-4 md:block md:p-6">
          <Link href="/admin" className="font-display text-xl font-semibold">
            {site.shortName}
          </Link>
          <p className="hidden text-xs text-muted md:block">Spa admin</p>
        </div>
        <AdminNav />
        <div className="hidden space-y-1 p-3 md:absolute md:bottom-0 md:block md:w-full">
          <Link href="/" className="btn-ghost w-full justify-start text-muted" target="_blank">
            View website ↗
          </Link>
          <form action={logout}>
            <button className="btn-ghost w-full justify-start text-muted">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <Gate>{children}</Gate>
        </Suspense>
      </main>
    </div>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
