import { z } from "zod";

export const colorSchema = z.object({
  name: z.string().min(2, "Nom requis").max(40),
  hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format hexadécimal invalide (ex: #FF0000)"),
});

export type ColorInput = z.infer<typeof colorSchema>;