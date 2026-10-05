import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.productCategory.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/produits" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour aux produits
      </Link>
      <h1 className={ui.h1}>Nouveau produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}