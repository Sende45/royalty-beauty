import Ornament from "@/components/Ornament";
import Reveal from "@/components/Reveal";

type Props = { eyebrow: string; title: string; subtitle?: string };

export default function PageHero({ eyebrow, title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden bg-prune-light py-16 text-center md:py-20">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-or/30" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full border border-prune/20" />

      <Reveal className="relative mx-auto max-w-3xl px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl text-encre md:text-5xl">{title}</h1>
        <Ornament className="mt-6" />
        {subtitle && <p className="mt-6 font-serif text-xl text-encre/70">{subtitle}</p>}
      </Reveal>
    </section>
  );
}