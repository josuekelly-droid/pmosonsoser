"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Award, CheckCircle2 } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const BRANDS = ["Apsonic", "Honda", "TVS", "Haojue", "Dayang"];

const STATS = [
  { value: "60+", label: "Modèles", icon: Award },
  { value: "48h", label: "Livraison", icon: Truck },
  { value: "100%", label: "Garanti", icon: ShieldCheck },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-brand-black pt-28 md:pt-32">
      {/* --- FONDS DÉCORATIFS --- */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[120px]" />

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="relative mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:py-20">
        
        {/* Colonne Texte */}
        <div className="min-w-0 text-center lg:text-left">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
            Motos · Tricycles · Pièces
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-6 font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            OSONS <span className="text-brand-red">OSER</span>
            <br />
            ROULER <span className="text-brand-red">AUTREMENT</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg lg:mx-0"
          >
            Le catalogue premium de motos, tricycles, pièces détachées et lubrifiants au
            Bénin. Qualité certifiée, livraison rapide, paiement Mobile Money.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <Link
              href="/motos"
              className="group inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-red px-8 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90"
            >
              Découvrir le catalogue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pro"
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Espace Pro B2B
            </Link>
          </motion.div>

          {/* ⬇️ NOUVELLE BARRE DE STATS (HORIZONTALE ET COMPACTE) ⬇️ */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mx-auto mt-10 flex w-full max-w-md items-stretch justify-between divide-x divide-white/10 rounded-2xl border border-white/5 bg-white/5 py-4 backdrop-blur-sm md:w-fit md:gap-8 md:px-8 lg:mx-0"
          >
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-1 flex-col items-center justify-center px-1 text-center md:flex-row md:justify-start md:gap-3 md:px-0 md:text-left">
                  <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 md:mb-0 md:h-10 md:w-10">
                    <Icon className="h-4 w-4 text-brand-red md:h-5 md:w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg leading-none text-white md:text-xl">{s.value}</p>
                    <p className="mt-1 text-[8px] uppercase tracking-widest text-white/50 md:text-[10px]">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Colonne Visuel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mx-auto min-w-0 w-full max-w-lg lg:ml-auto"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-brand-red/20 to-transparent blur-2xl" />
          
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-brand-black shadow-2xl backdrop-blur-sm">
            <Image
              src="/categories/ap150ts-hero2x.webp"
              alt="Motos PM Osons Oser"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-black/80 p-3 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Produits certifiés</p>
                <p className="text-xs text-white/60">Qualité garantie · Livraison 48h</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- BANDEAU MARQUES --- */}
      <div className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 overflow-x-auto px-4 py-5 md:gap-16 md:px-8">
          <p className="hidden text-xs font-semibold uppercase tracking-widest text-white/30 md:block">
            Nos marques
          </p>
          {BRANDS.map((b) => (
            <span
              key={b}
              className="shrink-0 font-display text-sm tracking-widest text-white/40 transition hover:text-white md:text-lg"
            >
              {b.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}