import Link from "next/link";
import { Check, EyeOff, MessageSquarePlus, Star, Trash2 } from "lucide-react";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { createReview, deleteReview, toggleReview } from "@/actions/reviews";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ui } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

type Props = { searchParams: Promise<{ filtre?: string }> };

export default async function AdminAvisPage({ searchParams }: Props) {
  await requireAdmin();
  const { filtre } = await searchParams;

  const where =
    filtre === "attente" ? { isApproved: false } : filtre === "publies" ? { isApproved: true } : {};

  const [reviews, pendingCount, publishedCount] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { isApproved: true } }),
  ]);

  const tabs = [
    { key: undefined, label: "Tous", count: pendingCount + publishedCount },
    { key: "attente", label: "À modérer", count: pendingCount },
    { key: "publies", label: "Publiés", count: publishedCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className={ui.h1}>Avis clientes</h1>
        <p className="mt-1 text-sm text-encre/50">Seuls les avis publiés apparaissent sur le site.</p>
      </div>

      {/* Ajout manuel */}
      <form action={createReview} className={`${ui.card} space-y-4`}>
        <div>
          <h2 className="font-display text-lg text-encre">Ajouter un avis</h2>
          <p className="mt-1 text-sm text-encre/50">
            Pour publier un avis reçu par WhatsApp, sur Facebook ou de vive voix.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <label className="block">
            <span className={ui.label}>Nom de la cliente</span>
            <input name="authorName" required minLength={2} placeholder="Ex : Aïcha K." className={ui.input} />
          </label>
          <label className="block">
            <span className={ui.label}>Note</span>
            <select name="rating" defaultValue="5" className={ui.input}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n}/5)
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className={ui.label}>Avis</span>
          <textarea name="comment" required minLength={5} rows={3} className={ui.input} />
        </label>
        <div className="flex justify-end">
          <button type="submit" className={ui.btnPrimary}>
            <MessageSquarePlus className="h-4 w-4" />
            Publier l&apos;avis
          </button>
        </div>
      </form>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = filtre === t.key;
          return (
            <Link
              key={t.label}
              href={t.key ? `/admin/avis?filtre=${t.key}` : "/admin/avis"}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                active ? "bg-prune text-white" : "border border-prune/15 bg-white text-encre/70 hover:bg-prune-light"
              }`}
            >
              {t.label} <span className="ml-1 opacity-60">{t.count}</span>
            </Link>
          );
        })}
      </div>

      {reviews.length === 0 ? (
        <p className="py-10 text-center text-sm text-encre/40">Aucun avis ici.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className={`${ui.card} flex flex-col`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-encre">{r.authorName}</p>
                  <p className="text-xs text-encre/40">{dateFmt.format(r.createdAt)}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider ${
                    r.isApproved ? "bg-green-50 text-green-700" : "bg-or-light text-or-dark"
                  }`}
                >
                  {r.isApproved ? "Publié" : "À modérer"}
                </span>
              </div>

              <div className="mt-3 flex gap-0.5 text-or">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>

              <p className="mt-3 flex-1 font-serif text-lg text-encre/80">« {r.comment} »</p>

              <div className="mt-4 flex justify-end gap-2 border-t border-prune/10 pt-3">
                <form action={toggleReview.bind(null, r.id)}>
                  <button type="submit" className={`${ui.btnGhost} !py-2 !text-xs`}>
                    {r.isApproved ? (
                      <>
                        <EyeOff className="h-4 w-4" /> Masquer
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Publier
                      </>
                    )}
                  </button>
                </form>
                <ConfirmButton
                  action={deleteReview.bind(null, r.id)}
                  message={`Supprimer l'avis de ${r.authorName} ?`}
                  className={`${ui.iconBtn} hover:!bg-red-50 hover:!text-red-600`}
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}