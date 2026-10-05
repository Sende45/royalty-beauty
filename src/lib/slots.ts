import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Abidjan est en UTC toute l'année : on travaille directement en UTC
export const SLOT_STEP_MIN = 30; // un créneau toutes les 30 minutes
export const MIN_NOTICE_MIN = 60; // réservation au moins 1 h à l'avance
export const MAX_DAYS_AHEAD = 60; // jusqu'à 60 jours à l'avance

const BLOCKING: AppointmentStatus[] = ["EN_ATTENTE_PAIEMENT", "CONFIRME"];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n: number) => String(n).padStart(2, "0");
const toHHMM = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

export type Slot = { time: string; stylistIds: string[] };

export async function getAvailableSlots(
  serviceId: string,
  date: string,
  stylistId?: string | null
): Promise<Slot[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const dayStart = new Date(`${date}T00:00:00Z`);
  if (isNaN(dayStart.getTime())) return [];

  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const now = Date.now();
  if (dayEnd.getTime() <= now || dayStart.getTime() > now + MAX_DAYS_AHEAD * 86400000) return [];

  const service = await prisma.service.findFirst({ where: { id: serviceId, isActive: true } });
  if (!service) return [];

  const stylists = await prisma.stylist.findMany({
    where: {
      isActive: true,
      services: { some: { serviceId } },
      ...(stylistId ? { id: stylistId } : {}),
    },
    include: {
      workingHours: { where: { dayOfWeek: dayStart.getUTCDay() } },
      timeOffs: { where: { startAt: { lt: dayEnd }, endAt: { gt: dayStart } } },
      appointments: {
        where: { status: { in: BLOCKING }, startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
        select: { startAt: true, endAt: true },
      },
    },
  });

  const earliest = now + MIN_NOTICE_MIN * 60000;
  const slots = new Map<string, string[]>();

  for (const stylist of stylists) {
    const busy = [...stylist.timeOffs, ...stylist.appointments].map(
      (b) => [b.startAt.getTime(), b.endAt.getTime()] as const
    );

    for (const wh of stylist.workingHours) {
      const open = toMinutes(wh.startTime);
      const close = toMinutes(wh.endTime);

      for (let m = open; m + service.durationMin <= close; m += SLOT_STEP_MIN) {
        const start = dayStart.getTime() + m * 60000;
        const end = start + service.durationMin * 60000;
        if (start < earliest) continue;
        if (busy.some(([bs, be]) => start < be && end > bs)) continue;

        const time = toHHMM(m);
        slots.set(time, [...(slots.get(time) ?? []), stylist.id]);
      }
    }
  }

  return [...slots.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, stylistIds]) => ({ time, stylistIds }));
}