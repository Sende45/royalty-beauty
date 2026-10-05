import type { Metadata } from "next";
import Link from "next/link";
import { CalendarHeart, Clock, Wallet } from "lucide-react";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatFCFA } from "@/lib/format";

export const metadata: Metadata = {
  title: "Prestations & tarifs — Royalty Beauty",
  description: "Tresses, coupes, soins capillaires, perruques et tissages : découvrez nos prestations et nos tarifs.",
};

export const revalidate = 60;

export default async function PrestationsPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { position: "asc" },
    include: { services: { where: { isActive: true }, orderBy: { price: "asc" } } },
  });
  const visible = categories.filter((c) => c.services.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Nos prestations"
        title="Prestations & tarifs"
        subtitle="Des soins pensés pour chaque type de cheveux, réalisés avec passion et précision."
      />

      {/* Navigation entre catégories */}
      <nav className="sticky top-[65px] z-40 border-b border-or/20 bg-ivoire/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-6 py-3">
          {visible.map((c) => (
            <a
              key={c.id}
              href={`#${c.slug}`}
              className="shrink-0 rounded-full border border-or/40 px-4 py-1.5 text-xs uppercase tracking-widest text-encre/70 transition hover:border-prune hover:bg-prune hover:text-ivoire"
            >
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-5xl space-y-16 px-6 py-16">
        {visible.length === 0 && (
          <p className="text-center font-serif text-xl text-encre/60">Les prestations seront bientôt disponibles.</p>
        )}

        {visible.map((category) => (
          <section key={category.id} id={category.slug} className="scroll-mt-36">
            <Reveal>
              <h2 className="section-title">{category.name}</h2>
              <div className="mt-3 h-px w-20 bg-or" />
            </Reveal>

            <div className="mt-8 space-y-4">
              {category.services.map((service, i) => (
                <Reveal key={service.id} delay={i * 0.05}>
                  <div className="group flex flex-col gap-4 rounded-2xl border border-or/20 bg-white p-6 transition duration-300 hover:border-or hover:shadow-lg sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-lg text-encre">{service.name}</h3>
                      {service.description && (
                        <p className="mt-1 font-serif text-lg text-encre/60">{service.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-encre/50">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-or" />
                          {formatDuration(service.durationMin)}
                        </span>
                        {service.depositAmount > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Wallet className="h-3.5 w-3.5 text-or" />
                            Acompte {formatFCFA(service.depositAmount)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                      <p className="text-right">
                        {service.priceFrom && <span className="block text-xs text-encre/50">à partir de</span>}
                        <span className="font-display text-xl text-prune">{formatFCFA(service.price)}</span>
                      </p>
                      <Link
                        href={`/reservation?service=${service.slug}`}
                        className="btn-primary !px-5 !py-2 !text-xs"
                      >
                        <CalendarHeart className="h-4 w-4" />
                        Réserver
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        <Reveal>
          <p className="rounded-2xl bg-or-light p-6 text-center font-serif text-lg text-encre/70">
            Les prix « à partir de » varient selon la longueur et l&apos;épaisseur des cheveux. L&apos;acompte
            confirme votre rendez-vous et est déduit du prix final.
          </p>
        </Reveal>
      </div>
    </>
  );
}