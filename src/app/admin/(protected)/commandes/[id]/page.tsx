import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Phone, RefreshCw } from "lucide-react";
import { updateOrderStatus } from "@/actions/orders";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";
import { formatFCFA } from "@/lib/format";
import { DELIVERY_LABEL, ORDER_STATUS, toWhatsappNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Africa/Abidjan",
});

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const status = ORDER_STATUS[order.status];

  return (
    <div className="space-y-6">
      <Link href="/admin/commandes" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={ui.h1}>Commande {order.reference}</h1>
          <p className="mt-1 text-sm text-encre/50">{dateFmt.format(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Articles */}
        <section className={`${ui.card} lg:col-span-2`}>
          <h2 className="font-display text-lg text-encre">Articles</h2>
          <ul className="mt-4 divide-y divide-prune/10">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-encre">
                  {it.productName} <span className="text-encre/40">× {it.quantity}</span>
                </span>
                <span className="font-medium text-encre">{formatFCFA(it.unitPrice * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-prune/10 pt-4 text-sm">
            <p className="flex justify-between text-encre/60">
              <span>Sous-total</span>
              <span>{formatFCFA(order.subtotal)}</span>
            </p>
            {order.deliveryFee > 0 && (
              <p className="flex justify-between text-encre/60">
                <span>Livraison</span>
                <span>{formatFCFA(order.deliveryFee)}</span>
              </p>
            )}
            <p className="flex justify-between font-display text-lg text-encre">
              <span>Total</span>
              <span className="text-prune">{formatFCFA(order.total)}</span>
            </p>
          </div>
        </section>

        <div className="space-y-6">
          {/* Cliente */}
          <section className={`${ui.card} space-y-3`}>
            <h2 className="font-display text-lg text-encre">Cliente</h2>
            <p className="font-medium text-encre">{order.customer.fullName}</p>
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${order.customer.phone}`} className={`${ui.btnGhost} !py-2 !text-xs`}>
                <Phone className="h-4 w-4" /> {order.customer.phone}
              </a>
              <a
                href={`https://wa.me/${toWhatsappNumber(order.customer.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${ui.btnGhost} !py-2 !text-xs`}
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
            <p className="flex items-start gap-2 text-sm text-encre/60">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-or" />
              {DELIVERY_LABEL[order.deliveryMode]}
              {order.deliveryAddress && ` — ${order.deliveryAddress}`}
            </p>
          </section>

          {/* Statut */}
          <section className={`${ui.card} space-y-3`}>
            <h2 className="font-display text-lg text-encre">Statut</h2>
            {order.status === "ANNULEE" ? (
              <p className="text-sm text-encre/50">Cette commande est annulée, son statut ne peut plus changer.</p>
            ) : (
              <form action={updateOrderStatus.bind(null, order.id)} className="space-y-3">
                <select name="status" defaultValue={order.status} className={ui.input}>
                  {Object.entries(ORDER_STATUS).map(([key, s]) => (
                    <option key={key} value={key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className={`${ui.btnPrimary} w-full`}>
                  <RefreshCw className="h-4 w-4" />
                  Mettre à jour
                </button>
                <p className="text-xs text-encre/40">Une commande annulée remet automatiquement ses produits en stock.</p>
              </form>
            )}
          </section>

          {/* Paiements */}
          <section className={`${ui.card} space-y-3`}>
            <h2 className="font-display text-lg text-encre">Paiements</h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-encre/40">Aucun paiement enregistré.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex justify-between gap-2">
                    <span className="capitalize text-encre/60">
                      {p.provider} · {p.status.toLowerCase().replace("_", " ")}
                    </span>
                    <span className="font-medium text-encre">{formatFCFA(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}