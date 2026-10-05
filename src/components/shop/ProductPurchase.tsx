"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";
import QuantityStepper from "@/components/shop/QuantityStepper";
import { MAX_PER_ITEM, type CartItem } from "@/lib/cart";

export default function ProductPurchase({ product }: { product: Omit<CartItem, "quantity"> }) {
  const [quantity, setQuantity] = useState(1);

  if (product.stock <= 0) {
    return (
      <p className="rounded-2xl bg-encre/5 px-5 py-4 text-sm text-encre/60">
        Ce produit est momentanément indisponible.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={quantity} max={Math.min(product.stock, MAX_PER_ITEM)} onChange={setQuantity} />
        <AddToCartButton product={product} quantity={quantity} className="flex-1" />
      </div>
      <Link href="/panier" className="inline-flex items-center gap-2 text-sm text-prune hover:underline">
        Voir mon panier
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}