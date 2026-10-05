"use client";

import { startTransition, useActionState, useState } from "react";
import { CheckCircle2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { saveSettings, type SettingsFormState } from "@/actions/settings";
import { ui } from "@/lib/admin-ui";

type Settings = {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  mapsUrl: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  hours: { days: string; time: string }[];
};

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(saveSettings, {});
  const [hours, setHours] = useState(settings.hours.length > 0 ? settings.hours : [{ days: "", time: "" }]);
  const err = (field: string) => state.fieldErrors?.[field];

  const field = (name: keyof Settings, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className={ui.label}>{label}</span>
      <input name={name} defaultValue={(settings[name] as string | null) ?? ""} className={ui.input} {...props} />
      {err(name) && <p className={ui.error}>{err(name)}</p>}
    </label>
  );

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
      {state.success && (
        <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" /> {state.success}
        </p>
      )}

      <section className={`${ui.card} space-y-5`}>
        <h2 className="font-display text-lg text-encre">Coordonnées</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {field("name", "Nom du salon")}
          {field("email", "Email (optionnel)", { type: "email" })}
          {field("phone", "Téléphone affiché", { placeholder: "+225 07 00 00 00 00" })}
          <label className="block">
            <span className={ui.label}>Numéro WhatsApp</span>
            <input name="whatsapp" defaultValue={settings.whatsapp ?? ""} placeholder="2250700000000" className={ui.input} />
            {err("whatsapp") ? (
              <p className={ui.error}>{err("whatsapp")}</p>
            ) : (
              <p className="mt-1 text-xs text-encre/40">Indicatif 225 puis les 10 chiffres, sans espace ni +</p>
            )}
          </label>
        </div>
        {field("address", "Adresse", { placeholder: "Commune, quartier, repère" })}
        {field("mapsUrl", "Lien Google Maps (optionnel)", { placeholder: "https://maps.app.goo.gl/…" })}
      </section>

      <section className={`${ui.card} space-y-4`}>
        <div>
          <h2 className="font-display text-lg text-encre">Horaires d&apos;ouverture</h2>
          <p className="mt-1 text-sm text-encre/50">Affichés dans le pied de page et sur la page Contact.</p>
        </div>

        {hours.map((h, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3">
            <input
              name="hoursDays"
              value={h.days}
              onChange={(e) => setHours((prev) => prev.map((x, k) => (k === i ? { ...x, days: e.target.value } : x)))}
              placeholder="Lundi – Samedi"
              className={`${ui.input} min-w-0 flex-1`}
            />
            <input
              name="hoursTime"
              value={h.time}
              onChange={(e) => setHours((prev) => prev.map((x, k) => (k === i ? { ...x, time: e.target.value } : x)))}
              placeholder="08h00 – 20h00"
              className={`${ui.input} min-w-0 flex-1`}
            />
            <button
              type="button"
              onClick={() => setHours((prev) => prev.filter((_, k) => k !== i))}
              disabled={hours.length === 1}
              className={`${ui.iconBtn} disabled:opacity-30`}
              aria-label="Retirer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {hours.length < 7 && (
          <button
            type="button"
            onClick={() => setHours((prev) => [...prev, { days: "", time: "" }])}
            className={`${ui.btnGhost} !py-2`}
          >
            <Plus className="h-4 w-4" />
            Ajouter une ligne
          </button>
        )}
      </section>

      <section className={`${ui.card} space-y-5`}>
        <h2 className="font-display text-lg text-encre">Réseaux sociaux</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {field("instagram", "Instagram", { placeholder: "https://instagram.com/…" })}
          {field("facebook", "Facebook", { placeholder: "https://facebook.com/…" })}
          {field("tiktok", "TikTok", { placeholder: "https://tiktok.com/@…" })}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
      </div>
    </form>
  );
}