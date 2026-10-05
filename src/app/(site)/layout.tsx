import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { getSettings } from "@/lib/settings";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  const business = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${SITE_URL}/#salon`,
    name: s.name,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    logo: `${SITE_URL}/icon.svg`,
    telephone: s.phone,
    email: s.email ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressLocality: "Abidjan",
      addressCountry: "CI",
    },
    hasMap: s.mapsUrl ?? undefined,
    sameAs: [s.instagram, s.facebook, s.tiktok].filter(Boolean),
    priceRange: "3 000 – 65 000 FCFA",
    currenciesAccepted: "XOF",
    paymentAccepted: "Espèces, Mobile Money",
  };

  return (
    <div className="site-theme flex min-h-screen flex-col bg-ivoire text-encre">
      <JsonLd data={business} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}