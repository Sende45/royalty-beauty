import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, Store, Truck } from "lucide-react";
import Ornament from "@/components/Ornament";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Commande enregistrée — Royalty Beauty",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const order = await prisma.order.findUnique({
    where: { reference: ref },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  const firstName = order.customer.fullName.split(" ")[0];
  const delivery = order.deliveryMode === "LIVRAISON";
  const summary = order.items.map((i) => `${i.quantity} × ${i.productName}`).join(", ");

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Reveal>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-encre md:text-4xl">Merci {firstName} !</h1>
        <Ornament className="mt-5" />
        <p className="mt-6 font-serif text-xl text-encre/70">
          Votre commande <strong className="text-prune">{order.reference}</strong> est bien enregistrée.
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-10 rounded-3xl border border-or/30 bg-white p-6 text-left">
          <ul className="space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span className="text-encre">
                  {i.productName} <span className="text-encre/40">× {i.quantity}</span>
                </span>
                <span className="text-encre">{formatFCFA(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-or/20 pt-4 font-display text-lg text-encre">
            <span>Total</span>
            <span className="text-prune">
              {formatFCFA(order.total)}
              {delivery && <span className="ml-1 text-xs font-normal text-encre/50">+ livraison</span>}
            </span>
          </p>
          <p className="mt-4 flex items-start gap-3 text-sm text-encre/70">
            {delivery ? (
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-or" />
            ) : (
              <Store className="mt-0.5 h-4 w-4 shrink-0 text-or" />
            )}
            {delivery
              ? `Livraison à : ${order.deliveryAddress}. Nous vous contactons pour confirmer les frais et l'heure de passage.`
              : "Retrait au salon : nous vous prévenons dès que votre commande est prête."}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.25}>
        <a
          href={whatsappLink(
            `Bonjour Royalty Beauty, je viens de passer la commande ${order.reference} (${summary}). Total : ${formatFCFA(order.total)}.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-8 w-full"
        >
          <MessageCircle className="h-4 w-4" />
          Confirmer sur WhatsApp
        </a>
        <Link href="/boutique" className="mt-4 inline-block text-sm text-prune hover:underline">
          Continuer mes achats
        </Link>
      </Reveal>
    </div>
  );
}