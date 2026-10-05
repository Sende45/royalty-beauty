import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { whatsappLink } from "@/lib/site";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact — Royalty Beauty",
  description: "Contactez le salon Royalty Beauty : adresse, téléphone, WhatsApp et horaires d'ouverture.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const s = await getSettings();

  const infos = [
    { icon: MapPin, label: "Adresse", value: s.address, href: s.mapsUrl ?? undefined },
    { icon: Phone, label: "Téléphone", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Écrivez-nous directement", href: whatsappLink() },
    ...(s.email ? [{ icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` }] : []),
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de vous"
        subtitle="Une question, une envie de nouvelle coiffure ? Nous sommes à votre écoute."
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {infos.map((info, i) => {
            const Icon = info.icon;
            const content = (
              <div className="flex items-start gap-4 rounded-2xl border border-or/20 bg-white p-5 transition duration-300 hover:border-or hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-or-light text-or-dark">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-encre/50">{info.label}</p>
                  <p className="mt-1 font-serif text-lg text-encre">{info.value}</p>
                </div>
              </div>
            );
            const external = info.href?.startsWith("http") || info.href?.startsWith("/whatsapp");
            return (
              <Reveal key={info.label} delay={i * 0.1}>
                {info.href ? (
                  <a href={info.href} target={external ? "_blank" : undefined} rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </Reveal>
            );
          })}

          <Reveal delay={0.3}>
            <div className="rounded-2xl bg-prune p-6 text-ivoire">
              <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-or">
                <Clock className="h-4 w-4" /> Horaires d&apos;ouverture
              </p>
              <ul className="mt-4 space-y-2">
                {s.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-4 font-serif text-lg">
                    <span className="text-ivoire/80">{h.days}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:col-span-3">
          <ContactForm />
        </Reveal>
      </div>

      <Reveal>
        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="overflow-hidden rounded-3xl border border-or/30">
            <iframe
              title="Localisation Royalty Beauty"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
              className="h-80 w-full md:h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Reveal>
    </>
  );
}