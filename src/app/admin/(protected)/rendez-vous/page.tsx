import Link from "next/link";
import {
  Ban,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Phone,
  UserX,
} from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { updateAppointmentStatus } from "@/actions/appointments";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";
import { formatFCFA } from "@/lib/format";
import { APPOINTMENT_STATUS } from "@/lib/appointments";
import { toWhatsappNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan" });
const dayTitleFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Abidjan",
});

const toISO = (d: Date) => d.toISOString().slice(0, 10);

type Props = { searchParams: Promise<{ date?: string }> };

export default async function AdminRendezVousPage({ searchParams }: Props) {
  await requireUser();
  const { date: dateParam } = await searchParams;

  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : toISO(new Date());
  const dayStart = new Date(`${date}T00:00:00Z`);
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  const prev = toISO(new Date(dayStart.getTime() - 86400000));
  const next = toISO(dayEnd);
  const isToday = date === toISO(new Date());

  const [appointments, pending] = await Promise.all([
    prisma.appointment.findMany({
      where: { startAt: { gte: dayStart, lt: dayEnd } },
      orderBy: { startAt: "asc" },
      include: { customer: true, service: true, stylist: true },
    }),
    prisma.appointment.findMany({
      where: { status: "EN_ATTENTE_PAIEMENT", startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 10,
      include: { customer: true, service: true },
    }),
  ]);

  // Regroupe les rendez-vous du jour par coiffeuse
  const byStylist = new Map<string, { name: string; items: typeof appointments }>();
  for (const a of appointments) {
    const group = byStylist.get(a.stylistId) ?? { name: a.stylist.name, items: [] };
    group.items.push(a);
    byStylist.set(a.stylistId, group);
  }

  const action = (id: string, status: AppointmentStatus) => updateAppointmentStatus.bind(null, id, status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={ui.h1}>Rendez-vous</h1>
          <p className="mt-1 text-sm text-encre/50">L&apos;agenda du salon, coiffeuse par coiffeuse.</p>
        </div>
        <Link href="/reservation" target="_blank" className={ui.btnGhost}>
          <ExternalLink className="h-4 w-4" />
          Ajouter un rendez-vous
        </Link>
      </div>

      {/* Acomptes en attente */}
      {pending.length > 0 && (
        <section className={`${ui.card} border-or/40`}>
          <h2 className="font-display text-lg text-encre">Acomptes en attente ({pending.length})</h2>
          <p className="mt-1 text-sm text-encre/50">Confirmez dès que la cliente a payé son acompte.</p>
          <ul className="mt-4 divide-y divide-prune/10">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-encre">
                    {a.customer.fullName} · <span className="font-normal text-encre/60">{a.service.name}</span>
                  </p>
                  <p className="text-xs capitalize text-encre/50">
                    {shortFmt.format(a.startAt)} · acompte {formatFCFA(a.depositAmount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${toWhatsappNumber(a.customer.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ui.iconBtn}
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <form action={action(a.id, "CONFIRME")}>
                    <button type="submit" className={`${ui.btnPrimary} !py-2 !text-xs`}>
                      <Check className="h-4 w-4" />
                      Acompte reçu
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Navigation entre les jours */}
      <div className={`${ui.card} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-2">
          <Link href={`/admin/rendez-vous?date=${prev}`} className={ui.iconBtn} title="Jour précédent">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <p className="font-display text-lg capitalize text-encre">{dayTitleFmt.format(dayStart)}</p>
          <Link href={`/admin/rendez-vous?date=${next}`} className={ui.iconBtn} title="Jour suivant">
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isToday && (
            <Link href="/admin/rendez-vous" className={`${ui.btnGhost} !py-2`}>
              Aujourd&apos;hui
            </Link>
          )}
          <form className="flex gap-2">
            <input type="date" name="date" defaultValue={date} className={`${ui.input} !w-auto !py-2`} />
            <button type="submit" className={`${ui.btnGhost} !py-2`}>
              Aller
            </button>
          </form>
        </div>
      </div>

      {/* Agenda du jour */}
      {appointments.length === 0 ? (
        <p className="py-10 text-center text-sm text-encre/40">Aucun rendez-vous ce jour-là.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {[...byStylist.values()].map((group) => (
            <section key={group.name} className={ui.card}>
              <h2 className="font-display text-lg text-encre">{group.name}</h2>
              <ul className="mt-4 space-y-3">
                {group.items.map((a) => {
                  const status = APPOINTMENT_STATUS[a.status];
                  const inactive = a.status === "ANNULE" || a.status === "ABSENT";
                  return (
                    <li
                      key={a.id}
                      className={`rounded-xl border border-prune/10 p-4 ${inactive ? "opacity-50" : ""}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-prune">
                            {timeFmt.format(a.startAt)} – {timeFmt.format(a.endAt)}
                          </p>
                          <p className="mt-1 text-sm font-medium text-encre">{a.customer.fullName}</p>
                          <p className="text-xs text-encre/50">
                            {a.service.name} · {formatFCFA(a.priceAtBooking)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {a.notes && (
                        <p className="mt-3 rounded-lg bg-[#f7f4f8] px-3 py-2 text-xs text-encre/70">« {a.notes} »</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-prune/10 pt-3">
                        <a href={`tel:${a.customer.phone}`} className={ui.iconBtn} title={a.customer.phone}>
                          <Phone className="h-4 w-4" />
                        </a>
                        <a
                          href={`https://wa.me/${toWhatsappNumber(a.customer.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={ui.iconBtn}
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>

                        <div className="ml-auto flex flex-wrap gap-1">
                          {a.status === "EN_ATTENTE_PAIEMENT" && (
                            <form action={action(a.id, "CONFIRME")}>
                              <button type="submit" className={`${ui.btnGhost} !px-3 !py-1.5 !text-xs`}>
                                <Check className="h-3.5 w-3.5" /> Confirmer
                              </button>
                            </form>
                          )}
                          {a.status === "CONFIRME" && (
                            <>
                              <form action={action(a.id, "TERMINE")}>
                                <button type="submit" className={`${ui.btnGhost} !px-3 !py-1.5 !text-xs`}>
                                  <CheckCheck className="h-3.5 w-3.5" /> Terminé
                                </button>
                              </form>
                              <form action={action(a.id, "ABSENT")}>
                                <button type="submit" className={`${ui.btnGhost} !px-3 !py-1.5 !text-xs`}>
                                  <UserX className="h-3.5 w-3.5" /> Absente
                                </button>
                              </form>
                            </>
                          )}
                          {(a.status === "EN_ATTENTE_PAIEMENT" || a.status === "CONFIRME") && (
                            <ConfirmButton
                              action={action(a.id, "ANNULE")}
                              message={`Annuler le rendez-vous de ${a.customer.fullName} ? Le créneau sera libéré.`}
                              className={`${ui.btnGhost} !px-3 !py-1.5 !text-xs hover:!bg-red-50 hover:!text-red-600`}
                            >
                              <Ban className="h-3.5 w-3.5" /> Annuler
                            </ConfirmButton>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}