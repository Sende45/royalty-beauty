"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
};

const KEY = "rb_cart_v1";
export const MAX_PER_ITEM = 10;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    items = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // stockage indisponible (navigation privée) : le panier reste en mémoire
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Synchronise le panier entre plusieurs onglets
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const limit = (quantity: number, stock: number) => Math.max(1, Math.min(quantity, stock, MAX_PER_ITEM));

export const cart = {
  add(product: Omit<CartItem, "quantity">, quantity = 1) {
    load();
    const existing = items.find((i) => i.productId === product.productId);
    if (existing) {
      commit(
        items.map((i) =>
          i.productId === product.productId
            ? { ...i, ...product, quantity: limit(i.quantity + quantity, product.stock) }
            : i
        )
      );
    } else {
      commit([...items, { ...product, quantity: limit(quantity, product.stock) }]);
    }
  },
  setQuantity(productId: string, quantity: number) {
    load();
    commit(items.map((i) => (i.productId === productId ? { ...i, quantity: limit(quantity, i.stock) } : i)));
  },
  remove(productId: string) {
    load();
    commit(items.filter((i) => i.productId !== productId));
  },
  clear() {
    commit(EMPTY);
  },
};

export function useCart() {
  const current = useSyncExternalStore(
    subscribe,
    () => {
      load();
      return items;
    },
    () => EMPTY
  );
  const count = current.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = current.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items: current, count, subtotal };
}

// Vrai uniquement après le chargement côté navigateur (évite un affichage « panier vide » au départ)
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}