import { NextResponse, type NextRequest } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const service = params.get("service");
  const date = params.get("date");
  const stylist = params.get("stylist");

  if (!service || !date) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const slots = await getAvailableSlots(service, date, stylist || null);
  return NextResponse.json({ slots });
}