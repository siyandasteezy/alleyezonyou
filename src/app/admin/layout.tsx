import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s · Admin · ${site.shortName}` },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col bg-surface-2/50">{children}</div>;
}
