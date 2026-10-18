"use client";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        website: formData.get("website"),
      }),
    });

    if (res.ok) setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 font-display text-2xl text-green-900">Message envoyé !</h3>
        <p className="mt-2 text-sm text-green-700">Nous vous répondrons dans les plus brefs délais.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="website" tabIndex={-1} className="hidden" autoComplete="off" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input name="name" placeholder="Votre nom" required className="bg-brand-gray/30" />
        <Input name="email" type="email" placeholder="Votre email" required className="bg-brand-gray/30" />
      </div>
      <Input name="subject" placeholder="Sujet" required className="bg-brand-gray/30" />
      <textarea name="message" placeholder="Votre message..." required rows={5} className="w-full rounded-xl border border-brand-black/10 bg-brand-gray/30 p-4 text-sm outline-none focus:border-brand-red" />
      <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 text-sm font-semibold text-white transition hover:bg-brand-red/90 disabled:opacity-50 md:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le message"}
      </button>
    </form>
  );
}