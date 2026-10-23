import { NextResponse } from "next/server";
import {
  DELIVERY_ORIGIN,
  DELIVERY_PRICING_DEFAULTS,
  calculateDeliveryFee,
  haversineDistance,
  type DeliveryPricing,
} from "@/lib/delivery";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const subtotal = Number(searchParams.get("subtotal") || 0);

  // 🛡️ Validation robuste des coordonnées
  if (!latParam || !lngParam) {
    return NextResponse.json({ error: "Coordonnées manquantes" }, { status: 400 });
  }

  const lat = Number(latParam);
  const lng = Number(lngParam);

  if (
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }

  // 🛡️ Récupération des paramètres admin
  let pricing: DeliveryPricing = { ...DELIVERY_PRICING_DEFAULTS };
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    if (settings) {
      pricing = {
        baseFee: settings.baseFee,
        pricePerKm: settings.pricePerKm,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        maxRadiusKm: settings.maxRadiusKm,
        maxFee: settings.maxDeliveryFee,
        minDistanceKm: DELIVERY_PRICING_DEFAULTS.minDistanceKm,
      };
    }
  } catch (err) {
    console.warn("[distance] Settings unavailable, using defaults", err);
  }

  // Vérifier rayon max (Haversine = vol d'oiseau)
  const straightDistance = haversineDistance(
    DELIVERY_ORIGIN.lat,
    DELIVERY_ORIGIN.lng,
    lat,
    lng
  );

  if (straightDistance > pricing.maxRadiusKm) {
    return NextResponse.json(
      {
        error: `Position en dehors de notre zone de livraison (${pricing.maxRadiusKm} km max)`,
      },
      { status: 400 }
    );
  }

  let distanceKm = straightDistance;
  let address = "Position sélectionnée";

  // Calcul via OpenRouteService
  const ORS_API_KEY = process.env.ORS_API_KEY;
  if (ORS_API_KEY) {
    try {
      const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${DELIVERY_ORIGIN.lng},${DELIVERY_ORIGIN.lat}&end=${lng},${lat}`;
      const res = await fetch(orsUrl, { next: { revalidate: 0 } });
      if (res.ok) {
        const data = await res.json();
        const meters = data?.features?.[0]?.properties?.segments?.[0]?.distance;
        if (typeof meters === "number" && meters > 0) {
          distanceKm = meters / 1000;
        }
      }
    } catch (err) {
      console.warn("[distance] ORS failed, fallback to haversine", err);
    }
  }

  // Reverse geocoding
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`,
      {
        headers: {
          "User-Agent": "PM-Osons-Oser/1.0 (contact@pmosonsoser.com)",
        },
      }
    );
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (nomData?.display_name) {
        address = nomData.display_name.split(",").slice(0, 3).join(",").trim();
      }
    }
  } catch (err) {
    console.warn("[distance] Nominatim failed", err);
  }

  const fee = calculateDeliveryFee(distanceKm, subtotal, pricing);

  return NextResponse.json({
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    address,
    fee,
    pricing: {
      baseFee: pricing.baseFee,
      pricePerKm: pricing.pricePerKm,
      maxFee: pricing.maxFee,
      freeDeliveryThreshold: pricing.freeDeliveryThreshold,
    },
  });
}