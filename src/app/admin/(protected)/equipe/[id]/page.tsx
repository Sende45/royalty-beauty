import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Trash2 } from "lucide-react";
import StylistForm from "@/components/admin/StylistForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { addTimeOff, deleteTimeOff } from "@/actions/stylists";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Abidjan",
});

type Props = { params: Promise<{ id: string }> };

export default async function EditStylistPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [stylist, categories] = await Promise.all([
    prisma.stylist.findUnique({
      where: { id },
      include: {
        services: { select: { serviceId: true } },
        workingHours: true,
        timeOffs: { where: { endAt: { gte: new Date() } }, orderBy: { startAt: "asc" } },
      },
    }),
    prisma.serviceCategory.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        services: { where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } },
      },
    }),
  ]);

  if (!stylist) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/equipe" className="inline-flex items-center gap-2 text-sm text-encre/50 hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;équipe
      </Link>
      <h1 className={ui.h1}>{stylist.name}</h1>

      <StylistForm
        categories={categories.filter((c) => c.services.length > 0)}
        stylist={{
          id: stylist.id,
          name: stylist.name,
          bio: stylist.bio,
          photoUrl: stylist.photoUrl,
          photoPublicId: stylist.photoPublicId,
          isActive: stylist.isActive,
          serviceIds: stylist.services.map((s) => s.serviceId),
          hours: stylist.workingHours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            startTime: h.startTime,
            endTime: h.endTime,
          })),
        }}
      />

      {/* Congés et absences */}
      <section className={`${ui.card} space-y-5`}>
        <div>
          <h2 className="font-display text-lg text-encre">Congés et absences</h2>
          <p className="mt-1 text-sm text-encre/50">Aucun rendez-vous ne pourra être pris sur ces dates.</p>
        </div>

        <form action={addTimeOff.bind(null, stylist.id)} className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
          <label className="block">
            <span className={ui.label}>Du</span>
            <input type="date" name="start" required className={ui.input} />
          </label>
          <label className="block">
            <span className={ui.label}>Au</span>
            <input type="date" name="end" className={ui.input} />
          </label>
          <label className="block">
            <span className={ui.label}>Motif (optionnel)</span>
            <input name="reason" placeholder="Congés, formation…" className={ui.input} />
          </label>
          <button type="submit" className={ui.btnGhost}>
            <CalendarPlus className="h-4 w-4" />
            Ajouter
          </button>
        </form>

        {stylist.timeOffs.length === 0 ? (
          <p className="text-sm text-encre/40">Aucune absence prévue.</p>
        ) : (
          <ul className="divide-y divide-prune/10">
            {stylist.timeOffs.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm capitalize text-encre">
                    {dateFmt.format(t.startAt)} → {dateFmt.format(t.endAt)}
                  </p>
                  {t.reason && <p className="text-xs text-encre/50">{t.reason}</p>}
                </div>
                <ConfirmButton
                  action={deleteTimeOff.bind(null, t.id, stylist.id)}
                  message="Supprimer cette absence ?"
                  className={`${ui.iconBtn} hover:!bg-red-50 hover:!text-red-600`}
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}