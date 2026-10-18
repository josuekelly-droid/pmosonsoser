"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, ShieldCheck, Truck, Award, CheckCircle2, Sparkles } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Données                                                                  */
/* -------------------------------------------------------------------------- */

const BRANDS = ["Apsonic", "Honda", "TVS", "Haojue", "Dayang"];

const STATS = [
  { value: "60+", label: "Modèles d'Élite", icon: Award },
  { value: "48H", label: "Livraison Réseau", icon: Truck },
  { value: "100%", label: "Garantie Certifiée", icon: ShieldCheck },
];

const COLORWAYS = [
  { id: "grey", name: "Mech Grey", src: "/categories/ap150ts-grey.webp", swatch: "#8f959e", accent: "#8f959e" },
  { id: "black", name: "Gloss Black", src: "/categories/ap150ts-black.webp", swatch: "#121214", accent: "#e53e3e" },
  { id: "white", name: "Pearl White", src: "/categories/ap150ts-white.webp", swatch: "#f8fafc", accent: "#ffffff" },
] as const;

const DEFAULT_INDEX = 1; // Gloss Black
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.4'\/></svg>\")";

/* -------------------------------------------------------------------------- */
/*  Animations                                                                */
/* -------------------------------------------------------------------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.9, ease: EASE },
  }),
};

const lineReveal: Variants = {
  hidden: { y: "115%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { delay: 0.15 + i * 0.12, duration: 1.1, ease: EASE },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Pile d'images Interactive                                                 */
/* -------------------------------------------------------------------------- */

function BikeStack({
  active,
  decorative = false,
}: {
  active: number;
  decorative?: boolean;
}) {
  return (
    <>
      {COLORWAYS.map((c, i) => {
        const isActive = i === active;
        return (
          <motion.div
            key={c.id}
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              x: isActive ? 0 : i < active ? -60 : 60,
              scale: isActive ? 1 : 0.95,
              rotate: isActive ? 0 : i < active ? -1.5 : 1.5,
            }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute inset-0"
          >
            <Image
              src={c.src}
              alt={decorative ? "" : `Apsonic AP150TS, coloris ${c.name}`}
              aria-hidden={decorative || undefined}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              priority={!decorative && i === DEFAULT_INDEX}
              className="select-none object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
              draggable={false}
            />
          </motion.div>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero Component                                                            */
/* -------------------------------------------------------------------------- */

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const [active, setActive] = useState(DEFAULT_INDEX);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % COLORWAYS.length), 6000);
    return () => clearInterval(id);
  }, [auto, reduce]);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  // Parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 20, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 45, damping: 20, mass: 0.5 });
  const bikeX = useTransform(sx, [-0.5, 0.5], [-24, 24]);
  const bikeY = useTransform(sy, [-0.5, 0.5], [-12, 12]);
  const wordX = useTransform(sx, [-0.5, 0.5], [35, -35]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const wordY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const bikeScrollY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="relative isolate flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#0A0A0B] text-white pt-28 md:pt-36 selection:bg-brand-red selection:text-white"
    >
      {/* Grille architecturale sombre */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Dynamic Red Glows */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[650px] w-[650px] rounded-full bg-brand-red/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-[550px] w-[550px] rounded-full bg-brand-red/15 blur-[140px]" />

      {/* Mot géant Typographique Awwwards */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { x: wordX, y: wordY }}
        className="pointer-events-none absolute inset-x-0 top-[52%] z-0 select-none text-center font-display text-[27vw] font-extrabold leading-none tracking-tighter lg:top-[10%] lg:text-[21vw]"
      >
        <span
          className="bg-gradient-to-b from-white/[0.12] via-white/[0.03] to-transparent bg-clip-text text-transparent opacity-80"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.06)" }}
        >
          APSONIC
        </span>
      </motion.div>

      {/* Grain & Overlay Vignette */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 mx-auto grid w-full max-w-[90rem] flex-1 grid-cols-1 items-center gap-12 px-6 py-8 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:py-12">
        {/* COLONNE TEXTE ÉDITORIALE */}
        <div className="min-w-0 text-center lg:text-left">
          {/* Badge Supérieur */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              Bénin · Motos & Componentry
            </span>
          </motion.div>

          {/* Grand Titre Éditorial avec Mask Reveal */}
          <h1 className="mt-6 font-display text-5xl font-extralight uppercase leading-[0.92] tracking-tight text-white sm:text-7xl md:text-8xl xl:text-[5.75rem] 2xl:text-[6.5rem]">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                variants={lineReveal}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                OSONS <span className="font-serif italic font-normal text-brand-red">OSER,</span>
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                variants={lineReveal}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                ROULER <span className="underline decoration-brand-red/50 underline-offset-8">AUTREMENT</span>
              </motion.span>
            </span>
          </h1>

          {/* Paragraphe descriptif */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mx-auto mt-7 max-w-xl font-sans text-base leading-relaxed text-neutral-400 md:text-lg lg:mx-0"
          >
            L'excellence motocycle au Bénin. Sélection exclusive de motos, tricycles d'ingénierie, pièces d'origine certifiées et lubrifiants haute performance.
          </motion.p>

          {/* Boutons CTA Style Awwwards */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-10 flex flex-col items-center gap-5 sm:flex-row lg:justify-start"
          >
            <Link
              href="/motos"
              className="group relative inline-flex h-14 w-full items-center justify-between gap-8 overflow-hidden rounded-full bg-brand-red pl-8 pr-3 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-2xl shadow-brand-red/30 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/50 sm:w-auto"
            >
              <span className="relative z-10">Explorer le catalogue</span>
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform duration-500 group-hover:rotate-45 group-hover:bg-brand-red">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>

            <Link
              href="/pro"
              className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-8 font-mono text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-500 hover:border-white hover:bg-white/10 sm:w-auto"
            >
              <Sparkles className="h-4 w-4 text-brand-red" />
              Espace Partner B2B
            </Link>
          </motion.div>

          {/* Stats Bar Awwwards HUD */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={6}
            className="mx-auto mt-12 flex w-full max-w-md items-stretch justify-between divide-x divide-white/10 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl md:w-fit md:gap-10 md:px-8 lg:mx-0"
          >
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-1 flex-col items-center justify-center px-2 text-center md:flex-row md:justify-start md:gap-4 md:px-0 md:text-left"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-red/20 bg-brand-red/10 text-brand-red md:mb-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-light text-white md:text-2xl">
                      {s.value}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 md:text-[10px]">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* COLONNE VISUELLE (SHOWCASE MOTO) */}
        <motion.div
          initial={{ opacity: 0, x: 70, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="relative mx-auto w-full min-w-0 max-w-[46rem] lg:ml-auto lg:max-w-none"
        >
          {/* Halos lumineux réactifs */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-[48%] rounded-full bg-brand-red/20 blur-[130px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[50%] w-[60%] -translate-x-1/2 -translate-y-[40%] rounded-full bg-white/[0.08] blur-[90px]" />

          <motion.div style={reduce ? undefined : { y: bikeScrollY }}>
            <motion.div
              style={reduce ? undefined : { x: bikeX, y: bikeY }}
              className="relative aspect-[1200/840] w-full"
            >
              <BikeStack active={active} />

              {/* Ombre portée réaliste au sol */}
              <div className="pointer-events-none absolute -bottom-2 left-[8%] right-[8%] h-7 rounded-full bg-black/90 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-px left-[4%] right-[4%] h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              {/* Reflet miroir inversé au sol */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-full h-[40%] overflow-hidden opacity-40 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.8),transparent)]"
              >
                <div className="absolute inset-x-0 top-0 h-[260%] [transform:scaleY(-1)]">
                  <BikeStack active={active} decorative />
                </div>
              </div>

              {/* Tag Modèle High-End */}
              <div className="absolute right-2 top-2 z-20 flex items-center gap-2.5 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-neutral-300 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-brand-red" />
                APSONIC AP150TS
              </div>
            </motion.div>
          </motion.div>

          {/* SÉLECTEUR DE COLORIS TYPE HUD TECH */}
          <div className="relative z-20 mt-8 flex flex-col items-center gap-5 lg:mt-10">
            <div className="flex items-center gap-6 rounded-full border border-white/10 bg-neutral-900/60 px-6 py-3 backdrop-blur-xl">
              <div role="group" aria-label="Choisir le coloris" className="flex items-center gap-3">
                {COLORWAYS.map((c, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => choose(i)}
                      aria-label={`Coloris ${c.name}`}
                      aria-pressed={isActive}
                      className="group relative h-8 w-8 rounded-full p-[3px] outline-none transition-transform duration-300 hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-red"
                    >
                      <span
                        className={`absolute inset-0 rounded-full border transition duration-500 ${
                          isActive
                            ? "scale-100 border-brand-red"
                            : "scale-90 border-white/20 group-hover:border-white/50"
                        }`}
                      />
                      <span
                        className="block h-full w-full rounded-full shadow-inner ring-1 ring-white/20"
                        style={{ background: c.swatch }}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="h-4 w-px bg-white/15" />

              {/* Indicateur texte du coloris */}
              <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-widest text-neutral-300">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {COLORWAYS[active].name}
                  </motion.span>
                </AnimatePresence>
                <span className="text-neutral-500">0{active + 1}/03</span>
              </div>
            </div>

            {/* Badge de certification de qualité */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={9}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="font-mono text-xs text-neutral-300">
                Véhicule certifié d'origine · Garantie 1 an constructeur
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* BANDEAU MARQUEES / PARTENAIRES */}
      <div className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[90rem] items-center gap-8 px-6 py-5 md:gap-12 md:px-10">
          <p className="hidden shrink-0 font-mono text-xs uppercase tracking-[0.3em] text-neutral-500 md:block">
            Partenaires Officiels
          </p>

          <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <motion.div
              className="flex w-max"
              animate={reduce ? undefined : { x: ["0%", "-50%"] }}
              transition={{ duration: 35, ease: "linear", repeat: Infinity }}
            >
              {[0, 1].map((half) => (
                <div
                  key={half}
                  aria-hidden={half === 1 || undefined}
                  className="flex shrink-0 items-center gap-16 pr-16 md:gap-24 md:pr-24"
                >
                  {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
                    <span
                      key={`${half}-${b}-${i}`}
                      className="shrink-0 font-display text-sm font-light tracking-[0.25em] text-neutral-400 transition-colors duration-300 hover:text-white md:text-base"
                    >
                      {b.toUpperCase()}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}