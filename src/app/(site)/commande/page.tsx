import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CheckoutForm from "@/components/shop/CheckoutForm";

export const metadata: Metadata = {
  title: "Finaliser ma commande — Royalty Beauty",
  robots: { index: false, follow: false },
};

export default function CommandePage() {
  return (
    <>
      <PageHero eyebrow="Boutique" title="Finaliser ma commande" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <CheckoutForm />
      </div>
    </>
  );
}