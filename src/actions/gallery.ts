"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

function refreshPages() {
  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  revalidatePath("/");
}

const imagesSchema = z
  .array(
    z.object({
      url: z.string().url().startsWith("https://res.cloudinary.com/"),
      publicId: z.string().min(1),
    })
  )
  .min(1)
  .max(50);

const clean = (v: string | null | undefined) => {
  const t = (v ?? "").trim();
  return t.length > 0 ? t.slice(0, 120) : null;
};

export async function addGalleryImages(
  images: { url: string; publicId: string }[],
  category: string | null,
  caption: string | null
) {
  await requireAdmin();
  const parsed = imagesSchema.safeParse(images);
  if (!parsed.success) return;

  const last = await prisma.galleryImage.aggregate({ _max: { position: true } });
  let position = (last._max.position ?? -1) + 1;

  await prisma.galleryImage.createMany({
    data: parsed.data.map((img) => ({
      url: img.url,
      publicId: img.publicId,
      category: clean(category),
      caption: clean(caption),
      position: position++,
    })),
  });

  refreshPages();
}

export async function updateGalleryImage(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.galleryImage.update({
    where: { id },
    data: {
      caption: clean(String(formData.get("caption") ?? "")),
      category: clean(String(formData.get("category") ?? "")),
    },
  });
  refreshPages();
}

export async function moveGalleryImage(id: string, direction: "up" | "down") {
  await requireAdmin();

  const all = await prisma.galleryImage.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const index = all.findIndex((i) => i.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= all.length) return;

  [all[index], all[target]] = [all[target], all[index]];

  await prisma.$transaction(
    all.map((img, position) => prisma.galleryImage.update({ where: { id: img.id }, data: { position } }))
  );
  refreshPages();
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) return;

  await prisma.galleryImage.delete({ where: { id } });
  await deleteFromCloudinary(image.publicId);
  refreshPages();
}