import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ServiceForm from "@/components/admin/ServiceForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

type Props = { params: Promise<{ id: string }> };

export default async function EditServicePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceCategory.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!service) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/prestations" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour aux prestations
      </Link>
      <h1 className={ui.h1}>Modifier « {service.name} »</h1>
      <ServiceForm categories={categories} service={service} />
    </div>
  );
}