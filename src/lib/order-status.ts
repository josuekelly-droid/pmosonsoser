export const ORDER_STATUSES = [
  "EN_ATTENTE",
  "PAYE",
  "EXPEDIE",
  "LIVRE",
  "ANNULE",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  EXPEDIE: "Expédié",
  LIVRE: "Livré",
  ANNULE: "Annulé",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  EN_ATTENTE: "bg-amber-100 text-amber-700",
  PAYE: "bg-blue-100 text-blue-700",
  EXPEDIE: "bg-purple-100 text-purple-700",
  LIVRE: "bg-green-100 text-green-700",
  ANNULE: "bg-red-100 text-red-700",
};

/**
 * Transitions autorisées depuis chaque statut
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  EN_ATTENTE: ["PAYE", "ANNULE"],
  PAYE: ["EXPEDIE", "ANNULE"],
  EXPEDIE: ["LIVRE", "ANNULE"],
  LIVRE: [], // aucune transition sortante
  ANNULE: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Une annulation doit-elle remettre le stock ? (uniquement si la commande
 * n'a pas encore été expédiée)
 */
export function shouldRestock(from: OrderStatus): boolean {
  return from === "EN_ATTENTE" || from === "PAYE";
}