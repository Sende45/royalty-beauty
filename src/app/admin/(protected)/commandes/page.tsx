import Link from "next/link";
import { ChevronRight, Plus, ShoppingCart } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";
import { formatFCFA } from "@/lib/format";
import { DELIVERY_LABEL, ORDER_STATUS } from "@/lib/orders";

export const dynamic = "force-dynamic";

const FILTERS: Record<string, { label: string; statuses?: OrderStatus[] }> = {
  toutes: { label: "Toutes" },
  "a-traiter": { label: "À traiter", statuses: ["PAYEE", "EN_PREPARATION", "PRETE", "EXPEDIEE"] },
  attente: { label: "Attente paiement", statuses: ["EN_ATTENTE_PAIEMENT"] },
  terminees: { label: "Terminées", statuses: ["LIVREE"] },
  annulees: { label: "Annulées", statuses: ["ANNULEE"] },
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Abidjan",
});

type Props = { searchParams: Promise<{ filtre?: string }> };

export default async function AdminCommandesPage({ searchParams }: Props) {
  await requireAdmin();
  const { filtre = "toutes" } = await searchParams;
  const current = FILTERS[filtre] ?? FILTERS.toutes;

  const orders = await prisma.order.findMany({
    where: current.statuses ? { status: { in: current.statuses } } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: true, _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={ui.h1}>Commandes</h1>
          <p className="mt-1 text-sm text-encre/50">Suivi des commandes de la boutique.</p>
        </div>
        <Link href="/admin/commandes/nouvelle" className={ui.btnPrimary}>
          <Plus className="h-4 w-4" />
          Commande manuelle
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(FILTERS).map(([key, f]) => (
          <Link
            key={key}
            href={key === "toutes" ? "/admin/commandes" : `/admin/commandes?filtre=${key}`}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              filtre === key ? "bg-prune text-white" : "border border-prune/15 bg-white text-encre/70 hover:bg-prune-light"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className={`${ui.card} py-12 text-center`}>
          <ShoppingCart className="mx-auto h-10 w-10 text-prune/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-encre/50">Aucune commande ici.</p>
        </div>
      ) : (
        <div className={`${ui.card} !p-0`}>
          <ul className="divide-y divide-prune/10">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/commandes/${o.id}`}
                  className="flex flex-wrap items-center gap-4 p-4 transition hover:bg-prune-light/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-encre">{o.customer.fullName}</p>
                    <p className="text-xs text-encre/50">
                      {o.reference} · {dateFmt.format(o.createdAt)} · {o._count.items} article
                      {o._count.items > 1 ? "s" : ""} · {DELIVERY_LABEL[o.deliveryMode]}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider ${ORDER_STATUS[o.status].className}`}
                  >
                    {ORDER_STATUS[o.status].label}
                  </span>
                  <span className="w-28 text-right font-semibold text-prune">{formatFCFA(o.total)}</span>
                  <ChevronRight className="h-4 w-4 text-encre/30" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}