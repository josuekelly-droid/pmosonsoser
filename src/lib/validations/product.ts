import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nom requis").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  priceB2C: z.coerce.number().min(0, "Prix invalide"),
  priceB2B: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock invalide"),
  images: z.array(z.string().url("URL d'image invalide")).max(10).default([]),
  categoryId: z.string().min(1, "Catégorie requise"),
  brandId: z.string().min(1, "Marque requise"),
});

export type ProductInput = z.infer<typeof productSchema>;