"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, ShoppingBag, Store, Truck, Wallet } from "lucide-react";
import { placeOrder } from "@/actions/checkout";
import { cart, useCart, useMounted } from "@/lib/cart";
import { formatFCFA } from "@/lib/format";

const inputClass =
  "w-full rounded-xl border border-or/30 bg-ivoire px-4 py-3 text-sm text-encre outline-none transition focus:border-prune focus:ring-2 focus:ring-prune/15";
const labelClass = "mb-2 block text-xs uppercase tracking-widest text-encre/60";

export default function CheckoutForm() {
  const router = useRouter();
  const mounted = useMounted();
  const { items, count, subtotal } = useCart();

  const [form, setForm] = useState({ fullName: "", phone: "", deliveryAddress: "" });
  const [mode, setMode] = useState<"RETRAIT_SALON" | "LIVRAISON">("RETRAIT_SALON");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-prune" />
      </div>
    );
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-prune/40" strokeWidth={1.5} />
        <p className="mt-4 font-serif text-xl text-encre/70">Votre panier est vide.</p>
        <Link href="/boutique" className="btn-primary mt-8">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await placeOrder({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      fullName: form.fullName,
      phone: form.phone,
      deliveryMode: mode,
      deliveryAddress: mode === "LIVRAISON" ? form.deliveryAddress : undefined,
    });

    if (!res.ok) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    cart.clear();
    router.push(`/commande/confirmation?ref=${res.reference}`);
  };

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <section className="space-y-4 rounded-2xl border border-or/20 bg-white p-6">
          <h2 className="font-display text-xl text-encre">Vos coordonnées</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Nom complet</span>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Téléphone (WhatsApp)</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="07 00 00 00 00"
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-or/20 bg-white p-6">
          <h2 className="font-display text-xl text-encre">Récupération</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "RETRAIT_SALON" as const, icon: Store, title: "Retrait au salon", text: "Gratuit" },
              { value: "LIVRAISON" as const, icon: Truck, title: "Livraison", text: "Frais selon votre commune" },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = mode === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    active ? "border-prune bg-prune-light" : "border-or/30 hover:border-prune"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      active ? "bg-prune text-ivoire" : "bg-or-light text-or-dark"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-display text-base text-encre">{opt.title}</p>
                    <p className="text-xs text-encre/50">{opt.text}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {mode === "LIVRAISON" && (
            <label className="block">
              <span className={labelClass}>Adresse de livraison</span>
              <input
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="Commune, quartier, repère"
                className={inputClass}
              />
            </label>
          )}
        </section>

        <p className="flex items-start gap-3 rounded-2xl bg-or-light p-5 text-sm text-encre/80">
          <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-or-dark" />
          Paiement à la réception, en espèces ou par Mobile Money.
          {mode === "LIVRAISON" && " Nous vous contacterons sur WhatsApp pour confirmer les frais de livraison."}
        </p>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-prune p-6 text-ivoire">
          <p className="font-display text-lg">Votre commande</p>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-ivoire/80">
                  {i.name} <span className="text-ivoire/50">× {i.quantity}</span>
                </span>
                <span>{formatFCFA(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-ivoire/15 pt-4 text-sm text-ivoire/70">
            <p className="flex justify-between">
              <span>
                Sous-total ({count} article{count > 1 ? "s" : ""})
              </span>
              <span>{formatFCFA(subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>Livraison</span>
              <span>{mode === "LIVRAISON" ? "À confirmer" : "Gratuit"}</span>
            </p>
          </div>
          <p className="mt-4 flex justify-between font-display text-xl">
            <span>Total</span>
            <span className="text-or">{formatFCFA(subtotal)}</span>
          </p>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full !bg-or hover:!bg-or-dark">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Valider la commande
          </button>
        </div>
        <Link href="/panier" className="mt-4 block text-center text-sm text-prune hover:underline">
          Modifier mon panier
        </Link>
      </aside>
    </form>
  );
}