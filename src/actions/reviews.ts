"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function refreshPages() {
  revalidatePath("/admin/avis");
  revalidatePath("/");
}

export async function createReview(formData: FormData) {
  await requireAdmin();
  const authorName = String(formData.get("authorName") ?? "").trim().slice(0, 60);
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 600);
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating")) || 5));
  if (authorName.length < 2 || comment.length < 5) return;

  await prisma.review.create({ data: { authorName, comment, rating, isApproved: true } });
  refreshPages();
}

export async function toggleReview(id: string) {
  await requireAdmin();
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  await prisma.review.update({ where: { id }, data: { isApproved: !review.isApproved } });
  refreshPages();
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  refreshPages();
}