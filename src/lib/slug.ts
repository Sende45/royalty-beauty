export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Génère un slug unique en ajoutant -2, -3… si nécessaire
export async function uniqueSlug(text: string, exists: (slug: string) => Promise<boolean>) {
  const base = slugify(text) || "element";
  let slug = base;
  let i = 2;
  while (await exists(slug)) slug = `${base}-${i++}`;
  return slug;
}