import Image from "next/image";
import Link from "next/link";
import { CalendarOff, Eye, EyeOff, Pencil, Plus, Trash2, User } from "lucide-react";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteStylist, toggleStylist } from "@/actions/stylists";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { DAYS_SHORT, WEEK_ORDER } from "@/lib/days";
import { ui } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Abidjan" });

export default async function AdminEquipePage() {
  await requireAdmin();

  const stylists = await prisma.stylist.findMany({
    orderBy: { name: "asc" },
    include: {
      workingHours: true,
      _count: { select: { services: true } },
      timeOffs: { where: { endAt: { gte: new Date() } }, orderBy: { startAt: "asc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={ui.h1}>Équipe</h1>
          <p className="mt-1 text-sm text-encre/50">Les coiffeuses, leurs spécialités et leurs horaires.</p>
        </div>
        <Link href="/admin/equipe/nouveau" className={ui.btnPrimary}>
          <Plus className="h-4 w-4" />
          Ajouter une coiffeuse
        </Link>
      </div>

      {stylists.length === 0 ? (
        <div className={`${ui.card} py-12 text-center`}>
          <User className="mx-auto h-10 w-10 text-prune/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-encre/50">Aucune coiffeuse enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stylists.map((s) => {
            const workDays = new Set(s.workingHours.map((h) => h.dayOfWeek));
            const nextLeave = s.timeOffs[0];
            return (
              <div key={s.id} className={`${ui.card} flex flex-col ${s.isActive ? "" : "opacity-60"}`}>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-prune-light">
                    {s.photoUrl ? (
                      <Image src={s.photoUrl} alt={s.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <User className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-prune/30" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg text-encre">{s.name}</p>
                    <p className="text-xs text-encre/50">
                      {s._count.services} prestation{s._count.services > 1 ? "s" : ""}
                      {!s.isActive && " · Désactivée"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {WEEK_ORDER.map((d) => (
                    <span
                      key={d}
                      className={`rounded-md px-2 py-1 text-xs ${
                        workDays.has(d) ? "bg-prune-light text-prune" : "bg-encre/5 text-encre/30"
                      }`}
                    >
                      {DAYS_SHORT[d]}
                    </span>
                  ))}
                </div>

                {nextLeave && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-or-dark">
                    <CalendarOff className="h-3.5 w-3.5" />
                    Absente du {dateFmt.format(nextLeave.startAt)} au {dateFmt.format(nextLeave.endAt)}
                  </p>
                )}

                <div className="mt-auto flex justify-end gap-1 border-t border-prune/10 pt-3">
                  <form action={toggleStylist.bind(null, s.id)}>
                    <button
                      type="submit"
                      className={ui.iconBtn}
                      title={s.isActive ? "Désactiver" : "Activer"}
                    >
                      {s.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </form>
                  <Link href={`/admin/equipe/${s.id}`} className={ui.iconBtn} title="Modifier">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <ConfirmButton
                    action={deleteStylist.bind(null, s.id)}
                    message={`Supprimer ${s.name} ? Si elle a déjà des rendez-vous, elle sera seulement désactivée.`}
                    className={`${ui.iconBtn} hover:!bg-red-50 hover:!text-red-600`}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}