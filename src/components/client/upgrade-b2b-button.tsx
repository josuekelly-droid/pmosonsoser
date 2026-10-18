"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";

export function UpgradeB2BButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    if (!confirm("Confirmer votre demande de passage en compte professionnel ?")) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/client/upgrade-b2b", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la demande");
        return;
      }

      // Rafraîchit la page pour afficher l'état "En attente"
      router.refresh();
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="inline-flex h-14 items-center gap-2 rounded-full bg-brand-red px-8 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Store className="h-5 w-5" />}
        Envoyer ma demande Pro
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}