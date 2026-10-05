"use client";

import { Minus, Plus } from "lucide-react";

type Props = { value: number; max: number; onChange: (value: number) => void; size?: "sm" | "md" };

export default function QuantityStepper({ value, max, onChange, size = "md" }: Props) {
  const box = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-full border border-or/40 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className={`${box} flex items-center justify-center text-prune transition hover:text-or-dark disabled:opacity-30`}
        aria-label="Diminuer"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-encre">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${box} flex items-center justify-center text-prune transition hover:text-or-dark disabled:opacity-30`}
        aria-label="Augmenter"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}