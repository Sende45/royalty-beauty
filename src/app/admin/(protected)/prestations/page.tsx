import Link from "next/link";
import { Clock, Eye, EyeOff, FolderPlus, Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { createCategory, deleteCategory, deleteService, toggleService } from "@/actions/services";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";
import { formatDuration, formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPrestationsPage() {
  await requireAdmin();

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { position: "asc" },
    include: { services: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={ui.h1}>Prestations</h1>
          <p className="mt-1 text-sm text-encre/50">Gérez les prestations, prix et durées affichés sur le site.</p>
        </div>
        {categories.length > 0 && (
          <Link href="/admin/prestations/nouvelle" className={ui.btnPrimary}>
            <Plus className="h-4 w-4" />
            Nouvelle prestation
          </Link>
        )}
      </div>

      {/* Ajout de catégorie */}
      <form action={createCategory} className={`${ui.card} flex flex-col gap-3 sm:flex-row sm:items-end`}>
        <label className="flex-1">
          <span className={ui.label}>Nouvelle catégorie</span>
          <input name="name" required minLength={2} placeholder="Ex : Coiffure mariage" className={ui.input} />
        </label>
        <button type="submit" className={ui.btnGhost}>
          <FolderPlus className="h-4 w-4" />
          Ajouter la catégorie
        </button>
      </form>

      {categories.length === 0 && (
        <p className="text-center text-sm text-encre/50">Commencez par créer une catégorie ci-dessus.</p>
      )}

      {categories.map((category) => (
        <section key={category.id} className={ui.card}>
          <div className="flex items-center justify-between gap-4 border-b border-prune/10 pb-4">
            <div>
              <h2 className="font-display text-lg text-encre">{category.name}</h2>
              <p className="text-xs text-encre/40">
                {category.services.length} prestation{category.services.length > 1 ? "s" : ""}
              </p>
            </div>
            {category.services.length === 0 && (
              <ConfirmButton
                action={deleteCategory.bind(null, category.id)}
                message={`Supprimer la catégorie « ${category.name} » ?`}
                className={ui.iconBtn}
                title="Supprimer la catégorie"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            )}
          </div>

          {category.services.length === 0 ? (
            <p className="py-6 text-center text-sm text-encre/40">Aucune prestation dans cette catégorie.</p>
          ) : (
            <ul className="divide-y divide-prune/10">
              {category.services.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${s.isActive ? "text-encre" : "text-encre/40 line-through"}`}>
                        {s.name}
                      </p>
                      {!s.isActive && (
                        <span className="rounded-full bg-encre/5 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-encre/50">
                          Masquée
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-encre/50">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(s.durationMin)}
                      </span>
                      {s.depositAmount > 0 && <span>Acompte {formatFCFA(s.depositAmount)}</span>}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-prune">
                    {s.priceFrom && <span className="mr-1 text-xs font-normal text-encre/40">dès</span>}
                    {formatFCFA(s.price)}
                  </p>

                  <div className="flex items-center gap-1">
                    <form action={toggleService.bind(null, s.id)}>
                      <button
                        type="submit"
                        className={ui.iconBtn}
                        title={s.isActive ? "Masquer du site" : "Afficher sur le site"}
                      >
                        {s.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </form>
                    <Link href={`/admin/prestations/${s.id}`} className={ui.iconBtn} title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmButton
                      action={deleteService.bind(null, s.id)}
                      message={`Supprimer « ${s.name} » ? Si elle a déjà des rendez-vous, elle sera seulement masquée.`}
                      className={`${ui.iconBtn} hover:!bg-red-50 hover:!text-red-600`}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}