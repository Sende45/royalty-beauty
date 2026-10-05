"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import QuantityStepper from "@/components/shop/QuantityStepper";
import { MAX_PER_ITEM, cart, useCart, useMounted } from "@/lib/cart";
import { formatFCFA } from "@/lib/format";

export default function CartView() {
  const mounted = useMounted();
  const { items, count, subtotal } = useCart();

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-prune" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-prune-light">
          <ShoppingBag className="h-9 w-9 text-prune" strokeWidth={1.5} />
        </div>
        <p className="mt-6 font-display text-2xl text-encre">Votre panier est vide</p>
        <p className="mt-2 font-serif text-lg text-encre/60">Découvrez nos soins et accessoires coup de cœur.</p>
        <Link href="/boutique" className="btn-primary mt-8">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <ul className="space-y-4 lg:col-span-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.productId}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="flex gap-4 rounded-2xl border border-or/20 bg-white p-4"
            >
              <Link
                href={`/boutique/${item.slug}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-prune-light"
              >
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <ShoppingBag className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-prune/30" />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/boutique/${item.slug}`} className="font-display text-base text-encre hover:text-prune">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => cart.remove(item.productId)}
                    className="rounded-lg p-1.5 text-encre/40 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Retirer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-encre/50">{formatFCFA(item.price)} l&apos;unité</p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    max={Math.min(item.stock, MAX_PER_ITEM)}
                    onChange={(q) => cart.setQuantity(item.productId, q)}
                  />
                  <span className="font-semibold text-prune">{formatFCFA(item.price * item.quantity)}</span>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-prune p-6 text-ivoire">
          <p className="font-display text-lg">Récapitulatif</p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex justify-between text-ivoire/70">
              <span>
                {count} article{count > 1 ? "s" : ""}
              </span>
              <span>{formatFCFA(subtotal)}</span>
            </p>
            <p className="flex justify-between text-ivoire/70">
              <span>Livraison</span>
              <span>Choisie à l&apos;étape suivante</span>
            </p>
          </div>
          <p className="mt-5 flex justify-between border-t border-ivoire/15 pt-4 font-display text-xl">
            <span>Total</span>
            <span className="text-or">{formatFCFA(subtotal)}</span>
          </p>
          <Link href="/commande" className="btn-primary mt-6 w-full !bg-or hover:!bg-or-dark">
            Commander
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Link href="/boutique" className="mt-4 block text-center text-sm text-prune hover:underline">
          Continuer mes achats
        </Link>
      </aside>
    </div>
  );
}