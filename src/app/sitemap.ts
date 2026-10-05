import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600; // régénéré toutes les heures

const staticPages = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/prestations", priority: 0.9, changeFrequency: "weekly" },
  { path: "/reservation", priority: 0.9, changeFrequency: "monthly" },
  { path: "/boutique", priority: 0.8, changeFrequency: "daily" },
  { path: "/galerie", priority: 0.7, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    // base indisponible : on publie au moins les pages fixes
  }

  return [
    ...staticPages.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/boutique/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}