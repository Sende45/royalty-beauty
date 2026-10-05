"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/orders";

export type CheckoutResult = { ok: true; reference: string } | { ok: false; error: string };

const checkoutSchema = z
  .object({
    items: z
      .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(10) }))
      .min(1, "Votre panier est vide.")
      .max(30),
    fullName: z.string().trim().min(2, "Indiquez votre nom complet."),
    phone: z
      .string()
      .trim()
      .refine((v) => v.replace(/\D/g, "").length >= 8, "Numéro de téléphone invalide."),
    deliveryMode: z.enum(["RETRAIT_SALON", "LIVRAISON"]),
    deliveryAddress: z.string().trim().max(200).optional(),
  })
  .refine((d) => d.deliveryMode === "RETRAIT_SALON" || (d.deliveryAddress?.length ?? 0) >= 5, {
    message: "Indiquez votre adresse de livraison (commune, quartier, repère).",
    path: ["deliveryAddress"],
  });

export async function placeOrder(input: z.input<typeof checkoutSchema>): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { fullName, deliveryMode } = parsed.data;
  const phone = parsed.data.phone.replace(/[^\d+]/g, "");
  const deliveryAddress = deliveryMode === "LIVRAISON" ? parsed.data.deliveryAddress ?? null : null;

  // Regroupe les quantités par produit
  const wanted = new Map<string, number>();
  for (const it of parsed.data.items) {
    wanted.set(it.productId, Math.min(10, (wanted.get(it.productId) ?? 0) + it.quantity));
  }

  // Les prix viennent toujours de la base, jamais du navigateur
  const products = await prisma.product.findMany({
    where: { id: { in: [...wanted.keys()] }, isActive: true },
  });
  if (products.length !== wanted.size) {
    return { ok: false, error: "Un article de votre panier n'est plus disponible. Retirez-le puis réessayez." };
  }

  for (const p of products) {
    const qty = wanted.get(p.id)!;
    if (p.stock < qty) {
      return {
        ok: false,
        error:
          p.stock === 0
            ? `« ${p.name} » est en rupture de stock. Retirez-le de votre panier.`
            : `Il ne reste que ${p.stock} « ${p.name} ». Ajustez la quantité.`,
      };
    }
  }

  const items = products.map((p) => ({
    productId: p.id,
    productName: p.name,
    unitPrice: p.price,
    quantity: wanted.get(p.id)!,
  }));
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const reference = generateReference("CMD");

  try {
    await prisma.$transaction(
      async (tx) => {
        // Réserve le stock (protégé contre deux commandes simultanées)
        for (const it of items) {
          const res = await tx.product.updateMany({
            where: { id: it.productId, stock: { gte: it.quantity } },
            data: { stock: { decrement: it.quantity } },
          });
          if (res.count !== 1) throw new Error(`« ${it.productName} » vient d'être épuisé.`);
        }

        const customer = await tx.customer.upsert({
          where: { phone },
          update: { fullName },
          create: { fullName, phone },
        });

        await tx.order.create({
          data: {
            reference,
            customerId: customer.id,
            status: "EN_ATTENTE_PAIEMENT",
            deliveryMode,
            deliveryAddress,
            deliveryFee: 0,
            subtotal,
            total: subtotal,
            stockDeducted: true,
            items: { create: items },
          },
        });
      },
      { timeout: 15000 }
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "La commande n'a pas pu être enregistrée." };
  }

  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
  revalidatePath("/boutique");
  return { ok: true, reference };
}