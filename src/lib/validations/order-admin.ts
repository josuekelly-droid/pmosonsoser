import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/order-status";

export const orderStatusUpdateSchema = z.object({
  statut: z.enum(ORDER_STATUSES),
  codeMTCN: z.string().max(50).optional().or(z.literal("")),
  preuvePaiement: z
    .string()
    .url("URL invalide")
    .optional()
    .or(z.literal("")),
  noteInterne: z.string().max(500).optional().or(z.literal("")),
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;