import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string().min(1, "ID produit requis"),
  quantity: z.coerce.number().int().min(1, "Quantité min 1").max(99, "Quantité max 99"),
  // 🚨 AUCUN CHAMP "price" ICI. Le serveur utilise la BDD.
});

export const orderSchema = z.object({
  // Coordonnées client
  customerName: z.string().min(2, "Nom requis").max(100),
  customerEmail: z.string().email("Email invalide").max(150),
  telephone: z
    .string()
    .min(8, "Numéro invalide")
    .max(20)
    .regex(/^[+\d\s\-()]+$/, "Format de téléphone invalide"),

  // Adresse + coordonnées GPS
  adresseLivraison: z.string().min(5, "Adresse trop courte").max(300),
  deliveryLat: z.coerce.number().min(-90).max(90),
  deliveryLng: z.coerce.number().min(-180).max(180),
  deliveryDistance: z.coerce.number().min(0).max(500),

  // Optionnels
  notes: z.string().max(500).optional().or(z.literal("")),

  // Paiement
  methodePaiement: z.enum(["FEDAPAY", "WESTERN_UNION", "VIREMENT"]),

  // Items
  items: z.array(orderItemSchema).min(1, "Panier vide").max(50, "Trop d'articles"),

  // Anti double-clic
  idempotencyKey: z.string().min(8).max(100),
});

export type OrderInput = z.infer<typeof orderSchema>;