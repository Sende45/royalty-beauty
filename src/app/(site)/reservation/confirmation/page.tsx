import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, CheckCircle2, MessageCircle, Wallet } from "lucide-react";
import Reveal from "@/components/Reveal";
import Ornament from "@/components/Ornament";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Réservation enregistrée — Royalty Beauty",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Abidjan",
});

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function ConfirmationPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const appointment = await prisma.appointment.findUnique({
    where: { reference: ref },
    include: { service: true, stylist: true, customer: true },
  });
  if (!appointment) notFound();

  const pending = appointment.status === "EN_ATTENTE_PAIEMENT";
  const firstName = appointment.customer.fullName.split(" ")[0];
  const when = dateFmt.format(appointment.startAt);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Reveal>
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            pending ? "bg-or-light text-or-dark" : "bg-green-50 text-green-600"
          }`}
        >
          {pending ? <CalendarCheck className="h-10 w-10" strokeWidth={1.5} /> : <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />}
        </div>
        <h1 className="mt-6 font-display text-3xl text-encre md:text-4xl">
          {pending ? "Réservation enregistrée" : "Rendez-vous confirmé"}
        </h1>
        <Ornament className="mt-5" />
        <p className="mt-6 font-serif text-xl text-encre/70">
          Merci {firstName} ! Nous avons hâte de vous accueillir.
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <dl className="mt-10 space-y-3 rounded-3xl border border-or/30 bg-white p-6 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-encre/50">Référence</dt>
            <dd className="font-medium text-encre">{appointment.reference}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre/50">Prestation</dt>
            <dd className="text-right font-medium text-encre">{appointment.service.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre/50">Coiffeuse</dt>
            <dd className="font-medium text-encre">{appointment.stylist.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-encre/50">Date</dt>
            <dd className="text-right font-medium capitalize text-prune">{when}</dd>
          </div>
        </dl>
      </Reveal>

      {pending && (
        <Reveal delay={0.25}>
          <div className="mt-6 rounded-3xl bg-or-light p-6 text-left">
            <p className="flex items-center gap-2 font-display text-lg text-encre">
              <Wallet className="h-5 w-5 text-or-dark" /> Dernière étape : l&apos;acompte
            </p>
            <p className="mt-2 text-sm text-encre/70">
              Pour confirmer votre rendez-vous, réglez l&apos;acompte de{" "}
              <strong>{formatFCFA(appointment.depositAmount)}</strong> par Mobile Money. Écrivez-nous sur WhatsApp, nous
              vous indiquons le numéro de paiement.
            </p>
            <a
              href={whatsappLink(
                `Bonjour Royalty Beauty, j'ai réservé ${appointment.service.name} le ${when} (réf. ${appointment.reference}). Je souhaite régler l'acompte de ${formatFCFA(appointment.depositAmount)}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5 w-full"
            >
              <MessageCircle className="h-4 w-4" />
              Régler l&apos;acompte sur WhatsApp
            </a>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.35}>
        <Link href="/" className="btn-outline mt-10">
          Retour à l&apos;accueil
        </Link>
      </Reveal>
    </div>
  );
}