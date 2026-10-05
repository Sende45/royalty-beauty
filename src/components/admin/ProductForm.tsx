"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import ProductImagesField from "@/components/admin/ProductImagesField";
import { saveProduct, type ProductFormState } from "@/actions/products";
import { ui } from "@/lib/admin-ui";

type Props = {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    description: string | null;
    categoryId: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    images: { url: string; publicId: string }[];
  };
};

export default function ProductForm({ categories, product }: Props) {
  const action = saveProduct.bind(null, product?.id ?? null);
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-6"
    >
      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      <section className={`${ui.card} space-y-5`}>
        <h2 className="font-display text-lg text-encre">Photos</h2>
        <ProductImagesField defaultImages={product?.images} />
      </section>

      <section className={`${ui.card} space-y-5`}>
        <h2 className="font-display text-lg text-encre">Informations</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className={ui.label}>Nom du produit</span>
            <input name="name" defaultValue={product?.name} className={ui.input} placeholder="Ex : Huile nourrissante" />
            {err("name") && <p className={ui.error}>{err("name")}</p>}
          </label>
          <label className="block">
            <span className={ui.label}>Catégorie</span>
            <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={ui.input}>
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className={ui.label}>Description</span>
          <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className={ui.input} />
          {err("description") && <p className={ui.error}>{err("description")}</p>}
        </label>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="block">
            <span className={ui.label}>Prix (FCFA)</span>
            <input name="price" type="number" min={0} step={100} defaultValue={product?.price} className={ui.input} />
            {err("price") && <p className={ui.error}>{err("price")}</p>}
          </label>
          <label className="block">
            <span className={ui.label}>Ancien prix (promo)</span>
            <input
              name="compareAtPrice"
              type="number"
              min={0}
              step={100}
              defaultValue={product?.compareAtPrice ?? ""}
              className={ui.input}
              placeholder="Laisser vide si pas de promo"
            />
            {err("compareAtPrice") && <p className={ui.error}>{err("compareAtPrice")}</p>}
          </label>
          <label className="block">
            <span className={ui.label}>Stock</span>
            <input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 0} className={ui.input} />
            {err("stock") && <p className={ui.error}>{err("stock")}</p>}
          </label>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-encre">
            <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} className="h-4 w-4 accent-prune" />
            Visible dans la boutique
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-encre">
            <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured} className="h-4 w-4 accent-prune" />
            Mettre en avant (coup de cœur)
          </label>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/admin/produits" className={ui.btnGhost}>
          Annuler
        </Link>
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
      </div>
    </form>
  );
}