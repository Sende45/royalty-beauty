"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import PhotoField from "@/components/admin/PhotoField";
import { saveStylist, type StylistFormState } from "@/actions/stylists";
import { DAYS, WEEK_ORDER } from "@/lib/days";
import { ui } from "@/lib/admin-ui";

type Props = {
  categories: { id: string; name: string; services: { id: string; name: string }[] }[];
  stylist?: {
    id: string;
    name: string;
    bio: string | null;
    photoUrl: string | null;
    photoPublicId: string | null;
    isActive: boolean;
    serviceIds: string[];
    hours: { dayOfWeek: number; startTime: string; endTime: string }[];
  };
};

export default function StylistForm({ categories, stylist }: Props) {
  const action = saveStylist.bind(null, stylist?.id ?? null);
  const [state, formAction, pending] = useActionState<StylistFormState, FormData>(action, {});
  const err = (field: string) => state.fieldErrors?.[field];

  const hoursByDay = new Map(stylist?.hours.map((h) => [h.dayOfWeek, h]));
  const selected = new Set(stylist?.serviceIds);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-6"
    >
      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      {/* Identité */}
      <section className={`${ui.card} space-y-5`}>
        <h2 className="font-display text-lg text-encre">Profil</h2>
        <PhotoField
          folder="equipe"
          defaultUrl={stylist?.photoUrl}
          defaultPublicId={stylist?.photoPublicId}
          error={err("photo")}
        />

        <label className="block">
          <span className={ui.label}>Nom</span>
          <input name="name" defaultValue={stylist?.name} className={ui.input} placeholder="Ex : Awa" />
          {err("name") && <p className={ui.error}>{err("name")}</p>}
        </label>

        <label className="block">
          <span className={ui.label}>Présentation (optionnel)</span>
          <textarea
            name="bio"
            rows={3}
            defaultValue={stylist?.bio ?? ""}
            className={ui.input}
            placeholder="Spécialiste des tresses, 8 ans d'expérience…"
          />
          {err("bio") && <p className={ui.error}>{err("bio")}</p>}
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-encre">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={stylist?.isActive ?? true}
            className="h-4 w-4 accent-prune"
          />
          Disponible à la réservation
        </label>
      </section>

      {/* Prestations */}
      <section className={`${ui.card} space-y-5`}>
        <div>
          <h2 className="font-display text-lg text-encre">Prestations réalisées</h2>
          <p className="mt-1 text-sm text-encre/50">
            Les clientes ne pourront réserver cette coiffeuse que pour les prestations cochées.
          </p>
        </div>

        {categories.map((cat) => (
          <div key={cat.id}>
            <p className={ui.label}>{cat.name}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cat.services.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-prune/10 px-3 py-2.5 text-sm text-encre transition hover:bg-prune-light has-[:checked]:border-prune has-[:checked]:bg-prune-light"
                >
                  <input
                    type="checkbox"
                    name="serviceIds"
                    value={s.id}
                    defaultChecked={selected.has(s.id)}
                    className="h-4 w-4 accent-prune"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Horaires */}
      <section className={`${ui.card} space-y-4`}>
        <div>
          <h2 className="font-display text-lg text-encre">Horaires de travail</h2>
          <p className="mt-1 text-sm text-encre/50">Les créneaux proposés aux clientes seront calculés à partir de ces horaires.</p>
        </div>

        {err("hours") && <p className={ui.error}>{err("hours")}</p>}

        <div className="divide-y divide-prune/10">
          {WEEK_ORDER.map((day) => {
            const h = hoursByDay.get(day);
            const worksByDefault = stylist ? !!h : day !== 0;
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 py-3">
                <label className="flex w-36 cursor-pointer items-center gap-2 text-sm font-medium text-encre">
                  <input
                    type="checkbox"
                    name={`day-${day}-on`}
                    defaultChecked={worksByDefault}
                    className="h-4 w-4 accent-prune"
                  />
                  {DAYS[day]}
                </label>
                <input
                  type="time"
                  name={`day-${day}-start`}
                  defaultValue={h?.startTime ?? "08:00"}
                  className={`${ui.input} !w-auto !py-2`}
                />
                <span className="text-sm text-encre/40">à</span>
                <input
                  type="time"
                  name={`day-${day}-end`}
                  defaultValue={h?.endTime ?? "20:00"}
                  className={`${ui.input} !w-auto !py-2`}
                />
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/admin/equipe" className={ui.btnGhost}>
          Annuler
        </Link>
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
      </div>
    </form>
  );
}