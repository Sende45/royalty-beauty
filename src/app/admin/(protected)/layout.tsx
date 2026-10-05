import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Administration — Royalty Beauty",
  robots: { index: false, follow: false },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  return <AdminShell userName={session.name}>{children}</AdminShell>;
}