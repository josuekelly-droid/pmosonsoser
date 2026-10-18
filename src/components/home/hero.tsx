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
import { ArrowRight, ShieldCheck, Truck, Award, CheckCircle2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Données                                                                   */
/* -------------------------------------------------------------------------- */

const BRANDS = ["Apsonic", "Honda", "TVS", "Haojue", "Dayang"];

const STATS = [
  { value: "60+", label: "Modèles", icon: Award },
  { value: "48h", label: "Livraison", icon: Truck },
  { value: "100%", label: "Garanti", icon: ShieldCheck },
];

// Les 3 images ont exactement le même cadrage (1200 × 840, fond transparent) :
// on peut donc les superposer et changer de coloris sans aucun saut.
const COLORWAYS = [
  { id: "grey", name: "Mech Grey", src: "/categories/ap150ts-grey.webp", swatch: "#8f959e" },
  { id: "black", name: "Gloss Black", src: "/categories/ap150ts-black.webp", swatch: "#0d0d0f" },
  { id: "white", name: "Pearl White", src: "/categories/ap150ts-white.webp", swatch: "#eceef2" },
] as const;

const DEFAULT_INDEX = 1; // Gloss Black
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Grain de film très léger, pour casser l'aspect "plat" des dégradés.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

/* -------------------------------------------------------------------------- */
/*  Animations                                                                */
/* -------------------------------------------------------------------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: EASE },
  }),
};

// Chaque ligne du titre "monte" depuis un masque.
const lineReveal: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { delay: 0.2 + i * 0.12, duration: 0.95, ease: EASE },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Pile d'images : les 3 coloris sont montés, un seul est visible             */
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
              x: isActive ? 0 : i < active ? -48 : 48,
              scale: isActive ? 1 : 0.97,
            }}
            transition={{ duration: 0.8, ease: EASE }}
            className="absolute inset-0"
          >
            <Image
              src={c.src}
              alt={decorative ? "" : `Apsonic AP150TS, coloris ${c.name}`}
              aria-hidden={decorative || undefined}
              fill
              sizes="(max-width: 1024px) 100vw, 720px"
              priority={!decorative && i === DEFAULT_INDEX}
              // object-contain : l'image s'affiche TOUJOURS en entier, jamais rognée
              className="select-none object-contain"
              draggable={false}
            />
          </motion.div>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const [active, setActive] = useState(DEFAULT_INDEX);
  const [auto, setAuto] = useState(true);

  // Rotation douce des coloris, qui s'arrête dès que le visiteur choisit lui-même.
  useEffect(() => {
    if (!auto || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % COLORWAYS.length), 5500);
    return () => clearInterval(id);
  }, [auto, reduce]);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  // Parallax souris (desktop uniquement) + parallax au scroll
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const bikeX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const bikeY = useTransform(sy, [-0.5, 0.5], [-8, 8]);
  const wordX = useTransform(sx, [-0.5, 0.5], [26, -26]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const wordY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const bikeScrollY = useTransform(scrollYProgress, [0, 1], [0, -70]);

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
      className="relative isolate flex min-h-screen w-full flex-col justify-between overflow-hidden bg-brand-black pt-28 md:pt-32"
    >
      {/* ------------------------------------------------------------------ */}
      {/*  FONDS                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[120px]" />

      {/* Mot géant en filigrane, derrière le scooter */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { x: wordX, y: wordY }}
        className="pointer-events-none absolute inset-x-0 top-[58%] z-0 select-none text-center font-display text-[26vw] leading-none lg:top-[12%] lg:text-[19vw]"
      >
        <span
          className="bg-gradient-to-b from-white/[0.14] via-white/[0.04] to-transparent bg-clip-text text-transparent"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.07)" }}
        >
          APSONIC
        </span>
      </motion.div>

      {/* Vignettage + grain */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      {/* ------------------------------------------------------------------ */}
      {/*  CONTENU                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 mx-auto grid w-full max-w-[88rem] flex-1 grid-cols-1 items-center gap-10 px-4 py-12 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:py-16">
        {/* Colonne texte */}
        <div className="min-w-0 text-center lg:text-left">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
            Motos · Tricycles · Pièces
          </motion.p>

          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl xl:text-[5.5rem] 2xl:text-8xl">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                variants={lineReveal}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                OSONS <span className="text-brand-red">OSER</span>
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                variants={lineReveal}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                ROULER <span className="text-brand-red">AUTREMENT</span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg lg:mx-0"
          >
            Le catalogue premium de motos, tricycles, pièces détachées et lubrifiants au
            Bénin. Qualité certifiée, livraison rapide, paiement Mobile Money.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <Link
              href="/motos"
              className="group relative inline-flex h-14 w-full items-center justify-between gap-6 overflow-hidden rounded-full bg-brand-red pl-8 pr-2 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:shadow-2xl hover:shadow-brand-red/40 sm:w-auto"
            >
              <span className="relative z-10">Découvrir le catalogue</span>
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-black transition-transform duration-500 group-hover:-rotate-45">
                <ArrowRight className="h-4 w-4" />
              </span>
              {/* reflet qui traverse le bouton au survol */}
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 blur-md transition-transform duration-700 group-hover:translate-x-[460%]" />
            </Link>
            <Link
              href="/pro"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              Espace Pro B2B
            </Link>
          </motion.div>

          {/* Barre de stats */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={6}
            className="mx-auto mt-10 flex w-full max-w-md items-stretch justify-between divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] py-4 backdrop-blur-md md:w-fit md:gap-8 md:px-8 lg:mx-0"
          >
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-1 flex-col items-center justify-center px-1 text-center md:flex-row md:justify-start md:gap-3 md:px-0 md:text-left"
                >
                  <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 md:mb-0 md:h-10 md:w-10">
                    <Icon className="h-4 w-4 text-brand-red md:h-5 md:w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg leading-none text-white md:text-xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-[8px] uppercase tracking-widest text-white/50 md:text-[10px]">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Colonne visuel */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
          className="relative mx-auto w-full min-w-0 max-w-[44rem] lg:ml-auto lg:max-w-none"
        >
          {/* halo de couleur derrière le scooter */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-[48%] rounded-full bg-brand-red/25 blur-[110px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[45%] w-[55%] -translate-x-1/2 -translate-y-[40%] rounded-full bg-white/[0.07] blur-[80px]" />

          <motion.div style={reduce ? undefined : { y: bikeScrollY }}>
            <motion.div
              style={reduce ? undefined : { x: bikeX, y: bikeY }}
              className="relative aspect-[1200/840] w-full"
            >
              <BikeStack active={active} />

              {/* ombre de contact + ligne de sol */}
              <div className="pointer-events-none absolute -bottom-1 left-[6%] right-[6%] h-5 rounded-full bg-black/80 blur-xl" />
              <div className="pointer-events-none absolute -bottom-px left-[2%] right-[2%] h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* reflet sur le sol */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-full h-[38%] overflow-hidden opacity-50 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent)]"
              >
                <div className="absolute inset-x-0 top-0 h-[263%] [transform:scaleY(-1)]">
                  <BikeStack active={active} decorative />
                </div>
              </div>

              {/* pastille modèle + coloris */}
              <div className="absolute right-0 top-0 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-brand-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md sm:right-2 sm:top-2 sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                AP150TS
              </div>
            </motion.div>
          </motion.div>

          {/* sélecteur de coloris */}
          <div className="relative z-20 mt-6 flex flex-col items-center gap-4 lg:mt-8">
            <div className="flex items-center gap-4">
              <div role="group" aria-label="Choisir le coloris" className="flex items-center gap-2">
                {COLORWAYS.map((c, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => choose(i)}
                      aria-label={`Coloris ${c.name}`}
                      aria-pressed={isActive}
                      className="group relative h-9 w-9 rounded-full p-[5px] outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                    >
                      <span
                        className={`absolute inset-0 rounded-full border transition duration-300 ${
                          isActive
                            ? "scale-100 border-white/80"
                            : "scale-90 border-white/15 group-hover:border-white/40"
                        }`}
                      />
                      <span
                        className="block h-full w-full rounded-full ring-1 ring-white/15"
                        style={{ background: c.swatch }}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="h-5 w-px bg-white/15" />

              <div className="flex min-w-[9.5rem] items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/70">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {COLORWAYS[active].name}
                  </motion.span>
                </AnimatePresence>
                <span className="text-white/30">0{active + 1}/03</span>
              </div>
            </div>

            {/* badge certification */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={9}
              className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-brand-black/70 p-3 backdrop-blur-md sm:p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Produits certifiés</p>
                <p className="text-xs text-white/60">Qualité garantie · Livraison 48h</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  BANDEAU MARQUES (défilement continu)                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-[88rem] items-center gap-8 px-4 py-5 md:gap-12 md:px-8">
          <p className="hidden shrink-0 text-xs font-semibold uppercase tracking-widest text-white/30 md:block">
            Nos marques
          </p>
          <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
              className="flex w-max"
              animate={reduce ? undefined : { x: ["0%", "-50%"] }}
              transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            >
              {[0, 1].map((half) => (
                <div
                  key={half}
                  aria-hidden={half === 1 || undefined}
                  className="flex shrink-0 items-center gap-12 pr-12 md:gap-20 md:pr-20"
                >
                  {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
                    <span
                      key={`${half}-${b}-${i}`}
                      className="shrink-0 font-display text-sm tracking-widest text-white/40 transition hover:text-white md:text-lg"
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
