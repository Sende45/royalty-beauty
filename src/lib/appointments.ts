import type { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS: Record<AppointmentStatus, { label: string; className: string }> = {
  EN_ATTENTE_PAIEMENT: { label: "Acompte en attente", className: "bg-or-light text-or-dark" },
  CONFIRME: { label: "Confirmé", className: "bg-green-50 text-green-700" },
  TERMINE: { label: "Terminé", className: "bg-prune-light text-prune" },
  ANNULE: { label: "Annulé", className: "bg-red-50 text-red-700" },
  ABSENT: { label: "Absente", className: "bg-encre/5 text-encre/60" },
};