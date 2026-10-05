import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Boutique — Royalty Beauty",
  description: "Soins capillaires, perruques et accessoires sélectionnés par Royalty Beauty.",
};

type Props = { searchParams: Promise<{ categorie?: string }> };

export default async function BoutiquePage({ searchParams }: Props) {
  const { categorie } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({ orderBy: { position: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true, ...(categorie ? { category: { slug: categorie } } : {}) },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const pill = (active: boolean) =>
    `rounded-full px-5 py-2 text-xs uppercase tracking-widest transition ${
      active ? "bg-prune text-ivoire" : "border border-or/40 text-encre/70 hover:border-or"
    }`;

  return (
    <>
      <PageHero
        eyebrow="La boutique"
        title="Prolongez l'expérience"
        subtitle="Nos produits coup de cœur pour sublimer et protéger vos cheveux au quotidien."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          <Link href="/boutique" scroll={false} className={pill(!categorie)}>
            Tout
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/boutique?categorie=${c.slug}`} scroll={false} className={pill(categorie === c.slug)}>
              {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-center font-serif text-xl text-encre/60">Aucun produit dans cette catégorie pour le moment.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}