import { NextResponse } from "next/server";
import {
  DELIVERY_ORIGIN,
  DELIVERY_PRICING,
  calculateDeliveryFee,
  haversineDistance,
} from "@/lib/delivery";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const subtotal = Number(searchParams.get("subtotal") || 0);

  if (!lat || !lng || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "Coordonnées invalides" },
      { status: 400 }
    );
  }

  // Vérifier rayon max
  const straightDistance = haversineDistance(
    DELIVERY_ORIGIN.lat,
    DELIVERY_ORIGIN.lng,
    lat,
    lng
  );

  if (straightDistance > DELIVERY_PRICING.maxRadiusKm) {
    return NextResponse.json(
      {
        error: `Position en dehors de notre zone de livraison (${DELIVERY_PRICING.maxRadiusKm} km max)`,
      },
      { status: 400 }
    );
  }

  let distanceKm = straightDistance;
  let address = "Position sélectionnée";

  /* ---- Calcul via OpenRouteService (route réelle) ---- */
  const ORS_API_KEY = process.env.ORS_API_KEY;
  if (ORS_API_KEY) {
    try {
      const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${DELIVERY_ORIGIN.lng},${DELIVERY_ORIGIN.lat}&end=${lng},${lat}`;

      const res = await fetch(orsUrl, {
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const data = await res.json();
        const meters =
          data?.features?.[0]?.properties?.segments?.[0]?.distance;
        if (typeof meters === "number" && meters > 0) {
          distanceKm = meters / 1000;
        }
      }
    } catch (err) {
      console.warn("[distance] ORS failed, fallback to haversine", err);
    }
  }

  /* ---- Reverse geocoding (Nominatim OpenStreetMap) ---- */
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
        // On tronque l'adresse à 80 caractères pour éviter les très longues
        address = nomData.display_name.split(",").slice(0, 3).join(",").trim();
      }
    }
  } catch (err) {
    console.warn("[distance] Nominatim failed", err);
  }

  const fee = calculateDeliveryFee(distanceKm, subtotal);

  return NextResponse.json({
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    address,
    fee,
  });
}