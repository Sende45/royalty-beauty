"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import { ui } from "@/lib/admin-ui";

type Img = { url: string; publicId: string };
const MAX = 8;

export default function ProductImagesField({ defaultImages = [] }: { defaultImages?: Img[] }) {
  const [images, setImages] = useState<Img[]>(defaultImages);
  const [uploading, setUploading] = useState<{ name: string; progress: number } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    setError("");
    const files = Array.from(list).slice(0, MAX - images.length);
    if (list.length > files.length) setError(`${MAX} photos maximum par produit.`);

    for (const file of files) {
      setUploading({ name: file.name, progress: 0 });
      try {
        const img = await uploadImage(file, "produits", (p) => setUploading({ name: file.name, progress: p }));
        setImages((prev) => [...prev, { url: img.url, publicId: img.publicId }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Échec de l'envoi.");
      }
    }
    setUploading(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (index: number, dir: -1 | 1) =>
    setImages((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.publicId} className="group relative aspect-square overflow-hidden rounded-xl bg-prune-light">
            <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-prune px-2 py-0.5 text-[0.65rem] text-white">
                Principale
              </span>
            )}
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, k) => k !== i))}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-red-600 shadow"
              aria-label="Retirer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute inset-x-2 bottom-2 flex justify-between">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded-full bg-white/90 p-1 text-prune shadow disabled:opacity-0"
                aria-label="Avant"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === images.length - 1}
                className="rounded-full bg-white/90 p-1 text-prune shadow disabled:opacity-0"
                aria-label="Après"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={!!uploading}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-prune/20 text-prune transition hover:border-prune/50 hover:bg-prune-light/50 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="mt-2 text-xs">{uploading.progress} %</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
                <span className="mt-2 text-xs">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-encre/40">La première photo est celle affichée dans la boutique. {MAX} photos maximum.</p>
      {error && <p className={ui.error}>{error}</p>}

      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}