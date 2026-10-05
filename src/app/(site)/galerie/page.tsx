import type { Metadata } from "next";
import { Camera } from "lucide-react";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Galerie — Royalty Beauty",
  description: "Découvrez les réalisations du salon Royalty Beauty : tresses, coupes, perruques et plus.",
};

export const revalidate = 60;

export default async function GaleriePage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: { id: true, url: true, caption: true, category: true },
  });

  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Nos réalisations"
        subtitle="Chaque coiffure est une création unique. Laissez-vous inspirer."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {images.length > 0 ? (
          <GalleryGrid images={images} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`photo-placeholder flex aspect-square items-center justify-center ${
                    i % 5 === 1 ? "rounded-t-full" : "rounded-2xl"
                  }`}
                >
                  <Camera className="h-8 w-8 text-prune/25" strokeWidth={1} />
                </div>
              ))}
            </div>
            <p className="mt-10 text-center font-serif text-xl text-encre/60">
              Nos plus belles réalisations arrivent très bientôt.
            </p>
          </>
        )}
      </div>
    </>
  );
}