"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/slots";
import { generateReference } from "@/lib/orders";

export type BookingResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; slotTaken?: boolean };

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  stylistId: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  fullName: z.string().trim().min(2, "Indiquez votre nom complet."),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 8, "Numéro de téléphone invalide."),
  notes: z.string().trim().max(300, "300 caractères maximum.").optional(),
});

export async function createBooking(input: z.input<typeof bookingSchema>): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { serviceId, stylistId, date, time, fullName, notes } = parsed.data;
  const phone = parsed.data.phone.replace(/[^\d+]/g, "");

  const service = await prisma.service.findFirst({ where: { id: serviceId, isActive: true } });
  if (!service) return { ok: false, error: "Cette prestation n'est plus disponible." };

  // Vérifie au dernier moment que le créneau est toujours libre
  const slots = await getAvailableSlots(serviceId, date, stylistId);
  const slot = slots.find((s) => s.time === time);
  if (!slot) {
    return { ok: false, error: "Ce créneau vient d'être réservé. Merci d'en choisir un autre.", slotTaken: true };
  }

  const chosenStylistId = stylistId ?? slot.stylistIds[0];
  const startAt = new Date(`${date}T${time}:00Z`);
  const endAt = new Date(startAt.getTime() + service.durationMin * 60000);
  const reference = generateReference("RDV");

  await prisma.$transaction(
    async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone },
        update: { fullName },
        create: { fullName, phone },
      });

      await tx.appointment.create({
        data: {
          reference,
          customerId: customer.id,
          serviceId,
          stylistId: chosenStylistId,
          startAt,
          endAt,
          status: service.depositAmount > 0 ? "EN_ATTENTE_PAIEMENT" : "CONFIRME",
          priceAtBooking: service.price,
          depositAmount: service.depositAmount,
          notes: notes || null,
        },
      });
    },
    { timeout: 15000 }
  );

  revalidatePath("/admin/rendez-vous");
  revalidatePath("/admin");
  return { ok: true, reference };
}