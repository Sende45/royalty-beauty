import Image from "next/image";
import Link from "next/link";
import { Check, Eye, EyeOff, FolderPlus, Package, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import ConfirmButton from "@/components/admin/ConfirmButton";
import {
  createProductCategory,
  deleteProduct,
  deleteProductCategory,
  toggleProduct,
  updateStock,
} from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  await requireAdmin();

  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={ui.h1}>Produits</h1>
          <p className="mt-1 text-sm text-encre/50">
            {products.length} produit{products.length > 1 ? "s" : ""} dans la boutique.
          </p>
        </div>
        <Link href="/admin/produits/nouveau" className={ui.btnPrimary}>
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Link>
      </div>

      {/* Catégories */}
      <section className={`${ui.card} space-y-4`}>
        <h2 className="font-display text-lg text-encre">Catégories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-full bg-prune-light px-3 py-1.5 text-sm text-prune"
            >
              {c.name}
              <span className="text-xs opacity-60">{c._count.products}</span>
              {c._count.products === 0 && (
                <ConfirmButton
                  action={deleteProductCategory.bind(null, c.id)}
                  message={`Supprimer la catégorie « ${c.name} » ?`}
                  className="rounded-full p-0.5 hover:bg-white"
                  title="Supprimer"
                >
                  <X className="h-3.5 w-3.5" />
                </ConfirmButton>
              )}
            </span>
          ))}
        </div>
        <form action={createProductCategory} className="flex flex-col gap-3 sm:flex-row">
          <input name="name" required minLength={2} placeholder="Nouvelle catégorie" className={ui.input} />
          <button type="submit" className={`${ui.btnGhost} shrink-0`}>
            <FolderPlus className="h-4 w-4" />
            Ajouter
          </button>
        </form>
      </section>

      {/* Liste des produits */}
      {products.length === 0 ? (
        <div className={`${ui.card} py-12 text-center`}>
          <Package className="mx-auto h-10 w-10 text-prune/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-encre/50">Aucun produit pour le moment.</p>
        </div>
      ) : (
        <div className={`${ui.card} !p-0`}>
          <ul className="divide-y divide-prune/10">
            {products.map((p) => (
              <li key={p.id} className={`flex flex-wrap items-center gap-4 p-4 ${p.isActive ? "" : "opacity-60"}`}>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-prune-light">
                  {p.images[0] ? (
                    <Image src={p.images[0].url} alt={p.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <Package className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-prune/30" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-encre">{p.name}</p>
                    {p.isFeatured && <Star className="h-3.5 w-3.5 fill-or text-or" />}
                    {!p.isActive && (
                      <span className="rounded-full bg-encre/5 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-encre/50">
                        Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-encre/50">{p.category?.name ?? "Sans catégorie"}</p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold text-prune">{formatFCFA(p.price)}</span>
                    {p.compareAtPrice && (
                      <span className="ml-2 text-xs text-encre/40 line-through">{formatFCFA(p.compareAtPrice)}</span>
                    )}
                  </p>
                </div>

                {/* Stock rapide */}
                <form action={updateStock.bind(null, p.id)} className="flex items-center gap-1">
                  <span className={`text-xs ${p.stock === 0 ? "font-semibold text-red-600" : "text-encre/50"}`}>
                    Stock
                  </span>
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    defaultValue={p.stock}
                    className={`${ui.input} !w-20 !px-2 !py-1.5 text-center`}
                  />
                  <button type="submit" className={ui.iconBtn} title="Mettre à jour le stock">
                    <Check className="h-4 w-4" />
                  </button>
                </form>

                <div className="flex items-center gap-1">
                  <form action={toggleProduct.bind(null, p.id)}>
                    <button type="submit" className={ui.iconBtn} title={p.isActive ? "Masquer" : "Afficher"}>
                      {p.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </form>
                  <Link href={`/admin/produits/${p.id}`} className={ui.iconBtn} title="Modifier">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <ConfirmButton
                    action={deleteProduct.bind(null, p.id)}
                    message={`Supprimer « ${p.name} » ? S'il a déjà été commandé, il sera seulement masqué.`}
                    className={`${ui.iconBtn} hover:!bg-red-50 hover:!text-red-600`}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}