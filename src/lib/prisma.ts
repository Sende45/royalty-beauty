import { PrismaClient } from "@prisma/client";

// Ajoute les réglages de connexion adaptés à Neon s'ils ne sont pas déjà dans l'URL
function buildDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL manquant dans le fichier .env");

  const url = new URL(raw);
  const defaults: Record<string, string> = {
    sslmode: "require",
    connect_timeout: "30",
    connection_limit: "10",
    pool_timeout: "30",
  };
  for (const [key, value] of Object.entries(defaults)) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.toString();
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: buildDatabaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;