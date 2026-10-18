import { z } from "zod";

export const reviewSchema = z.object({
  name: z.string().min(2, "Nom requis (2 caractères min)").max(60),
  role: z.string().max(60).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  text: z
    .string()
    .min(20, "Votre avis doit faire au moins 20 caractères")
    .max(600, "Maximum 600 caractères"),
  honeypot: z.string().max(0, "Spam détecté").optional(), // anti-bot
});

export type ReviewInput = z.infer<typeof reviewSchema>;