// Envoi d'une image depuis le navigateur vers Cloudinary (côté client uniquement)

export type UploadedImage = { url: string; publicId: string; width: number; height: number };

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 Mo

type Signature = { timestamp: number; signature: string; folder: string; apiKey: string; cloudName: string };

export async function uploadImage(
  file: File,
  folder: "galerie" | "produits" | "equipe" | "prestations",
  onProgress?: (percent: number) => void
): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Image trop lourde (10 Mo maximum).");

  const res = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: null }));
    throw new Error(error ?? "Autorisation d'envoi refusée.");
  }
  const sig: Signature = await res.json();

  const data = new FormData();
  data.append("file", file);
  data.append("api_key", sig.apiKey);
  data.append("timestamp", String(sig.timestamp));
  data.append("signature", sig.signature);
  data.append("folder", sig.folder);

  // XMLHttpRequest plutôt que fetch pour suivre la progression
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const r = JSON.parse(xhr.responseText);
        resolve({ url: r.secure_url, publicId: r.public_id, width: r.width, height: r.height });
      } else {
        reject(new Error("Cloudinary a refusé l'image."));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant l'envoi."));

    xhr.send(data);
  });
}