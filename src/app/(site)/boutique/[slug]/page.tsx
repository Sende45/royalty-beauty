import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Store, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductPurchase from "@/components/shop/ProductPurchase";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable — Royalty Beauty" };

  const title = `${product.name} — Boutique Royalty Beauty`;
  const description =
    product.description?.slice(0, 160) ?? `${product.name} disponible à la boutique Royalty Beauty, Abidjan.`;

  return {
    title,
    description,
    alternates: { canonical: `/boutique/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_CI",
      siteName: SITE_NAME,
      ...(product.images[0] ? { images: [{ url: product.images[0].url, alt: product.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 3,
  });

  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => i.url),
    sku: product.id,
    category: product.category?.name,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/boutique/${product.slug}`,
      priceCurrency: "XOF",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd data={productLd} />

      <Link href="/boutique" className="inline-flex items-center gap-2 text-sm text-encre/50 transition hover:text-prune">
        <ArrowLeft className="h-4 w-4" />
        Retour à la boutique
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
        <Reveal>
          <ProductGallery images={product.images} name={product.name} />
        </Reveal>

        <Reveal delay={0.15}>
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h1 className="mt-3 font-display text-3xl text-encre md:text-4xl">{product.name}</h1>

          <p className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-prune">{formatFCFA(product.price)}</span>
            {onSale && <span className="text-lg text-encre/40 line-through">{formatFCFA(product.compareAtPrice!)}</span>}
          </p>

          <p className={`mt-2 text-sm ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}>
            {product.stock > 5
              ? "En stock"
              : product.stock > 0
                ? `Plus que ${product.stock} en stock`
                : "Rupture de stock"}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line font-serif text-lg leading-relaxed text-encre/75">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <ProductPurchase
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url ?? null,
                stock: product.stock,
              }}
            />
          </div>

          <div className="mt-8 space-y-3 border-t border-or/20 pt-6 text-sm text-encre/70">
            <p className="flex items-center gap-3">
              <Store className="h-4 w-4 text-or" /> Retrait gratuit au salon
            </p>
            <p className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-or" /> Livraison à Abidjan, frais selon votre commune
            </p>
            <a
              href={whatsappLink(`Bonjour, j'ai une question sur le produit « ${product.name} ».`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-prune hover:underline"
            >
              <MessageCircle className="h-4 w-4" /> Une question ? Écrivez-nous
            </a>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title">Vous aimerez aussi</h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}