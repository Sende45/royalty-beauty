import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" }, select: { url: true, publicId: true } } },
    }),
    prisma.productCategory.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/produits" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour aux produits
      </Link>
      <h1 className={ui.h1}>Modifier « {product.name} »</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}