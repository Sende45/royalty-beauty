import SettingsForm from "@/components/admin/SettingsForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";
import type { OpeningHour } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  await requireAdmin();
  const s = await prisma.salonSettings.findUnique({ where: { id: 1 } });

  const hours = Array.isArray(s?.openingHours) ? (s.openingHours as unknown as OpeningHour[]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={ui.h1}>Paramètres du salon</h1>
        <p className="mt-1 text-sm text-encre/50">Ces informations s&apos;affichent sur tout le site public.</p>
      </div>
      <SettingsForm
        settings={{
          name: s?.name ?? "Royalty Beauty",
          phone: s?.phone ?? null,
          whatsapp: s?.whatsapp ?? null,
          email: s?.email ?? null,
          address: s?.address ?? null,
          mapsUrl: s?.mapsUrl ?? null,
          instagram: s?.instagram ?? null,
          facebook: s?.facebook ?? null,
          tiktok: s?.tiktok ?? null,
          hours,
        }}
      />
    </div>
  );
}