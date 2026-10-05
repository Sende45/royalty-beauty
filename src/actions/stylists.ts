"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { DAYS } from "@/lib/days";

export type StylistFormState = { error?: string; fieldErrors?: Record<string, string> };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function refreshPages(id?: string) {
  revalidatePath("/admin/equipe");
  if (id) revalidatePath(`/admin/equipe/${id}`);
}

export async function saveStylist(
  id: string | null,
  _prev: StylistFormState,
  formData: FormData
): Promise<StylistFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "") || null;
  const photoPublicId = String(formData.get("photoPublicId") ?? "") || null;
  const isActive = formData.get("isActive") === "on";
  const serviceIds = formData.getAll("serviceIds").map(String);

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Le nom est trop court.";
  if (bio.length > 400) fieldErrors.bio = "400 caractères maximum.";
  if (photoUrl && !photoUrl.startsWith("https://res.cloudinary.com/")) fieldErrors.photo = "Photo invalide.";

  const hours: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
  for (let day = 0; day < 7; day++) {
    if (formData.get(`day-${day}-on`) !== "on") continue;
    const startTime = String(formData.get(`day-${day}-start`) ?? "");
    const endTime = String(formData.get(`day-${day}-end`) ?? "");
    if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime) || startTime >= endTime) {
      fieldErrors.hours = `Horaires invalides le ${DAYS[day].toLowerCase()} : l'heure de fin doit être après le début.`;
      break;
    }
    hours.push({ dayOfWeek: day, startTime, endTime });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Merci de corriger les champs indiqués.", fieldErrors };
  }

  const previous = id ? await prisma.stylist.findUnique({ where: { id } }) : null;
  const data = { name, bio: bio || null, photoUrl, photoPublicId, isActive };

  const stylistId = await prisma.$transaction(
    async (tx) => {
      const stylist = id
        ? await tx.stylist.update({ where: { id }, data })
        : await tx.stylist.create({ data });

      await tx.stylistService.deleteMany({ where: { stylistId: stylist.id } });
      if (serviceIds.length > 0) {
        await tx.stylistService.createMany({
          data: serviceIds.map((serviceId) => ({ stylistId: stylist.id, serviceId })),
        });
      }

      await tx.workingHour.deleteMany({ where: { stylistId: stylist.id } });
      if (hours.length > 0) {
        await tx.workingHour.createMany({ data: hours.map((h) => ({ ...h, stylistId: stylist.id })) });
      }

      return stylist.id;
    },
    { timeout: 15000 }
  );

  // L'ancienne photo a été remplacée ou retirée : on la supprime de Cloudinary
  if (previous?.photoPublicId && previous.photoPublicId !== photoPublicId) {
    await deleteFromCloudinary(previous.photoPublicId);
  }

  refreshPages(stylistId);
  redirect("/admin/equipe");
}

export async function toggleStylist(id: string) {
  await requireAdmin();
  const stylist = await prisma.stylist.findUnique({ where: { id } });
  if (!stylist) return;
  await prisma.stylist.update({ where: { id }, data: { isActive: !stylist.isActive } });
  refreshPages(id);
}

export async function deleteStylist(id: string) {
  await requireAdmin();
  const stylist = await prisma.stylist.findUnique({ where: { id } });
  if (!stylist) return;

  const linked = await prisma.appointment.count({ where: { stylistId: id } });
  if (linked > 0) {
    // Des rendez-vous existent : on désactive pour garder l'historique
    await prisma.stylist.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.stylist.delete({ where: { id } });
    if (stylist.photoPublicId) await deleteFromCloudinary(stylist.photoPublicId);
  }
  refreshPages();
}

// ─── Congés ───

export async function addTimeOff(stylistId: string, formData: FormData) {
  await requireAdmin();
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "") || start;
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 120) || null;
  if (!start || end < start) return;

  await prisma.timeOff.create({
    data: {
      stylistId,
      startAt: new Date(`${start}T00:00:00`),
      endAt: new Date(`${end}T23:59:59`),
      reason,
    },
  });
  refreshPages(stylistId);
}

export async function deleteTimeOff(id: string, stylistId: string) {
  await requireAdmin();
  await prisma.timeOff.delete({ where: { id } });
  refreshPages(stylistId);
}