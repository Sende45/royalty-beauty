import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ServiceForm from "@/components/admin/ServiceForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

export default async function NewServicePage() {
  await requireAdmin();
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/prestations" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour aux prestations
      </Link>
      <h1 className={ui.h1}>Nouvelle prestation</h1>
      <ServiceForm categories={categories} />
    </div>
  );
}