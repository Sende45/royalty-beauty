"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShoppingBag } from "lucide-react";
import { cart, type CartItem } from "@/lib/cart";

type Props = {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  className?: string;
};

export default function AddToCartButton({ product, quantity = 1, className = "" }: Props) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleClick = () => {
    cart.add(product, quantity);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button onClick={handleClick} className={`btn-primary ${added ? "!bg-green-600" : ""} ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={added ? "ok" : "add"}
          className="inline-flex items-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {added ? "Ajouté" : "Ajouter au panier"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}