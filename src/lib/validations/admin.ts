import { z } from "zod";

/* =========================================================
   Helper : accepte "" OU string valide, sinon rejette
   ========================================================= */
const optionalString = (max = 200) =>
  z.string().max(max).optional().or(z.literal(""));

/**
 * Accepte :
 *  - "" → OK (champ vide)
 *  - URL valide avec protocole → OK
 *  - URL sans protocole → ajoute https:// automatiquement
 */
const optionalUrl = () =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => {
      if (!v) return "";
      const trimmed = v.trim();
      if (!trimmed) return "";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    })
    .pipe(
      z
        .string()
        .refine(
          (v) => !v || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v),
          "URL invalide (ex: https://facebook.com/pmosonsoser)"
        )
    );

/**
 * Accepte :
 *  - "" → OK
 *  - email valide → OK
 */
const optionalEmail = () =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.trim() : ""))
    .pipe(
      z
        .string()
        .refine(
          (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
          "Email invalide"
        )
    );

/**
 * Nombre coerce qui accepte "" comme 0
 */
const numberField = (min = 0, max = 999999999) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => {
      if (v === "" || v === null || v === undefined) return 0;
      const n = typeof v === "string" ? Number(v) : v;
      return Number.isFinite(n) ? n : 0;
    })
    .pipe(z.number().min(min, `Minimum ${min}`).max(max));

/* =========================================================
   Utilisateurs
   ========================================================= */
export const userUpdateSchema = z.object({
  role: z.enum(["CLIENT", "ADMIN"]).optional(),
  statutValidation: z.enum(["EN_ATTENTE", "VALIDE", "REJETE"]).optional(),
  typeCompte: z.enum(["B2C", "B2B", "PREMIUM"]).optional(),
});

/* =========================================================
   Avis
   ========================================================= */
export const reviewUpdateSchema = z.object({
  isApproved: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

/* =========================================================
   Paramètres
   ========================================================= */
export const settingsSchema = z.object({
  // Contact
  phone: optionalString(30),
  email: optionalEmail(),
  address: optionalString(200),
  // Réseaux
  facebook: optionalUrl(),
  instagram: optionalUrl(),
  whatsapp: optionalString(30),
  // Livraison
  baseFee: numberField(0, 100_000_000),
  pricePerKm: numberField(0, 100_000_000),
  freeDeliveryThreshold: numberField(0, 1_000_000_000),
  maxRadiusKm: numberField(1, 1000),
  maxDeliveryFee: numberField(0, 1_000_000),
  // Paiement
  bankName: optionalString(100),
  bankIban: optionalString(60),
  bankHolder: optionalString(100),
  wuFirstName: optionalString(60),
  wuLastName: optionalString(60),
  wuCity: optionalString(60),
  wuCountry: optionalString(60),
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ReviewUpdate = z.infer<typeof reviewUpdateSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;