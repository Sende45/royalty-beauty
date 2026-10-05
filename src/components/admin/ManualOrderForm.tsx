"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createManualOrder, type OrderFormState } from "@/actions/orders";
import { formatFCFA } from "@/lib/format";
import { ui } from "@/lib/admin-ui";

type Product = { id: string; name: string; price: number; stock: number };
type Line = { key: number; productId: string; quantity: number };

export default function ManualOrderForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(createManualOrder, {});
  const nextKey = useRef(2);
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: "", quantity: 1 }]);
  const [mode, setMode] = useState<"RETRAIT_SALON" | "LIVRAISON">("RETRAIT_SALON");
  const [fee, setFee] = useState(0);

  const byId = new Map(products.map((p) => [p.id, p]));
  const subtotal = lines.reduce((sum, l) => sum + (byId.get(l.productId)?.price ?? 0) * l.quantity, 0);
  const total = subtotal + (mode === "LIVRAISON" ? fee : 0);

  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

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
        <h2 className="font-display text-lg text-encre">Cliente</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className={ui.label}>Nom complet</span>
            <input name="fullName" required className={ui.input} />
          </label>
          <label className="block">
            <span className={ui.label}>Téléphone</span>
            <input name="phone" type="tel" required placeholder="07 00 00 00 00" className={ui.input} />
          </label>
        </div>
      </section>

      <section className={`${ui.card} space-y-4`}>
        <h2 className="font-display text-lg text-encre">Produits</h2>

        {lines.map((line) => {
          const product = byId.get(line.productId);
          return (
            <div key={line.key} className="flex flex-wrap items-center gap-3">
              <select
                name="productId"
                value={line.productId}
                onChange={(e) => updateLine(line.key, { productId: e.target.value, quantity: 1 })}
                className={`${ui.input} min-w-0 flex-1`}
              >
                <option value="">Choisir un produit…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatFCFA(p.price)} ({p.stock} en stock)
                  </option>
                ))}
              </select>
              <input
                name="quantity"
                type="number"
                min={1}
                max={product?.stock ?? 99}
                value={line.quantity}
                onChange={(e) => updateLine(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                className={`${ui.input} !w-20 text-center`}
              />
              <span className="w-28 text-right text-sm font-medium text-prune">
                {product ? formatFCFA(product.price * line.quantity) : "—"}
              </span>
              <button
                type="button"
                onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                disabled={lines.length === 1}
                className={`${ui.iconBtn} disabled:opacity-30`}
                aria-label="Retirer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, { key: nextKey.current++, productId: "", quantity: 1 }])}
          className={`${ui.btnGhost} !py-2`}
        >
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </button>
      </section>

      <section className={`${ui.card} space-y-5`}>
        <h2 className="font-display text-lg text-encre">Remise et paiement</h2>

        <div className="flex flex-wrap gap-3">
          {(["RETRAIT_SALON", "LIVRAISON"] as const).map((m) => (
            <label
              key={m}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-prune/15 px-4 py-2.5 text-sm text-encre has-[:checked]:border-prune has-[:checked]:bg-prune-light"
            >
              <input
                type="radio"
                name="deliveryMode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="accent-prune"
              />
              {m === "RETRAIT_SALON" ? "Retrait au salon" : "Livraison"}
            </label>
          ))}
        </div>

        {mode === "LIVRAISON" && (
          <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
            <label className="block">
              <span className={ui.label}>Adresse de livraison</span>
              <input name="deliveryAddress" className={ui.input} placeholder="Commune, quartier, repère" />
            </label>
            <label className="block">
              <span className={ui.label}>Frais de livraison (FCFA)</span>
              <input
                name="deliveryFee"
                type="number"
                min={0}
                step={500}
                value={fee}
                onChange={(e) => setFee(Math.max(0, Number(e.target.value) || 0))}
                className={ui.input}
              />
            </label>
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-encre">
          <input name="paid" type="checkbox" className="h-4 w-4 accent-prune" />
          La cliente a déjà payé
        </label>

        <div className="space-y-1 border-t border-prune/10 pt-4 text-sm">
          <p className="flex justify-between text-encre/60">
            <span>Sous-total</span>
            <span>{formatFCFA(subtotal)}</span>
          </p>
          {mode === "LIVRAISON" && (
            <p className="flex justify-between text-encre/60">
              <span>Livraison</span>
              <span>{formatFCFA(fee)}</span>
            </p>
          )}
          <p className="flex justify-between font-display text-lg text-encre">
            <span>Total</span>
            <span className="text-prune">{formatFCFA(total)}</span>
          </p>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/admin/commandes" className={ui.btnGhost}>
          Annuler
        </Link>
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Créer la commande
        </button>
      </div>
    </form>
  );
}