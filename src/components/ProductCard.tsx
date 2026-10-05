import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { formatFCFA } from "@/lib/format";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    images: { url: string }[];
  };
};

export default function ProductCard({ product }: Props) {
  const image = product.images[0]?.url ?? null;
  const outOfStock = product.stock <= 0;
  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const href = `/boutique/${product.slug}`;

  return (
    <div className="group flex h-full flex-col">
      <Link href={href} className="relative block overflow-hidden rounded-2xl">
        {image ? (
          <div className="relative aspect-[4/5]">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="photo-placeholder flex aspect-[4/5] items-center justify-center transition duration-500 group-hover:scale-105">
            <ShoppingBag className="h-10 w-10 text-prune/30" strokeWidth={1} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {onSale && (
            <span className="rounded-full bg-or px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-ivoire">
              Promo
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-encre/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-ivoire">
              Rupture
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <Link href={href}>
          <h3 className="font-display text-base text-encre transition hover:text-prune">{product.name}</h3>
        </Link>
        {product.description && (
          <p className="mt-1 line-clamp-2 font-serif text-base text-encre/60">{product.description}</p>
        )}
        <p className="mt-2 text-sm">
          <span className="font-semibold text-prune">{formatFCFA(product.price)}</span>
          {onSale && <span className="ml-2 text-encre/40 line-through">{formatFCFA(product.compareAtPrice!)}</span>}
        </p>

        <div className="mt-auto pt-4">
          {outOfStock ? (
            <span className="block rounded-full border border-encre/20 py-2.5 text-center text-xs uppercase tracking-widest text-encre/40">
              Indisponible
            </span>
          ) : (
            <AddToCartButton
              className="w-full !py-2.5 !text-xs"
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image,
                stock: product.stock,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}