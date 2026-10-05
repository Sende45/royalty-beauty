"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

// Thème affiché tant que la visiteuse n'a rien choisi
export const DEFAULT_THEME: Theme = "dark";

const KEY = "rb_theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Synchronise le thème entre plusieurs onglets
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) applyTheme(e.newValue === "light" ? "light" : "dark", false);
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function applyTheme(theme: Theme, persist = true) {
  const root = document.documentElement;
  root.classList.add("theme-transition");

  if (theme === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");

  if (persist) {
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // stockage indisponible : le thème reste valable pour cette visite
    }
  }

  listeners.forEach((l) => l());
  window.setTimeout(() => root.classList.remove("theme-transition"), 500);
}

export const setTheme = (theme: Theme) => applyTheme(theme);

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
}

// Exécuté avant l'affichage : repasse en mode Soleil seulement si la visiteuse l'a choisi
export const themeInitScript = `try{if(localStorage.getItem("${KEY}")==="light"){document.documentElement.removeAttribute("data-theme")}}catch(e){}`;