"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { setTheme, useTheme } from "@/lib/theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={dark ? "Mode Soleil" : "Mode Lune"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-or/40 text-prune transition hover:border-or hover:text-or-dark ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="block"
          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {dark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}