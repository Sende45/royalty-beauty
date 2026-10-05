"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

const serviceSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom est trop court."),
    description: z.string().trim().max(500, "500 caractères maximum."),
    categoryId: z.string().min(1, "Choisissez une catégorie."),
    price: z.coerce.number().int("Nombre entier attendu.").min(0, "Prix invalide."),
    priceFrom: z.boolean(),
    durationMin: z.coerce.number().int().min(5, "Durée minimale : 5 minutes."),
    depositAmount: z.coerce.number().int().min(0, "Acompte invalide."),
    isActive: z.boolean(),
  })
  .refine((d) => d.depositAmount <= d.price, {
    message: "L'acompte ne peut pas dépasser le prix.",
    path: ["depositAmount"],
  });

function refreshPages() {
  revalidatePath("/admin/prestations");
  revalidatePath("/prestations");
  revalidatePath("/");
}

// ─── Prestations ───

export async function saveService(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    price: formData.get("price") ?? "",
    priceFrom: formData.get("priceFrom") === "on",
    durationMin: formData.get("durationMin") ?? "",
    depositAmount: formData.get("depositAmount") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Merci de corriger les champs indiqués.", fieldErrors };
  }

  const data = { ...parsed.data, description: parsed.data.description || null };

  const slug = await uniqueSlug(data.name, async (s) =>
    !!(await prisma.service.findFirst({ where: { slug: s, ...(id ? { NOT: { id } } : {}) } }))
  );

  if (id) {
    await prisma.service.update({ where: { id }, data: { ...data, slug } });
  } else {
    await prisma.service.create({ data: { ...data, slug } });
  }

  refreshPages();
  redirect("/admin/prestations");
}

export async function toggleService(id: string) {
  await requireAdmin();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return;
  await prisma.service.update({ where: { id }, data: { isActive: !service.isActive } });
  refreshPages();
}

export async function deleteService(id: string) {
  await requireAdmin();
  const linked = await prisma.appointment.count({ where: { serviceId: id } });

  if (linked > 0) {
    // Liée à des rendez-vous : on la masque au lieu de la supprimer pour garder l'historique
    await prisma.service.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.service.delete({ where: { id } });
  }
  refreshPages();
}

// ─── Catégories ───

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;

  const slug = await uniqueSlug(name, async (s) => !!(await prisma.serviceCategory.findUnique({ where: { slug: s } })));
  const position = await prisma.serviceCategory.count();

  await prisma.serviceCategory.create({ data: { name, slug, position } });
  refreshPages();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const count = await prisma.service.count({ where: { categoryId: id } });
  if (count > 0) return; // sécurité : on ne supprime qu'une catégorie vide
  await prisma.serviceCategory.delete({ where: { id } });
  refreshPages();
}