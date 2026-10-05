"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Renseignez votre email et votre mot de passe." };

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));

  if (!user || !valid) return { error: "Email ou mot de passe incorrect." };

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}