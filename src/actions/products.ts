"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { uniqueSlug } from "@/lib/slug";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> };

const productSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom est trop court."),
    description: z.string().trim().max(1000, "1000 caractères maximum."),
    categoryId: z.string(),
    price: z.coerce.number().int("Nombre entier attendu.").min(0, "Prix invalide."),
    compareAtPrice: z.coerce.number().int().min(0).nullable(),
    stock: z.coerce.number().int("Nombre entier attendu.").min(0, "Stock invalide."),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
  })
  .refine((d) => d.compareAtPrice === null || d.compareAtPrice > d.price, {
    message: "L'ancien prix doit être supérieur au prix actuel.",
    path: ["compareAtPrice"],
  });

const imagesSchema = z
  .array(
    z.object({
      url: z.string().url().startsWith("https://res.cloudinary.com/"),
      publicId: z.string().min(1),
    })
  )
  .max(8, "8 photos maximum.");

function refreshPages() {
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  revalidatePath("/");
}

export async function saveProduct(
  id: string | null,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    price: formData.get("price") ?? "",
    compareAtPrice: formData.get("compareAtPrice") || null,
    stock: formData.get("stock") || 0,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  let images: z.infer<typeof imagesSchema> = [];
  try {
    const parsedImages = imagesSchema.safeParse(JSON.parse(String(formData.get("images") ?? "[]")));
    if (!parsedImages.success) return { error: parsedImages.error.issues[0].message };
    images = parsedImages.data;
  } catch {
    return { error: "Photos invalides." };
  }

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { error: "Merci de corriger les champs indiqués.", fieldErrors };
  }

  const d = parsed.data;
  const slug = await uniqueSlug(d.name, async (s) =>
    !!(await prisma.product.findFirst({ where: { slug: s, ...(id ? { NOT: { id } } : {}) } }))
  );

  const data = {
    name: d.name,
    slug,
    description: d.description || null,
    price: d.price,
    compareAtPrice: d.compareAtPrice,
    stock: d.stock,
    isActive: d.isActive,
    isFeatured: d.isFeatured,
    categoryId: d.categoryId || null,
  };

  const previousImages = id ? await prisma.productImage.findMany({ where: { productId: id } }) : [];

  await prisma.$transaction(
    async (tx) => {
      const product = id
        ? await tx.product.update({ where: { id }, data })
        : await tx.product.create({ data });

      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, position) => ({ ...img, position, productId: product.id })),
        });
      }
    },
    { timeout: 15000 }
  );

  // Supprime de Cloudinary les photos retirées
  const kept = new Set(images.map((i) => i.publicId));
  for (const old of previousImages) {
    if (!kept.has(old.publicId)) await deleteFromCloudinary(old.publicId);
  }

  refreshPages();
  redirect("/admin/produits");
}

export async function toggleProduct(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  refreshPages();
}

export async function updateStock(id: string, formData: FormData) {
  await requireAdmin();
  const stock = Math.max(0, Math.floor(Number(formData.get("stock")) || 0));
  await prisma.product.update({ where: { id }, data: { stock } });
  refreshPages();
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return;

  const ordered = await prisma.orderItem.count({ where: { productId: id } });
  if (ordered > 0) {
    // Déjà commandé : on masque pour garder l'historique des commandes
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.product.delete({ where: { id } });
    for (const img of product.images) await deleteFromCloudinary(img.publicId);
  }
  refreshPages();
}

// ─── Catégories ───

export async function createProductCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;

  const slug = await uniqueSlug(name, async (s) => !!(await prisma.productCategory.findUnique({ where: { slug: s } })));
  const position = await prisma.productCategory.count();
  await prisma.productCategory.create({ data: { name, slug, position } });
  refreshPages();
}

export async function deleteProductCategory(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) return;
  await prisma.productCategory.delete({ where: { id } });
  refreshPages();
}