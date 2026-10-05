import Link from "next/link";
import { CalendarCheck, CalendarDays, PackageX, ShoppingCart, Star, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ui } from "@/lib/admin-ui";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Abidjan",
});

export default async function DashboardPage() {
  const session = await requireUser();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [today, upcomingCount, ordersToHandle, outOfStock, reviewsToModerate, upcoming] = await Promise.all([
    prisma.appointment.count({
      where: { startAt: { gte: startOfDay, lt: endOfDay }, status: { in: ["CONFIRME", "EN_ATTENTE_PAIEMENT"] } },
    }),
    prisma.appointment.count({ where: { startAt: { gte: now }, status: "CONFIRME" } }),
    prisma.order.count({ where: { status: { in: ["EN_ATTENTE_PAIEMENT", "PAYEE", "EN_PREPARATION"] } } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.appointment.findMany({
      where: { startAt: { gte: now }, status: { in: ["CONFIRME", "EN_ATTENTE_PAIEMENT"] } },
      orderBy: { startAt: "asc" },
      take: 6,
      include: { customer: true, service: true, stylist: true },
    }),
  ]);

  const stats: { label: string; value: number; icon: LucideIcon; href: string; alert?: boolean }[] = [
    { label: "Rendez-vous aujourd'hui", value: today, icon: CalendarDays, href: "/admin/rendez-vous" },
    { label: "Rendez-vous à venir", value: upcomingCount, icon: CalendarCheck, href: "/admin/rendez-vous" },
    { label: "Commandes à traiter", value: ordersToHandle, icon: ShoppingCart, href: "/admin/commandes", alert: ordersToHandle > 0 },
    { label: "Produits en rupture", value: outOfStock, icon: PackageX, href: "/admin/produits", alert: outOfStock > 0 },
    { label: "Avis à modérer", value: reviewsToModerate, icon: Star, href: "/admin/avis", alert: reviewsToModerate > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className={ui.h1}>Bonjour {session.name.split(" ")[0]} 👑</h1>
        <p className="mt-1 text-sm text-encre/50">Voici l&apos;activité du salon en un coup d&apos;œil.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className={`${ui.card} transition hover:-translate-y-0.5 hover:shadow-md`}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  s.alert ? "bg-or-light text-or-dark" : "bg-prune-light text-prune"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="mt-4 font-display text-3xl text-encre">{s.value}</p>
              <p className="mt-1 text-xs text-encre/50">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className={ui.card}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-encre">Prochains rendez-vous</h2>
          <Link href="/admin/rendez-vous" className="text-sm text-prune hover:underline">
            Tout voir
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-6 text-center text-sm text-encre/40">Aucun rendez-vous à venir pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-prune/10">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium text-encre">{a.customer.fullName}</p>
                  <p className="text-xs text-encre/50">
                    {a.service.name} · avec {a.stylist.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm capitalize text-prune">{dateFormat.format(a.startAt)}</p>
                  {a.status === "EN_ATTENTE_PAIEMENT" && (
                    <span className="text-xs text-or-dark">Acompte en attente</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}