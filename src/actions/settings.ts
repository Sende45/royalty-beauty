"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type SettingsFormState = { error?: string; success?: string; fieldErrors?: Record<string, string> };

export async function saveSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();

  const text = (key: string, max = 200) => String(formData.get(key) ?? "").trim().slice(0, max) || null;
  const fieldErrors: Record<string, string> = {};

  const name = text("name", 80);
  if (!name) fieldErrors.name = "Le nom du salon est obligatoire.";

  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "") || null;
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 15)) {
    fieldErrors.whatsapp = "Format international attendu, ex : 2250700000000.";
  }

  const email = text("email", 120);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) fieldErrors.email = "Email invalide.";

  const urls = ["mapsUrl", "instagram", "facebook", "tiktok"] as const;
  const urlValues: Record<string, string | null> = {};
  for (const key of urls) {
    const v = text(key, 300);
    if (v && !/^https?:\/\//.test(v)) fieldErrors[key] = "Le lien doit commencer par https://";
    urlValues[key] = v;
  }

  const days = formData.getAll("hoursDays").map((v) => String(v).trim());
  const times = formData.getAll("hoursTime").map((v) => String(v).trim());
  const openingHours = days
    .map((d, i) => ({ days: d.slice(0, 40), time: (times[i] ?? "").slice(0, 40) }))
    .filter((h) => h.days && h.time)
    .slice(0, 7);

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Merci de corriger les champs indiqués.", fieldErrors };
  }

  const data = {
    name: name!,
    phone: text("phone", 30),
    whatsapp,
    email,
    address: text("address", 200),
    mapsUrl: urlValues.mapsUrl,
    instagram: urlValues.instagram,
    facebook: urlValues.facebook,
    tiktok: urlValues.tiktok,
    openingHours,
  };

  await prisma.salonSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });

  revalidatePath("/", "layout");
  return { success: "Paramètres enregistrés. Le site est à jour." };
}