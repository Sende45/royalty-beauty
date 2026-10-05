"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarHeart, Menu, ShoppingBag, X } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/prestations", label: "Prestations" },
  { href: "/boutique", label: "Boutique" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

function CartLink({ className = "" }: { className?: string }) {
  const { count } = useCart();
  return (
    <Link href="/panier" aria-label="Panier" className={`relative text-prune transition hover:text-or-dark ${className}`}>
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-or px-1 text-[0.65rem] font-bold text-ivoire"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-ivoire/90 backdrop-blur transition-shadow ${
        scrolled ? "border-or/20 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {/* Ordinateur */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative text-xs uppercase tracking-[0.2em] text-encre/80 transition hover:text-or-dark"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-or transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}

          <ThemeToggle />
          <CartLink />

          <Link href="/reservation" className="btn-primary !px-5 !py-2.5 !text-xs">
            <CalendarHeart className="h-4 w-4" />
            Réserver
          </Link>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <CartLink className="p-2" />
          <button onClick={() => setOpen(!open)} className="p-2 text-prune" aria-label="Menu">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                className="block"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="overflow-hidden border-t border-or/20 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm uppercase tracking-[0.2em] text-encre/80"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link href="/reservation" onClick={() => setOpen(false)} className="btn-primary mt-3">
                <CalendarHeart className="h-4 w-4" />
                Réserver
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}