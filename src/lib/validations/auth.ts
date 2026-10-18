import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(100)
  .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Doit contenir au moins un chiffre");

export const registerSchema = z.object({
  name: z.string().min(2, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(150),
  phone: z.string().min(8, "Numéro invalide").max(20).regex(/^[+\d\s\-()]+$/, "Format de téléphone invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  typeCompte: z.enum(["B2C", "B2B"]).default("B2C"),
  website: z.string().optional(), // 🍯 Honeypot
});


export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  website: z.string().optional(), // 🍯 Honeypot
});

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code doit être composé de chiffres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;