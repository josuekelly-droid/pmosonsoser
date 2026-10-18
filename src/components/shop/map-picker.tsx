"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { DELIVERY_ORIGIN, type DeliveryPoint } from "@/lib/delivery";

type Props = {
  subtotal: number;
  onDeliveryChangeAction: (result: DeliveryPoint | null) => void;
};

export function MapPicker({ subtotal, onDeliveryChangeAction }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeliveryPoint | null>(null);

  /* ------- Init Leaflet (chargé côté client uniquement) ------- */
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // CSS Leaflet injecté dynamiquement
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [DELIVERY_ORIGIN.lat, DELIVERY_ORIGIN.lng],
        zoom: 13,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // Marqueur boutique (origine)
      L.circleMarker([DELIVERY_ORIGIN.lat, DELIVERY_ORIGIN.lng], {
        radius: 8,
        color: "#E30613",
        fillColor: "#E30613",
        fillOpacity: 1,
        weight: 3,
      })
        .addTo(map)
        .bindPopup(`<b>${DELIVERY_ORIGIN.label}</b>`);

      // Icône personnalisée pour le marqueur client
      L.Marker.prototype.options.icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // Gestion du clic
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lng]).addTo(map);
        await computeDistance(lat, lng);
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------- Calcul distance via API interne ------- */
  async function computeDistance(lat: number, lng: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/distance?lat=${lat}&lng=${lng}&subtotal=${subtotal}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de calcul");
      }

      const deliveryResult: DeliveryPoint = {
        coords: { lat, lng },
        address: data.address || "Position sélectionnée",
        distanceKm: data.distanceKm,
        fee: data.fee,
      };

      setResult(deliveryResult);
      onDeliveryChangeAction(deliveryResult);

      if (markerRef.current) {
        markerRef.current
          .bindPopup(
            `<b>Livraison</b><br/>${data.distanceKm} km<br/><b>${formatPrice(
              data.fee
            )}</b>`
          )
          .openPopup();
      }
    } catch (err: any) {
      setError(err.message || "Impossible de calculer la distance");
      setResult(null);
      onDeliveryChangeAction(null);
    } finally {
      setLoading(false);
    }
  }

  /* ------- Géolocalisation navigateur ------- */
  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const L = (await import("leaflet")).default;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);

        await computeDistance(lat, lng);
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === 1
            ? "Autorisation refusée. Autorisez la localisation ou cliquez sur la carte."
            : "Impossible d'obtenir votre position"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      {/* Carte */}
      <div className="relative">
        <div
          ref={mapRef}
          className="h-72 w-full overflow-hidden rounded-2xl border border-brand-black/10 bg-brand-gray md:h-80"
          style={{ zIndex: 0 }}
        />

        {/* Bouton GPS flottant */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={loading}
          className="absolute right-3 top-3 z-[400] inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-brand-black shadow-lg transition hover:bg-brand-red hover:text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Navigation className="h-3.5 w-3.5" />
          )}
          Ma position
        </button>

        {/* Overlay instruction initiale */}
        {!result && !loading && !error && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-[400] -translate-x-1/2 rounded-full bg-brand-black/85 px-4 py-2 text-xs text-white backdrop-blur-sm">
            📍 Cliquez sur la carte pour indiquer votre position
          </div>
        )}
      </div>

      {/* Feedback erreur */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="rounded-2xl border border-brand-red/20 bg-brand-red/5 p-4 transition">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-black">
                Position confirmée
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-black/60">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{result.address}</span>
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-brand-red/10 pt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-black/50">
                    Distance
                  </p>
                  <p className="font-display text-lg text-brand-black">
                    {result.distanceKm.toFixed(1)} km
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-brand-black/50">
                    Frais
                  </p>
                  <p
                    className={cn(
                      "font-display text-lg",
                      result.fee === 0 ? "text-green-700" : "text-brand-red"
                    )}
                  >
                    {result.fee === 0 ? "Offerte" : formatPrice(result.fee)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}