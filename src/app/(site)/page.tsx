import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CalendarHeart,
  Camera,
  Droplets,
  Gem,
  Leaf,
  MessageCircle,
  Quote,
  Scissors,
  ShoppingBag,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import Ornament from "@/components/Ornament";
import { Crown } from "@/components/Logo";
import Reveal from "@/components/Reveal";
import HeroVisual from "@/components/HeroVisual";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export const revalidate = 60;

const SERVICE_ICONS: LucideIcon[] = [Sparkles, Scissors, Droplets, Gem];
const GALLERY_PREVIEW = 6;
const PRODUCTS_PREVIEW = 3;

const atouts: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Expertise", text: "Des coiffeuses formées aux techniques les plus actuelles.", icon: Award },
  { title: "Produits de qualité", text: "Des soins sélectionnés pour respecter vos cheveux.", icon: Leaf },
  { title: "Réservation facile", text: "Choisissez votre créneau en ligne, en quelques clics.", icon: CalendarCheck },
];

export default async function HomePage() {
  const [categories, products, reviews, gallery, galleryTotal] = await Promise.all([
    prisma.serviceCategory.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        services: {
          where: { isActive: true },
          select: { name: true, price: true },
          orderBy: { price: "asc" },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      take: PRODUCTS_PREVIEW,
    }),
    prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.galleryImage.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: { id: true, url: true, caption: true },
      take: GALLERY_PREVIEW,
    }),
    prisma.galleryImage.count(),
  ]);

  const serviceCards = categories
    .filter((c) => c.services.length > 0)
    .slice(0, 4)
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      from: c.services[0].price,
      examples: c.services
        .slice(0, 3)
        .map((s) => s.name)
        .join(", "),
      icon: SERVICE_ICONS[i % SERVICE_ICONS.length],
    }));

  const remainingPhotos = galleryTotal - gallery.length;

  return (
    <>
      {/* HERO */}
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Reveal delay={0.1}>
              <p className="eyebrow">Salon de coiffure</p>
            </Reveal>
            <Reveal delay={0.2}>
              <h1 className="mt-4 font-display text-4xl leading-tight text-encre md:text-6xl">
                Révélez la reine qui est en vous
              </h1>
            </Reveal>
            <Reveal delay={0.35}>
              <Ornament align="start" className="mt-6" />
            </Reveal>
            <Reveal delay={0.45}>
              <p className="mt-6 max-w-md font-serif text-xl text-encre/70">
                Tresses, coupes, soins et perruques : une expérience beauté pensée pour sublimer chaque femme.
              </p>
            </Reveal>
            <Reveal delay={0.6}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/reservation" className="btn-primary">
                  <CalendarHeart className="h-4 w-4" />
                  Prendre rendez-vous
                </Link>
                <Link href="/boutique" className="btn-outline">
                  <ShoppingBag className="h-4 w-4" />
                  La boutique
                </Link>
              </div>
            </Reveal>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* PRESTATIONS */}
      {serviceCards.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <Reveal>
              <p className="eyebrow">Nos prestations</p>
              <h2 className="section-title mt-3">Un savoir-faire royal</h2>
              <Ornament className="mt-5" />
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {serviceCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Reveal key={s.id} delay={i * 0.1} className="h-full">
                    <Link
                      href={`/prestations#${s.slug}`}
                      className="group block h-full rounded-t-[6rem] border border-or/30 bg-ivoire px-6 pb-8 pt-12 transition duration-300 hover:-translate-y-2 hover:border-or hover:shadow-xl"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-or-light text-or-dark transition duration-300 group-hover:bg-prune group-hover:text-ivoire">
                        <Icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <h3 className="mt-5 font-display text-lg text-encre">{s.name}</h3>
                      <p className="mt-3 font-serif text-lg text-encre/60">{s.examples}</p>
                      <p className="mt-5 text-sm text-prune">
                        à partir de <span className="font-semibold">{formatFCFA(s.from)}</span>
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={0.3}>
              <Link href="/prestations" className="btn-outline group mt-12">
                Voir toutes les prestations
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ATOUTS */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-3">
          {atouts.map((a, i) => {
            const Icon = a.icon;
            return (
              <Reveal key={a.title} delay={i * 0.15} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-or text-or">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-display text-xl text-encre">{a.title}</h3>
                <p className="mt-3 font-serif text-lg text-encre/60">{a.text}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* GALERIE */}
      <section className="bg-prune-light py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <p className="eyebrow">Galerie</p>
            <h2 className="section-title mt-3">Nos réalisations</h2>
            <Ornament className="mt-5" />
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.length > 0
              ? gallery.map((img, i) => {
                  const isLast = i === gallery.length - 1 && remainingPhotos > 0;
                  return (
                    <Reveal key={img.id} delay={(i % 3) * 0.1}>
                      <Link
                        href="/galerie"
                        className={`group relative block aspect-square overflow-hidden ${
                          i % 3 === 1 ? "rounded-t-full" : "rounded-2xl"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.caption ?? "Réalisation Royalty Beauty"}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-prune/0 transition group-hover:bg-prune/20" />
                        {isLast && (
                          <div className="absolute inset-0 flex items-center justify-center bg-encre/60">
                            <span className="font-display text-2xl text-ivoire md:text-3xl">
                              +{remainingPhotos} photo{remainingPhotos > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </Link>
                    </Reveal>
                  );
                })
              : Array.from({ length: GALLERY_PREVIEW }).map((_, i) => (
                  <Reveal key={i} delay={(i % 3) * 0.1}>
                    <div
                      className={`photo-placeholder flex aspect-square items-center justify-center ${
                        i % 3 === 1 ? "rounded-t-full" : "rounded-2xl"
                      }`}
                    >
                      <Camera className="h-8 w-8 text-prune/25" strokeWidth={1} />
                    </div>
                  </Reveal>
                ))}
          </div>

          <Reveal>
            <Link href="/galerie" className="btn-primary group mt-12">
              Voir toute la galerie
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* BOUTIQUE : toujours affichée */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">La boutique</p>
                <h2 className="section-title mt-3">Prolongez l&apos;expérience chez vous</h2>
                <p className="mt-3 max-w-xl font-serif text-lg text-encre/60">
                  Soins, perruques et accessoires sélectionnés par nos coiffeuses, à retirer au salon ou livrés chez
                  vous.
                </p>
              </div>
              <Link href="/boutique" className="btn-outline group">
                Voir la boutique
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          {products.length > 0 ? (
            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.1} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                {Array.from({ length: PRODUCTS_PREVIEW }).map((_, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="photo-placeholder flex aspect-[4/5] items-center justify-center rounded-2xl">
                      <ShoppingBag className="h-10 w-10 text-prune/25" strokeWidth={1} />
                    </div>
                  </Reveal>
                ))}
              </div>
              <p className="mt-8 text-center font-serif text-xl text-encre/60">
                Nos produits arrivent très bientôt en ligne.
              </p>
            </>
          )}
        </div>
      </section>

      {/* AVIS */}
      {reviews.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <Reveal>
              <p className="eyebrow">Témoignages</p>
              <h2 className="section-title mt-3">Elles nous font confiance</h2>
              <Ornament className="mt-5" />
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.15} className="h-full">
                  <figure className="relative h-full rounded-2xl border border-or/30 bg-ivoire p-8 transition duration-300 hover:shadow-lg">
                    <Quote className="absolute right-6 top-6 h-8 w-8 text-or/20" />
                    <div className="flex justify-center gap-1 text-or">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} className={`h-4 w-4 ${k < r.rating ? "fill-current" : "opacity-30"}`} />
                      ))}
                    </div>
                    <blockquote className="mt-4 font-serif text-xl italic text-encre/80">« {r.comment} »</blockquote>
                    <figcaption className="mt-5 text-xs uppercase tracking-[0.25em] text-prune">
                      {r.authorName}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-prune py-16 text-center text-ivoire">
        <Reveal className="mx-auto max-w-3xl px-6">
          <Crown className="mx-auto h-6 w-12 text-or" />
          <h2 className="mt-5 font-display text-3xl md:text-4xl">Prête à vous sentir reine ?</h2>
          <p className="mt-4 font-serif text-xl text-ivoire/75">
            Réservez votre créneau en ligne ou écrivez-nous directement sur WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/reservation" className="btn-primary !bg-or hover:!bg-or-dark">
              <CalendarHeart className="h-4 w-4" />
              Réserver maintenant
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !border-ivoire/60 !text-ivoire hover:!bg-ivoire hover:!text-prune"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}