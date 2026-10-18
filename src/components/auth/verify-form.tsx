"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

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
      setResendInfo("Nouveau code envoyé avec succès !");
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
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-neutral-900/40 p-8 text-center backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-light text-white">
          Compte vérifié !
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
          Redirection vers la page de connexion…
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-10">
      {/* Halo lumineux ambiant */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/10 blur-[100px]" />

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        <Mail className="h-7 w-7" />
      </div>

      <div className="text-center">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
          [ Sécurité ]
        </span>
        <h1 className="mt-2 font-display text-3xl font-light text-white">
          Vérifiez votre email
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 leading-relaxed">
          Nous avons envoyé un code à 6 chiffres à{" "}
          <strong className="text-white font-sans">{emailFromUrl}</strong>.
        </p>
      </div>

      {/* CASES DU CODE OTP */}
      <div className="mt-8 flex justify-center gap-3">
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
            className="h-16 w-12 rounded-2xl border border-white/15 bg-white/[0.03] text-center font-display text-2xl font-light text-white outline-none transition-all duration-300 hover:border-white/30 focus:border-brand-red focus:bg-brand-red/10 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)] disabled:opacity-40 md:h-20 md:w-16 md:text-3xl"
          />
        ))}
      </div>

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-widest text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin text-brand-red" />
          <span>Vérification du code...</span>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400 backdrop-blur-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendInfo && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400 backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{resendInfo}</span>
        </div>
      )}

      <div className="mt-8 space-y-4 text-center font-mono text-xs">
        <p className="text-neutral-400">
          Vous n'avez pas reçu le code ?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-bold text-brand-red transition-colors hover:text-white disabled:opacity-50"
          >
            {resending ? "Envoi..." : "Renvoyer"}
          </button>
        </p>
        
        <div>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 text-neutral-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Utiliser un autre email</span>
          </Link>
        </div>
      </div>
    </div>
  );
}