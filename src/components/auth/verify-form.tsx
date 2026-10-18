"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

const CODE_LENGTH = 6;

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!emailFromUrl) router.replace("/inscription");
    inputsRef.current[0]?.focus();
  }, [emailFromUrl, router]);

  function handleChange(index: number, value: string) {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const newDigits = [...digits];
    newDigits[index] = v;
    setDigits(newDigits);

    if (v && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit si tous les chiffres sont remplis
    if (newDigits.every((d) => d !== "") && index === CODE_LENGTH - 1) {
      submitCode(newDigits.join(""));
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (pasted.length === CODE_LENGTH) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      submitCode(pasted);
    }
  }

  async function submitCode(code: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromUrl, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Code invalide");
        setDigits(Array(CODE_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    setResendInfo(null);
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Impossible de renvoyer le code");
        return;
      }
      setResendInfo("Nouveau code envoyé !");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } catch {
      setError("Connexion impossible.");
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-4 font-display text-3xl tracking-wide text-white">
          Compte vérifié !
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Redirection vers la page de connexion…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/10">
        <Mail className="h-6 w-6 text-brand-red" />
      </div>

      <h1 className="text-center font-display text-3xl tracking-wide text-white">
        Vérifiez votre email
      </h1>
      <p className="mt-2 text-center text-sm text-white/60">
        Nous avons envoyé un code à 6 chiffres à{" "}
        <strong className="text-white">{emailFromUrl}</strong>.
      </p>

      {/* Cases du code */}
      <div className="mt-8 flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={loading}
            className="h-14 w-12 rounded-xl border-2 border-white/10 bg-white/5 text-center font-display text-2xl text-white outline-none transition focus:border-brand-red focus:bg-white/10 disabled:opacity-50 md:h-16 md:w-14 md:text-3xl"
          />
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Vérification…
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendInfo && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-green-500/10 p-3 text-xs text-green-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{resendInfo}</span>
        </div>
      )}

      <div className="mt-6 space-y-3 text-center text-xs">
        <p className="text-white/60">
          Pas reçu le code ?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-semibold text-brand-red hover:underline disabled:opacity-50"
          >
            {resending ? "Envoi…" : "Renvoyer"}
          </button>
        </p>
        <p className="text-white/40">
          <Link href="/inscription" className="hover:text-white">
            ← Utiliser un autre email
          </Link>
        </p>
      </div>
    </div>
  );
}