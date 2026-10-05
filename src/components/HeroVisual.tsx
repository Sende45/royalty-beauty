"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Crown } from "@/components/Logo";

const HERO_IMAGE = "https://res.cloudinary.com/lacnn0m0/image/upload/f_auto/q_auto/Salon_%EF%B8%8F.jpg";

export default function HeroVisual() {
  return (
    <motion.div
      className="relative mx-auto mt-8 w-full max-w-sm"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Cadre décalé qui rappelle l'affiche */}
      <motion.div
        className="absolute inset-0 rounded-t-full border border-or"
        initial={{ x: 0, y: 0 }}
        animate={{ x: 16, y: 16 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Photo en arche qui flotte doucement */}
      <motion.div
        className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-prune-light shadow-xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={HERO_IMAGE}
          alt="Le salon Royalty Beauty"
          fill
          unoptimized
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 768px) 90vw, 384px"
          className="object-cover"
        />
        {/* Léger voile pour fondre la photo dans la charte */}
        <div className="absolute inset-0 bg-gradient-to-t from-prune/25 via-transparent to-transparent" />
      </motion.div>

      {/* Couronne */}
      <motion.div
        className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ivoire p-3 shadow-md"
        initial={{ opacity: 0, y: -20, rotate: -15 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Crown className="h-5 w-10 text-or" />
      </motion.div>
    </motion.div>
  );
}