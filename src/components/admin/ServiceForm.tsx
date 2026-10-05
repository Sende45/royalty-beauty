"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { saveService, type FormState } from "@/actions/services";
import { ui } from "@/lib/admin-ui";

type Props = {
  categories: { id: string; name: string }[];
  service?: {
    id: string;
    name: string;
    description: string | null;
    categoryId: string;
    price: number;
    priceFrom: boolean;
    durationMin: number;
    depositAmount: number;
    isActive: boolean;
  };
};

export default function ServiceForm({ categories, service }: Props) {
  const action = saveService.bind(null, service?.id ?? null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className={`${ui.card} space-y-5`}
    >
      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className={ui.label}>Nom de la prestation</span>
          <input name="name" defaultValue={service?.name} className={ui.input} placeholder="Ex : Box braids" />
          {err("name") && <p className={ui.error}>{err("name")}</p>}
        </label>

        <label className="block">
          <span className={ui.label}>Catégorie</span>
          <select name="categoryId" defaultValue={service?.categoryId ?? ""} className={ui.input}>
            <option value="" disabled>
              Choisir…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {err("categoryId") && <p className={ui.error}>{err("categoryId")}</p>}
        </label>
      </div>

      <label className="block">
        <span className={ui.label}>Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={service?.description ?? ""}
          className={ui.input}
          placeholder="Courte description visible par les clientes"
        />
        {err("description") && <p className={ui.error}>{err("description")}</p>}
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className={ui.label}>Prix (FCFA)</span>
          <input name="price" type="number" min={0} step={500} defaultValue={service?.price} className={ui.input} />
          {err("price") && <p className={ui.error}>{err("price")}</p>}
        </label>

        <label className="block">
          <span className={ui.label}>Durée (minutes)</span>
          <input
            name="durationMin"
            type="number"
            min={5}
            step={5}
            defaultValue={service?.durationMin ?? 60}
            className={ui.input}
          />
          {err("durationMin") && <p className={ui.error}>{err("durationMin")}</p>}
        </label>

        <label className="block">
          <span className={ui.label}>Acompte (FCFA)</span>
          <input
            name="depositAmount"
            type="number"
            min={0}
            step={500}
            defaultValue={service?.depositAmount ?? 0}
            className={ui.input}
          />
          {err("depositAmount") ? (
            <p className={ui.error}>{err("depositAmount")}</p>
          ) : (
            <p className="mt-1 text-xs text-encre/40">0 = pas d&apos;acompte demandé</p>
          )}
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-encre">
          <input name="priceFrom" type="checkbox" defaultChecked={service?.priceFrom} className="h-4 w-4 accent-prune" />
          Afficher « à partir de »
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-encre">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={service?.isActive ?? true}
            className="h-4 w-4 accent-prune"
          />
          Visible sur le site
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-prune/10 pt-5">
        <Link href="/admin/prestations" className={ui.btnGhost}>
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