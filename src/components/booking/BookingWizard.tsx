"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  Sparkles,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { createBooking } from "@/actions/booking";
import { formatDuration, formatFCFA } from "@/lib/format";

type StylistOption = { id: string; name: string; photoUrl: string | null };
type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceFrom: boolean;
  durationMin: number;
  depositAmount: number;
  stylists: StylistOption[];
};
type Category = { id: string; name: string; services: ServiceOption[] };
type Slot = { time: string; stylistIds: string[] };

const STEPS = ["Prestation", "Coiffeuse", "Date & heure", "Coordonnées"];

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const weekdayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

type Props = { categories: Category[]; initialServiceId?: string };

export default function BookingWizard({ categories, initialServiceId }: Props) {
  const router = useRouter();
  const services = useMemo(() => categories.flatMap((c) => c.services), [categories]);
  const days = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return toISODate(d);
      }),
    []
  );

  const [step, setStep] = useState(initialServiceId ? 1 : 0);
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [stylistId, setStylistId] = useState("any");
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const service = services.find((s) => s.id === serviceId);
  const stylist = service?.stylists.find((s) => s.id === stylistId);

  const loadSlots = async (newDate: string, forStylist = stylistId, forService = serviceId) => {
    const id = ++requestId.current;
    setDate(newDate);
    setTime("");
    setLoadingSlots(true);
    try {
      const params = new URLSearchParams({ service: forService, date: newDate });
      if (forStylist !== "any") params.set("stylist", forStylist);
      const res = await fetch(`/api/creneaux?${params}`);
      const data = await res.json();
      if (id === requestId.current) setSlots(data.slots ?? []);
    } catch {
      if (id === requestId.current) setSlots([]);
    } finally {
      if (id === requestId.current) setLoadingSlots(false);
    }
  };

  const chooseService = (id: string) => {
    setServiceId(id);
    setStylistId("any");
    setStep(1);
  };

  const chooseStylist = (id: string) => {
    setStylistId(id);
    setStep(2);
    loadSlots(date, id);
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    const res = await createBooking({
      serviceId,
      stylistId: stylistId === "any" ? null : stylistId,
      date,
      time,
      ...form,
    });
    if (!res.ok) {
      setError(res.error);
      setSubmitting(false);
      if (res.slotTaken) {
        setStep(2);
        loadSlots(date);
      }
      return;
    }
    router.push(`/reservation/confirmation?ref=${res.reference}`);
  };

  const periods = [
    { label: "Matin", slots: slots.filter((s) => s.time < "12:00") },
    { label: "Après-midi", slots: slots.filter((s) => s.time >= "12:00" && s.time < "17:00") },
    { label: "Soir", slots: slots.filter((s) => s.time >= "17:00") },
  ].filter((p) => p.slots.length > 0);

  const canSubmit = form.fullName.trim().length >= 2 && form.phone.replace(/\D/g, "").length >= 8;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Étapes */}
        <div className="mb-8">
          <div className="flex justify-between text-xs uppercase tracking-widest">
            {STEPS.map((label, i) => (
              <span key={label} className={i <= step ? "text-prune" : "text-encre/30"}>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </span>
            ))}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-prune/10">
            <motion.div
              className="h-full bg-prune"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Étape 1 : prestation */}
            {step === 0 && (
              <div className="space-y-8">
                <h2 className="font-display text-2xl text-encre">Choisissez votre prestation</h2>
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <p className="eyebrow mb-3">{cat.name}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cat.services.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => chooseService(s.id)}
                          className={`rounded-2xl border p-5 text-left transition hover:border-prune hover:shadow-md ${
                            serviceId === s.id ? "border-prune bg-prune-light" : "border-or/30 bg-white"
                          }`}
                        >
                          <p className="font-display text-base text-encre">{s.name}</p>
                          <p className="mt-2 flex items-center gap-3 text-xs text-encre/50">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-or" />
                              {formatDuration(s.durationMin)}
                            </span>
                            <span className="font-semibold text-prune">
                              {s.priceFrom && "dès "}
                              {formatFCFA(s.price)}
                            </span>
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Étape 2 : coiffeuse */}
            {step === 1 && service && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-encre">Avec qui ?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => chooseStylist("any")}
                    className="flex items-center gap-4 rounded-2xl border border-or/30 bg-white p-4 text-left transition hover:border-prune hover:shadow-md"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-or-light text-or-dark">
                      <Users className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-display text-base text-encre">Peu importe</p>
                      <p className="text-xs text-encre/50">Plus de créneaux disponibles</p>
                    </div>
                  </button>

                  {service.stylists.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => chooseStylist(st.id)}
                      className="flex items-center gap-4 rounded-2xl border border-or/30 bg-white p-4 text-left transition hover:border-prune hover:shadow-md"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-prune-light">
                        {st.photoUrl ? (
                          <Image src={st.photoUrl} alt={st.name} fill sizes="56px" className="object-cover" />
                        ) : (
                          <User className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-prune/40" />
                        )}
                      </div>
                      <p className="font-display text-base text-encre">{st.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Étape 3 : date et heure */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-encre">Quand ?</h2>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                  {days.map((d) => {
                    const active = d === date;
                    return (
                      <button
                        key={d}
                        onClick={() => loadSlots(d)}
                        className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 transition ${
                          active ? "border-prune bg-prune text-ivoire" : "border-or/30 bg-white text-encre hover:border-prune"
                        }`}
                      >
                        <span className="text-[0.65rem] uppercase tracking-wider opacity-70">
                          {weekdayFmt.format(asDate(d)).replace(".", "")}
                        </span>
                        <span className="mt-1 text-sm font-semibold">{dayFmt.format(asDate(d)).split(" ")[0]}</span>
                        <span className="text-[0.65rem] opacity-70">{dayFmt.format(asDate(d)).split(" ")[1]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="min-h-40 rounded-2xl border border-or/20 bg-white p-5">
                  {loadingSlots ? (
                    <div className="flex h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-prune" />
                    </div>
                  ) : periods.length === 0 ? (
                    <p className="py-10 text-center font-serif text-lg text-encre/60">
                      Aucun créneau disponible ce jour-là. Essayez une autre date.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {periods.map((p) => (
                        <div key={p.label}>
                          <p className="mb-2 text-xs uppercase tracking-widest text-encre/50">{p.label}</p>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {p.slots.map((s) => (
                              <button
                                key={s.time}
                                onClick={() => setTime(s.time)}
                                className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                                  time === s.time
                                    ? "border-prune bg-prune text-ivoire"
                                    : "border-or/30 text-encre hover:border-prune hover:text-prune"
                                }`}
                              >
                                {s.time.replace(":", "h")}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => setStep(3)} disabled={!time} className="btn-primary w-full disabled:opacity-40 sm:w-auto">
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Étape 4 : coordonnées */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-encre">Vos coordonnées</h2>

                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <div className="space-y-4 rounded-2xl border border-or/20 bg-white p-5">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-encre/60">Nom complet</span>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full rounded-xl border border-or/30 bg-ivoire px-4 py-3 text-sm outline-none focus:border-prune focus:ring-2 focus:ring-prune/15"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-encre/60">Téléphone (WhatsApp)</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="07 00 00 00 00"
                      className="w-full rounded-xl border border-or/30 bg-ivoire px-4 py-3 text-sm outline-none focus:border-prune focus:ring-2 focus:ring-prune/15"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-encre/60">
                      Précisions (optionnel)
                    </span>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Longueur souhaitée, mèches à prévoir…"
                      className="w-full rounded-xl border border-or/30 bg-ivoire px-4 py-3 text-sm outline-none focus:border-prune focus:ring-2 focus:ring-prune/15"
                    />
                  </label>
                </div>

                {service && service.depositAmount > 0 && (
                  <p className="flex items-start gap-3 rounded-2xl bg-or-light p-4 text-sm text-encre/80">
                    <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-or-dark" />
                    Un acompte de {formatFCFA(service.depositAmount)} vous sera demandé pour confirmer ce rendez-vous. Il
                    sera déduit du prix final.
                  </p>
                )}

                <button onClick={submit} disabled={!canSubmit || submitting} className="btn-primary w-full disabled:opacity-40">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Confirmer la réservation
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-8 inline-flex items-center gap-2 text-sm text-encre/50 transition hover:text-prune"
          >
            <ArrowLeft className="h-4 w-4" />
            Étape précédente
          </button>
        )}
      </div>

      {/* Récapitulatif */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-prune p-6 text-ivoire">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-or">
            <Sparkles className="h-4 w-4" /> Votre réservation
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-ivoire/50">Prestation</dt>
              <dd className="mt-1 font-display text-base">{service?.name ?? "—"}</dd>
              {service && (
                <dd className="text-ivoire/70">
                  {formatDuration(service.durationMin)} · {service.priceFrom && "dès "}
                  {formatFCFA(service.price)}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-ivoire/50">Coiffeuse</dt>
              <dd className="mt-1">{step < 1 ? "—" : stylist?.name ?? "Peu importe"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-ivoire/50">
                <CalendarDays className="h-3.5 w-3.5" /> Date
              </dt>
              <dd className="mt-1 capitalize">
                {step >= 2 && time ? `${longFmt.format(asDate(date))} à ${time.replace(":", "h")}` : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}