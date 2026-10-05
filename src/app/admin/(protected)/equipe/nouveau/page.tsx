import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StylistForm from "@/components/admin/StylistForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

export default async function NewStylistPage() {
  await requireAdmin();

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      services: { where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/equipe" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;équipe
      </Link>
      <h1 className={ui.h1}>Nouvelle coiffeuse</h1>
      <StylistForm categories={categories.filter((c) => c.services.length > 0)} />
    </div>
  );
}