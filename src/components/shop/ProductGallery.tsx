"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag } from "lucide-react";

export default function ProductGallery({ images, name }: { images: { url: string }[]; name: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="photo-placeholder flex aspect-[4/5] items-center justify-center rounded-3xl">
        <ShoppingBag className="h-16 w-16 text-prune/25" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-prune-light">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={images[index].url}
              alt={name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                i === index ? "border-prune" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}