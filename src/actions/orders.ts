"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUS, generateReference } from "@/lib/orders";

export type OrderFormState = { error?: string };

function refreshPages(id?: string) {
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  if (id) revalidatePath(`/admin/commandes/${id}`);
}

export async function createManualOrder(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").replace(/[^\d+]/g, "");
  const deliveryMode = formData.get("deliveryMode") === "LIVRAISON" ? "LIVRAISON" : "RETRAIT_SALON";
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim() || null;
  const deliveryFee = Math.max(0, Math.round(Number(formData.get("deliveryFee")) || 0));
  const paid = formData.get("paid") === "on";
  const productIds = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map((q) => Math.max(1, Math.floor(Number(q) || 1)));

  if (fullName.length < 2) return { error: "Indiquez le nom de la cliente." };
  if (phone.replace(/\D/g, "").length < 8) return { error: "Numéro de téléphone invalide." };
  if (deliveryMode === "LIVRAISON" && !deliveryAddress) return { error: "Indiquez l'adresse de livraison." };

  // Regroupe les lignes d'un même produit
  const wanted = new Map<string, number>();
  productIds.forEach((id, i) => {
    if (id) wanted.set(id, (wanted.get(id) ?? 0) + quantities[i]);
  });
  if (wanted.size === 0) return { error: "Ajoutez au moins un produit." };

  const products = await prisma.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
  if (products.length !== wanted.size) return { error: "Un des produits n'existe plus." };

  for (const p of products) {
    const qty = wanted.get(p.id)!;
    if (p.stock < qty) {
      return { error: `Stock insuffisant pour « ${p.name} » (${p.stock} disponible${p.stock > 1 ? "s" : ""}).` };
    }
  }

  const items = products.map((p) => ({
    productId: p.id,
    productName: p.name,
    unitPrice: p.price,
    quantity: wanted.get(p.id)!,
  }));
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const fee = deliveryMode === "LIVRAISON" ? deliveryFee : 0;
  const total = subtotal + fee;
  const reference = generateReference();

  let orderId: string;
  try {
    orderId = await prisma.$transaction(
      async (tx) => {
        for (const it of items) {
          const res = await tx.product.updateMany({
            where: { id: it.productId, stock: { gte: it.quantity } },
            data: { stock: { decrement: it.quantity } },
          });
          if (res.count !== 1) throw new Error(`Stock insuffisant pour « ${it.productName} ».`);
        }

        const customer = await tx.customer.upsert({
          where: { phone },
          update: { fullName },
          create: { fullName, phone },
        });

        const order = await tx.order.create({
          data: {
            reference,
            customerId: customer.id,
            status: paid ? "PAYEE" : "EN_ATTENTE_PAIEMENT",
            deliveryMode,
            deliveryAddress: deliveryMode === "LIVRAISON" ? deliveryAddress : null,
            deliveryFee: fee,
            subtotal,
            total,
            stockDeducted: true,
            items: { create: items },
          },
        });

        if (paid) {
          await tx.payment.create({
            data: {
              purpose: "COMMANDE",
              provider: "manuel",
              amount: total,
              status: "REUSSI",
              transactionId: `MANUEL-${reference}`,
              orderId: order.id,
            },
          });
        }

        return order.id;
      },
      { timeout: 15000 }
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Impossible de créer la commande." };
  }

  refreshPages(orderId);
  redirect(`/admin/commandes/${orderId}`);
}

export async function updateOrderStatus(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!(status in ORDER_STATUS)) return;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.status === "ANNULEE" || order.status === status) return;

  await prisma.$transaction(
    async (tx) => {
      // Annulation : on remet les produits en stock
      if (status === "ANNULEE" && order.stockDeducted) {
        for (const it of order.items) {
          await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
        }
      }
      await tx.order.update({
        where: { id },
        data: { status, ...(status === "ANNULEE" ? { stockDeducted: false } : {}) },
      });
    },
    { timeout: 15000 }
  );

  refreshPages(id);
}