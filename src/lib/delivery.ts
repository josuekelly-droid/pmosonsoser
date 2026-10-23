/**
 * Configuration de la livraison PM Osons Oser
 * Calcul basé sur la distance réelle (km) via OpenRouteService
 * Rayon max : 850 km (tout le Bénin)
 * Plafond frais : 40 000 FCFA
 */

export const DELIVERY_ORIGIN = {
  lat: 6.36536,
  lng: 2.41833,
  label: "PM Osons Oser — Cotonou",
} as const;

/**
 * Valeurs par défaut (si la table Settings est inaccessible)
 */
export const DELIVERY_PRICING_DEFAULTS = {
  baseFee: 500,
  pricePerKm: 150,
  freeDeliveryThreshold: 5000_000,  
  maxRadiusKm: 850,                // 850 km (Bénin entier)
  maxFee: 40_000,                  
  minDistanceKm: 0.5,
} as const;

/**
 * Point de livraison complet
 */
export type DeliveryPoint = {
  coords: { lat: number; lng: number };
  address: string;
  distanceKm: number;
  fee: number;
};

/**
 * Paramètres de tarification
 */
export type DeliveryPricing = {
  baseFee: number;
  pricePerKm: number;
  freeDeliveryThreshold: number;
  maxRadiusKm: number;
  maxFee: number;
  minDistanceKm?: number;
};

/**
 * Calcule les frais de livraison
 * - Distance × prix au km + frais de base
 * - Plafonné à `maxFee`
 * - Gratuit si le sous-total dépasse `freeDeliveryThreshold`
 */
export function calculateDeliveryFee(
  distanceKm: number,
  subtotal: number,
  pricing: DeliveryPricing = DELIVERY_PRICING_DEFAULTS
): number {
  // Livraison offerte si le sous-total dépasse le seuil
  if (subtotal >= pricing.freeDeliveryThreshold) return 0;

  const minDistance = pricing.minDistanceKm ?? 0.5;

  // Clamp la distance dans [minDistance, maxRadiusKm]
  const safeDistance = Math.max(
    minDistance,
    Math.min(distanceKm, pricing.maxRadiusKm)
  );

  // Calcul brut
  const rawFee = pricing.baseFee + safeDistance * pricing.pricePerKm;

  // Application du plafond
  const finalFee = Math.min(rawFee, pricing.maxFee);

  return Math.round(finalFee);
}

/**
 * Distance en ligne droite (Haversine)
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}