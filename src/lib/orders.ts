import type { DeliveryMode, OrderStatus } from "@prisma/client";

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  EN_ATTENTE_PAIEMENT: { label: "Attente paiement", className: "bg-or-light text-or-dark" },
  PAYEE: { label: "Payée", className: "bg-blue-50 text-blue-700" },
  EN_PREPARATION: { label: "En préparation", className: "bg-prune-light text-prune" },
  PRETE: { label: "Prête au salon", className: "bg-teal-50 text-teal-700" },
  EXPEDIEE: { label: "En livraison", className: "bg-indigo-50 text-indigo-700" },
  LIVREE: { label: "Livrée / retirée", className: "bg-green-50 text-green-700" },
  ANNULEE: { label: "Annulée", className: "bg-red-50 text-red-700" },
};

export const DELIVERY_LABEL: Record<DeliveryMode, string> = {
  RETRAIT_SALON: "Retrait au salon",
  LIVRAISON: "Livraison",
};

// Ex : CMD-261004-K7QZ
export function generateReference(prefix = "CMD") {
  const d = new Date();
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${date}-${rand}`;
}

// Numéro ivoirien à 10 chiffres → format international pour WhatsApp
export function toWhatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `225${digits}` : digits;
}