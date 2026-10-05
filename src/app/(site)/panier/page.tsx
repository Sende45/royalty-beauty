import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CartView from "@/components/shop/CartView";

export const metadata: Metadata = {
  title: "Mon panier — Royalty Beauty",
  robots: { index: false, follow: false },
};

export default function PanierPage() {
  return (
    <>
      <PageHero eyebrow="Boutique" title="Mon panier" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <CartView />
      </div>
    </>
  );
}