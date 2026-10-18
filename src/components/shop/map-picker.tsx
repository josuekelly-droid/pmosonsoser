"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Sparkles,
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

      // Inject Leaflet CSS
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
        zoomControl: false, // On désactive pour un design plus épuré
      });

      // Tuiles OSM avec filtre dark appliqué via CSS
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
        className: "map-tiles-dark",
      }).addTo(map);

      // Marqueur boutique (origine)
      L.circleMarker([DELIVERY_ORIGIN.lat, DELIVERY_ORIGIN.lng], {
        radius: 8,
        color: "#EF4444",
        fillColor: "#EF4444",
        fillOpacity: 1,
        weight: 3,
      })
        .addTo(map)
        .bindPopup(`<b style="font-family: sans-serif; font-size: 12px;">${DELIVERY_ORIGIN.label}</b>`);

      // Icône personnalisée client
      L.Marker.prototype.options.icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // Clic carte
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

  /* ------- Calcul distance via API ------- */
  async function computeDistance(lat: number, lng: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/distance?lat=${lat}&lng=${lng}&subtotal=${subtotal}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de calcul de distance.");
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
            `<div style="font-family: sans-serif; font-size: 11px;"><b>Livraison</b><br/>${data.distanceKm} km · <b>${formatPrice(data.fee)}</b></div>`
          )
          .openPopup();
      }
    } catch (err: any) {
      setError(err.message || "Impossible de calculer la distance.");
      setResult(null);
      onDeliveryChangeAction(null);
    } finally {
      setLoading(false);
    }
  }

  /* ------- Géolocalisation GPS ------- */
  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
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
            ? "Autorisation refusée. Cliquez directement sur la carte pour vous positionner."
            : "Impossible d'obtenir votre position actuelle."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-4">
      {/* Conteneur de la Carte */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/60 p-2 backdrop-blur-xl">
        <style jsx global>{`
          .map-tiles-dark {
            filter: brightness(0.6) invert(1) contrast(1.2) hue-rotate(200deg) saturate(0.3);
          }
        `}</style>

        <div
          ref={mapRef}
          className="h-72 w-full overflow-hidden rounded-[1.5rem] bg-neutral-950 md:h-80"
          style={{ zIndex: 0 }}
        />

        {/* Bouton GPS flottant */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={loading}
          className="group absolute right-5 top-5 z-[400] inline-flex items-center gap-2 rounded-full border border-white/15 bg-neutral-950/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-brand-red hover:bg-brand-red disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
          ) : (
            <Navigation className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
          )}
          <span>Ma position</span>
        </button>

        {/* Instruction overlay */}
        {!result && !loading && !error && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-[400] -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-5 py-2 font-mono text-[11px] uppercase tracking-widest text-neutral-300 backdrop-blur-md">
            Cliquez sur la carte pour définir votre point de livraison
          </div>
        )}
      </div>

      {/* Alerte Erreur */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-mono text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Résultat / Position Confirmée */}
      {result && (
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-red/30 bg-neutral-900/60 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">
                [ Localisation Confirmée ]
              </span>
              <p className="mt-1 flex items-center gap-2 font-sans text-sm text-neutral-300">
                <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate">{result.address}</span>
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 font-mono">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Distance Estimée
                  </p>
                  <p className="font-display text-xl font-light text-white">
                    {result.distanceKm.toFixed(1)} km
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Frais de Livraison
                  </p>
                  <p
                    className={cn(
                      "font-display text-xl font-light",
                      result.fee === 0 ? "text-emerald-400" : "text-brand-red"
                    )}
                  >
                    {result.fee === 0 ? "Offerts" : formatPrice(result.fee)}
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