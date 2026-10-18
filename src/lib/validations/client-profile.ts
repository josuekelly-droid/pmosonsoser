import { z } from "zod";

export const profileUpdateSchema = z
  .object({
    name: z.string().min(2, "Nom requis").max(100),
    phone: z
      .string()
      .min(8, "Numéro invalide")
      .max(20)
      .regex(/^[+\d\s\-()]+$/, "Format de téléphone invalide")
      .optional()
      .or(z.literal("")),
    
    // Champs pour le mot de passe (optionnels)
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit faire au moins 8 caractères")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Si l'utilisateur veut changer de mot de passe, il DOIT fournir l'ancien
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Le mot de passe actuel est requis pour en définir un nouveau.",
      path: ["currentPassword"], // L'erreur s'affichera sur ce champ
    }
  );

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;