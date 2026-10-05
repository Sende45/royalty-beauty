import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export type OpeningHour = { days: string; time: string };

// Paramètres du salon, avec repli sur les valeurs par défaut
export const getSettings = cache(async () => {
  const s = await prisma.salonSettings.findUnique({ where: { id: 1 } }).catch(() => null);

  const hours =
    Array.isArray(s?.openingHours) && s.openingHours.length > 0
      ? (s.openingHours as unknown as OpeningHour[])
      : siteConfig.hours;

  return {
    name: s?.name || siteConfig.name,
    phone: s?.phone || siteConfig.phone,
    whatsapp: s?.whatsapp || siteConfig.whatsapp,
    email: s?.email || null,
    address: s?.address || siteConfig.address,
    mapsUrl: s?.mapsUrl || null,
    instagram: s?.instagram || null,
    facebook: s?.facebook || null,
    tiktok: s?.tiktok || null,
    hours,
  };
});