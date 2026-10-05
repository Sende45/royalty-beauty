import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ManualOrderForm from "@/components/admin/ManualOrderForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

export default async function NewOrderPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, stock: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/commandes" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>
      <div>
        <h1 className={ui.h1}>Commande manuelle</h1>
        <p className="mt-1 text-sm text-encre/50">Pour enregistrer une commande reçue par WhatsApp, téléphone ou au salon.</p>
      </div>
      {products.length === 0 ? (
        <p className={`${ui.card} text-center text-sm text-encre/50`}>Aucun produit en stock.</p>
      ) : (
        <ManualOrderForm products={products} />
      )}
    </div>
  );
}