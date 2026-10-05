import { Hammer } from "lucide-react";
import { ui } from "@/lib/admin-ui";

export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-6">
      <h1 className={ui.h1}>{title}</h1>
      <div className={`${ui.card} py-14 text-center`}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-prune-light text-prune">
          <Hammer className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <p className="mt-4 font-display text-lg text-encre">Module en cours de construction</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-encre/50">{text}</p>
      </div>
    </div>
  );
}