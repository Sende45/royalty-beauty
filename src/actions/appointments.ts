"use server";

import { revalidatePath } from "next/cache";
import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { APPOINTMENT_STATUS } from "@/lib/appointments";

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  await requireUser();
  if (!(status in APPOINTMENT_STATUS)) return;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.status === status) return;

  await prisma.$transaction(
    async (tx) => {
      await tx.appointment.update({ where: { id }, data: { status } });

      // Confirmation manuelle d'un rendez-vous avec acompte : on enregistre le paiement
      if (status === "CONFIRME" && appointment.status === "EN_ATTENTE_PAIEMENT" && appointment.depositAmount > 0) {
        const transactionId = `MANUEL-${appointment.reference}`;
        const exists = await tx.payment.findUnique({ where: { transactionId } });
        if (!exists) {
          await tx.payment.create({
            data: {
              purpose: "ACOMPTE_RDV",
              provider: "manuel",
              amount: appointment.depositAmount,
              status: "REUSSI",
              transactionId,
              appointmentId: appointment.id,
            },
          });
        }
      }
    },
    { timeout: 15000 }
  );

  revalidatePath("/admin/rendez-vous");
  revalidatePath("/admin");
}