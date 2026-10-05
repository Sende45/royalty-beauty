import { NextResponse, type NextRequest } from "next/server";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text") ?? "";
  const { whatsapp } = await getSettings();
  const url = `https://wa.me/${whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return NextResponse.redirect(url);
}