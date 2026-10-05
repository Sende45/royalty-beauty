import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import { whatsappLink } from "@/lib/site";
import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const s = await getSettings();
  const socials = [
    { label: "Instagram", href: s.instagram },
    { label: "Facebook", href: s.facebook },
    { label: "TikTok", href: s.tiktok },
  ].filter((x): x is { label: string; href: string } => !!x.href);

  return (
    <footer className="bg-prune-dark text-ivoire">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 font-serif text-lg italic text-ivoire/70">
            Parce que chaque client mérite d&apos;être traitée comme un Roi.
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((x) => (
                <a
                  key={x.label}
                  href={x.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ivoire/20 px-3 py-1 text-xs tracking-wider text-ivoire/80 transition hover:border-or hover:text-or"
                >
                  {x.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="eyebrow !text-or">Navigation</h3>
          <ul className="mt-4 space-y-2 text-sm text-ivoire/80">
            <li><Link href="/prestations" className="hover:text-or">Prestations</Link></li>
            <li><Link href="/reservation" className="hover:text-or">Réservation</Link></li>
            <li><Link href="/boutique" className="hover:text-or">Boutique</Link></li>
            <li><Link href="/galerie" className="hover:text-or">Galerie</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow !text-or">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ivoire/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-or" />
              {s.mapsUrl ? (
                <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-or">
                  {s.address}
                </a>
              ) : (
                s.address
              )}
            </li>
            <li>
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-or">
                <Phone className="h-4 w-4 shrink-0 text-or" />
                {s.phone}
              </a>
            </li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-or">
                <MessageCircle className="h-4 w-4 shrink-0 text-or" />
                WhatsApp
              </a>
            </li>
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="flex items-center gap-3 hover:text-or">
                  <Mail className="h-4 w-4 shrink-0 text-or" />
                  {s.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow flex items-center gap-2 !text-or">
            <Clock className="h-4 w-4" /> Horaires
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-ivoire/80">
            {s.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ivoire/10 py-5 text-center text-xs tracking-widest text-ivoire/50">
        © {new Date().getFullYear()} {s.name} — Tous droits réservés
      </div>
    </footer>
  );
}