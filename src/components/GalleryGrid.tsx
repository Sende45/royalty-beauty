"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryItem = { id: string; url: string; caption: string | null; category: string | null };

export default function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [filter, setFilter] = useState("Tout");
  const [index, setIndex] = useState<number | null>(null);

  const categories = useMemo(
    () => ["Tout", ...Array.from(new Set(images.map((i) => i.category).filter((c): c is string => !!c)))],
    [images]
  );

  const filtered = filter === "Tout" ? images : images.filter((i) => i.category === filter);
  const current = index !== null ? filtered[index] : null;
  const total = filtered.length;
  const isOpen = index !== null;

  const prev = () => setIndex((i) => (i === null ? null : (i - 1 + total) % total));
  const next = () => setIndex((i) => (i === null ? null : (i + 1) % total));

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? null : (i - 1 + total) % total));
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? null : (i + 1) % total));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, total]);

  return (
    <>
      {categories.length > 2 && (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-5 py-2 text-xs uppercase tracking-widest transition ${
                filter === c ? "bg-prune text-ivoire" : "border border-or/40 text-encre/70 hover:border-or"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((img, i) => (
            <motion.button
              layout
              key={img.id}
              onClick={() => setIndex(i)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`group relative aspect-square overflow-hidden ${i % 5 === 1 ? "rounded-t-full" : "rounded-2xl"}`}
            >
              <Image
                src={img.url}
                alt={img.caption ?? "Réalisation Royalty Beauty"}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-prune/0 transition group-hover:bg-prune/20" />
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Visionneuse plein écran */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-encre/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndex(null)}
          >
            <button className="absolute right-4 top-4 p-2 text-ivoire/80 hover:text-ivoire" aria-label="Fermer">
              <X className="h-7 w-7" />
            </button>

            {total > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-2 z-10 rounded-full bg-ivoire/10 p-3 text-ivoire hover:bg-ivoire/20 md:left-6"
                  aria-label="Précédente"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-2 z-10 rounded-full bg-ivoire/10 p-3 text-ivoire hover:bg-ivoire/20 md:right-6"
                  aria-label="Suivante"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.div
              key={current.id}
              className="relative h-[80vh] w-full max-w-4xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={current.url} alt={current.caption ?? ""} fill sizes="100vw" className="object-contain" />
            </motion.div>

            {current.caption && (
              <p className="absolute bottom-6 left-0 right-0 text-center font-serif text-lg text-ivoire/90">
                {current.caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}