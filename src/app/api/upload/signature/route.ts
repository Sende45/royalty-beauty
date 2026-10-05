import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";

const ALLOWED_FOLDERS = ["galerie", "produits", "equipe", "prestations"];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary n'est pas configuré dans .env" }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as { folder?: string };
  const folder = `royalty-beauty/${ALLOWED_FOLDERS.includes(body.folder ?? "") ? body.folder : "divers"}`;
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, CLOUDINARY_API_SECRET);

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  });
}