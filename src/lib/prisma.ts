import { PrismaClient } from "@prisma/client";

// Ajoute les réglages de connexion adaptés à Neon s'ils ne sont pas déjà dans l'URL
function buildDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    // Pas de plantage au chargement (utile pendant le build) : Prisma signalera l'erreur à la première requête
    console.warn("⚠️ DATABASE_URL n'est pas définie : les requêtes à la base échoueront.");
    return undefined;
  }

  try {
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
  } catch {
    console.warn("⚠️ DATABASE_URL a un format invalide : elle est utilisée telle quelle.");
    return raw;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = buildDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(databaseUrl ? { datasourceUrl: databaseUrl } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;