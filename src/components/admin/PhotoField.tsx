"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import { ui } from "@/lib/admin-ui";

type Props = {
  folder: "equipe" | "prestations";
  defaultUrl?: string | null;
  defaultPublicId?: string | null;
  error?: string;
};

// Champ photo unique : envoie vers Cloudinary et remplit des champs cachés du formulaire
export default function PhotoField({ folder, defaultUrl, defaultPublicId, error }: Props) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [publicId, setPublicId] = useState(defaultPublicId ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploadError("");
    setProgress(0);
    try {
      const img = await uploadImage(file, folder, setProgress);
      setUrl(img.url);
      setPublicId(img.publicId);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Échec de l'envoi.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-prune-light">
        {url ? (
          <Image src={url} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <User className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-prune/30" />
        )}
        {progress !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-encre/60 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="mt-1 text-xs">{progress} %</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className={`${ui.btnGhost} !py-2`}
          >
            <Camera className="h-4 w-4" />
            {url ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setPublicId("");
              }}
              className={`${ui.btnGhost} !py-2 hover:!bg-red-50 hover:!text-red-600`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-encre/40">Format carré conseillé · 10 Mo maximum</p>
        {(uploadError || error) && <p className={ui.error}>{uploadError || error}</p>}
      </div>

      <input type="hidden" name="photoUrl" value={url} />
      <input type="hidden" name="photoPublicId" value={publicId} />
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}