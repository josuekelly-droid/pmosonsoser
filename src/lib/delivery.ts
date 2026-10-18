/**
 * Configuration de la livraison PM Osons Oser
 * Calcul basé sur la distance réelle (km) via OpenRouteService
 */

export const DELIVERY_ORIGIN = {
  lat: 6.36536,
  lng: 2.41833,
  label: "PM Osons Oser — Cotonou",
} as const;

export const DELIVERY_PRICING = {
  baseFee: 500, // Frais de base (FCFA)
  pricePerKm: 150, // Prix par km (FCFA)
  freeDeliveryThreshold: 5000_000, // Livraison offerte dès (FCFA)
  maxRadiusKm: 500, // Rayon max de livraison
  minDistanceKm: 0.5, // Distance minimale facturée
} as const;

/**
 * Point de livraison complet (retourné par MapPicker et utilisé au checkout)
 */
export type DeliveryPoint = {
  coords: { lat: number; lng: number };
  address: string;
  distanceKm: number;
  fee: number;
};

/**
 * Calcule les frais de livraison en fonction de la distance et du sous-total
 */
export function calculateDeliveryFee(
  distanceKm: number,
  subtotal: number
): number {
  if (subtotal >= DELIVERY_PRICING.freeDeliveryThreshold) return 0;

  const safeDistance = Math.max(
    DELIVERY_PRICING.minDistanceKm,
    Math.min(distanceKm, DELIVERY_PRICING.maxRadiusKm)
  );

  const fee =
    DELIVERY_PRICING.baseFee + safeDistance * DELIVERY_PRICING.pricePerKm;

  return Math.round(fee);
}

/**
 * Distance en ligne droite (fallback si l'API ORS échoue)
 * Formule de Haversine
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}