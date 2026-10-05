import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Trash2 } from "lucide-react";
import GalleryUploader from "@/components/admin/GalleryUploader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteGalleryImage, moveGalleryImage, updateGalleryImage } from "@/actions/gallery";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminGaleriePage() {
  await requireAdmin();

  const images = await prisma.galleryImage.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  const categories = Array.from(new Set(images.map((i) => i.category).filter((c): c is string => !!c)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className={ui.h1}>Galerie</h1>
        <p className="mt-1 text-sm text-encre/50">
          {images.length} photo{images.length > 1 ? "s" : ""} · l&apos;ordre ci-dessous est celui affiché sur le site.
        </p>
      </div>

      <GalleryUploader categories={categories} />

      {images.length === 0 ? (
        <p className="py-10 text-center text-sm text-encre/40">Aucune photo pour le moment.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <div key={img.id} className="overflow-hidden rounded-2xl border border-prune/10 bg-white shadow-sm">
              <div className="relative aspect-square bg-prune-light">
                <Image
                  src={img.url}
                  alt={img.caption ?? "Photo de la galerie"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-prune">
                  #{index + 1}
                </span>
              </div>

              <div className="space-y-3 p-4">
                <form action={updateGalleryImage.bind(null, img.id)} className="space-y-2">
                  <input
                    name="caption"
                    defaultValue={img.caption ?? ""}
                    placeholder="Légende"
                    className={`${ui.input} !py-2`}
                  />
                  <div className="flex gap-2">
                    <input
                      name="category"
                      defaultValue={img.category ?? ""}
                      placeholder="Catégorie"
                      list="gallery-categories"
                      className={`${ui.input} !py-2`}
                    />
                    <button type="submit" className={`${ui.btnGhost} !px-3 !py-2`} title="Enregistrer">
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                <div className="flex items-center justify-between border-t border-prune/10 pt-3">
                  <div className="flex gap-1">
                    <form action={moveGalleryImage.bind(null, img.id, "up")}>
                      <button
                        type="submit"
                        disabled={index === 0}
                        className={`${ui.iconBtn} disabled:opacity-30`}
                        title="Déplacer avant"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    </form>
                    <form action={moveGalleryImage.bind(null, img.id, "down")}>
                      <button
                        type="submit"
                        disabled={index === images.length - 1}
                        className={`${ui.iconBtn} disabled:opacity-30`}
                        title="Déplacer après"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                  <ConfirmButton
                    action={deleteGalleryImage.bind(null, img.id)}
                    message="Supprimer définitivement cette photo ?"
                    className={`${ui.iconBtn} hover:!bg-red-50 hover:!text-red-600`}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}