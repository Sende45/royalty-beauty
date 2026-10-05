"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { whatsappLink } from "@/lib/site";

const subjects = ["Prise de rendez-vous", "Question sur une prestation", "Commande boutique", "Autre"];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", subject: subjects[0], message: "" });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Bonjour Royalty Beauty,\n\nNom : ${form.name}\nTéléphone : ${form.phone}\nObjet : ${form.subject}\n\n${form.message}`;
    window.open(whatsappLink(text), "_blank");
  };

  const inputClass =
    "w-full rounded-xl border border-or/30 bg-ivoire px-4 py-3 text-sm text-encre outline-none transition focus:border-prune focus:ring-2 focus:ring-prune/15";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-or/30 bg-white p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-widest text-encre/60">Nom complet</span>
          <input required value={form.name} onChange={update("name")} className={inputClass} placeholder="Votre nom" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-widest text-encre/60">Téléphone</span>
          <input required type="tel" value={form.phone} onChange={update("phone")} className={inputClass} placeholder="07 00 00 00 00" />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-widest text-encre/60">Objet</span>
        <select value={form.subject} onChange={update("subject")} className={inputClass}>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-widest text-encre/60">Message</span>
        <textarea required rows={5} value={form.message} onChange={update("message")} className={inputClass} placeholder="Votre message…" />
      </label>

      <button type="submit" className="btn-primary w-full">
        <Send className="h-4 w-4" />
        Envoyer sur WhatsApp
      </button>
      <p className="text-center text-xs text-encre/50">
        Votre message s&apos;ouvrira dans WhatsApp, il ne vous restera qu&apos;à l&apos;envoyer.
      </p>
    </form>
  );
}