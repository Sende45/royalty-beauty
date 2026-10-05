import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import BookingWizard from "@/components/booking/BookingWizard";
import PageHero from "@/components/PageHero";
import { prisma } from "@/lib/prisma";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Réserver — Royalty Beauty",
  description: "Réservez votre rendez-vous en ligne chez Royalty Beauty en quelques clics.",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ service?: string }> };

export default async function ReservationPage({ searchParams }: Props) {
  const { service: serviceSlug } = await searchParams;

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      services: {
        where: { isActive: true, stylists: { some: { stylist: { isActive: true } } } },
        orderBy: { price: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          price: true,
          priceFrom: true,
          durationMin: true,
          depositAmount: true,
          stylists: {
            where: { stylist: { isActive: true } },
            select: { stylist: { select: { id: true, name: true, photoUrl: true } } },
          },
        },
      },
    },
  });

  const bookable = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      services: c.services.map((s) => ({ ...s, stylists: s.stylists.map((x) => x.stylist) })),
    }))
    .filter((c) => c.services.length > 0);

  const initialServiceId = bookable.flatMap((c) => c.services).find((s) => s.slug === serviceSlug)?.id;

  return (
    <>
      <PageHero
        eyebrow="Réservation"
        title="Prenez rendez-vous"
        subtitle="Choisissez votre prestation, votre coiffeuse et le créneau qui vous convient."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {bookable.length === 0 ? (
          <div className="mx-auto max-w-lg text-center">
            <p className="font-serif text-xl text-encre/70">
              La réservation en ligne sera très bientôt disponible. En attendant, contactez-nous directement.
            </p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">
              <MessageCircle className="h-4 w-4" />
              Réserver sur WhatsApp
            </a>
          </div>
        ) : (
          <BookingWizard categories={bookable} initialServiceId={initialServiceId} />
        )}
      </div>
    </>
  );
}