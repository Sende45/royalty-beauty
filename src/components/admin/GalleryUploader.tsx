"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, ImagePlus, Loader2, Plus, UploadCloud, X, XCircle } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import { addGalleryImages } from "@/actions/gallery";
import { ui } from "@/lib/admin-ui";

type Item = { name: string; progress: number; status: "envoi" | "ok" | "erreur"; message?: string };
type Step = "ferme" | "choix" | "envoi" | "termine";

export default function GalleryUploader({ categories }: { categories: string[] }) {
  const [step, setStep] = useState<Step>("ferme");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const successCount = items.filter((i) => i.status === "ok").length;
  const errorCount = items.filter((i) => i.status === "erreur").length;

  const openPicker = () => inputRef.current?.click();

  const reset = (keepCategory: boolean) => {
    setItems([]);
    if (!keepCategory) {
      setCategory("");
      setCaption("");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || step === "envoi") return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setStep("envoi");
    setItems(files.map((f) => ({ name: f.name, progress: 0, status: "envoi" })));

    const uploaded: { url: string; publicId: string }[] = [];

    for (const [i, file] of files.entries()) {
      const update = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((it, k) => (k === i ? { ...it, ...patch } : it)));

      try {
        const img = await uploadImage(file, "galerie", (p) => update({ progress: p }));
        uploaded.push({ url: img.url, publicId: img.publicId });
        update({ status: "ok", progress: 100 });
      } catch (e) {
        update({ status: "erreur", message: e instanceof Error ? e.message : "Erreur inconnue" });
      }
    }

    if (uploaded.length > 0) {
      await addGalleryImages(uploaded, category || null, caption || null);
    }

    if (inputRef.current) inputRef.current.value = "";
    setStep("termine");
  };

  // Panneau fermé : un simple bouton
  if (step === "ferme") {
    return (
      <div className={`${ui.card} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <h2 className="font-display text-lg text-encre">Nouvelles réalisations</h2>
          <p className="mt-1 text-sm text-encre/50">Ajoutez une ou plusieurs photos à la galerie du site.</p>
        </div>
        <button type="button" onClick={() => setStep("choix")} className={ui.btnPrimary}>
          <Plus className="h-4 w-4" />
          Ajouter des photos
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${ui.card} space-y-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg text-encre">Ajouter des photos</h2>
          <p className="mt-1 text-sm text-encre/50">
            Choisissez la catégorie et la légende, puis sélectionnez une ou plusieurs photos.
          </p>
        </div>
        {step !== "envoi" && (
          <button
            type="button"
            onClick={() => {
              reset(false);
              setStep("ferme");
            }}
            className={ui.iconBtn}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Catégorie et légende */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={ui.label}>Catégorie (optionnel)</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="gallery-categories"
            placeholder="Ex : Tresses, Coupes homme…"
            disabled={step === "envoi"}
            className={ui.input}
          />
          <datalist id="gallery-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className={ui.label}>Légende (optionnel)</span>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Appliquée à toutes les photos de cet envoi"
            disabled={step === "envoi"}
            className={ui.input}
          />
        </label>
      </div>

      <AnimatePresence mode="wait">
        {/* Choix des photos */}
        {step === "choix" && (
          <motion.div
            key="choix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
              dragging ? "border-prune bg-prune-light" : "border-prune/20"
            }`}
          >
            <UploadCloud className="h-10 w-10 text-prune" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-encre/60">Glissez vos photos ici, ou</p>
            <button type="button" onClick={openPicker} className={`${ui.btnPrimary} mt-3`}>
              <ImagePlus className="h-4 w-4" />
              Choisir des photos
            </button>
            <p className="mt-3 text-xs text-encre/40">JPG, PNG ou WEBP · 10 Mo maximum par photo</p>
          </motion.div>
        )}

        {/* Envoi en cours et résultat */}
        {(step === "envoi" || step === "termine") && (
          <motion.div key="liste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {step === "envoi" && (
              <p className="flex items-center gap-2 text-sm font-medium text-prune">
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours, ne fermez pas la page…
              </p>
            )}

            {step === "termine" && (
              <div
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                  successCount > 0 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
                }`}
              >
                {successCount > 0 ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                <div>
                  {successCount > 0 && (
                    <p className="font-medium">
                      {successCount} photo{successCount > 1 ? "s" : ""} ajoutée{successCount > 1 ? "s" : ""} à la galerie
                      {category && ` · ${category}`}
                    </p>
                  )}
                  {errorCount > 0 && (
                    <p className={successCount > 0 ? "mt-1 text-red-700" : "font-medium"}>
                      {errorCount} photo{errorCount > 1 ? "s" : ""} n&apos;a pas pu être envoyée
                      {errorCount > 1 ? "s" : ""}.
                    </p>
                  )}
                </div>
              </div>
            )}

            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={i} className="rounded-xl bg-[#f7f4f8] px-4 py-2.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-encre/70">{it.name}</span>
                    {it.status === "ok" && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
                    {it.status === "erreur" && <XCircle className="h-4 w-4 shrink-0 text-red-600" />}
                    {it.status === "envoi" && <span className="shrink-0 text-xs text-prune">{it.progress} %</span>}
                  </div>
                  {it.status === "envoi" && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-prune/10">
                      <div className="h-full bg-prune transition-all" style={{ width: `${it.progress}%` }} />
                    </div>
                  )}
                  {it.message && <p className="mt-1 text-xs text-red-600">{it.message}</p>}
                </li>
              ))}
            </ul>

            {step === "termine" && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-prune/10 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    reset(false);
                    setStep("ferme");
                  }}
                  className={ui.btnGhost}
                >
                  Terminer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset(true);
                    setStep("choix");
                    // Ouvre directement le sélecteur de fichiers
                    setTimeout(openPicker, 50);
                  }}
                  className={ui.btnPrimary}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter d&apos;autres photos
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}