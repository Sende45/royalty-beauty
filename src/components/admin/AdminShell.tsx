"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Scissors,
  Settings,
  ShoppingCart,
  Star,
  Users,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { logout } from "@/actions/auth";

const nav = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/admin/prestations", label: "Prestations", icon: Scissors },
  { href: "/admin/equipe", label: "Équipe", icon: Users },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/galerie", label: "Galerie", icon: Images },
  { href: "/admin/avis", label: "Avis", icon: Star },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

type Props = { userName: string; children: React.ReactNode };

export default function AdminShell({ userName, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-prune/10 px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active ? "bg-prune text-white" : "text-encre/70 hover:bg-prune-light hover:text-prune"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-prune/10 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-encre/70 transition hover:bg-prune-light"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
          Voir le site
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Déconnexion
          </button>
        </form>
        <p className="px-3 pt-2 text-xs text-encre/40">Connecté : {userName}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f4f8]">
      {/* Barre latérale ordinateur */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-prune/10 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Barre du haut mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-prune/10 bg-white px-4 py-3 lg:hidden">
        <Logo showText={false} />
        <span className="font-display text-sm text-encre">Administration</span>
        <button onClick={() => setOpen(true)} className="p-2 text-prune" aria-label="Menu">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-encre/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 p-2 text-encre/50"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}