"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Detection {
  id: string;
  disease: string;
  confidence: number;
  severity: string;
  latitude: number;
  longitude: number;
  cropType: string;
  description: string | null;
  createdAt: string | null;
}

interface Outbreak {
  centerLat: number;
  centerLng: number;
  radius: number;
  disease: string;
  severity: string;
  count: number;
  detectionIds: string[];
}

interface Field {
  id: string;
  name: string;
  cropType: string;
  latitude: number;
  longitude: number;
  areaHectares: number | null;
}

interface AgriMapProps {
  detections: Detection[];
  outbreaks: Outbreak[];
  fields: Field[];
  onMapMove?: (bounds: string) => void;
  onSelectDetection?: (detection: Detection) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
};

export default function AgriMap({
  detections,
  outbreaks,
  fields,
  onMapMove,
  onSelectDetection,
}: AgriMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const layersRef = useRef<unknown[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet (client-side only)
    import("leaflet").then((L) => {
      // Fix default markers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [10, 20],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);

      mapInstanceRef.current = map;

      // Map move handler
      if (onMapMove) {
        map.on("moveend", () => {
          const b = map.getBounds();
          const bounds = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
          onMapMove(bounds);
        });
      }
    });

    return () => {
      // cleanup not needed for leaflet map lifecycle in this context
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current as L.Map;

      // Clear existing layers
      layersRef.current.forEach((layer) => {
        map.removeLayer(layer as L.Layer);
      });
      layersRef.current = [];

      // Add field markers (green circles)
      fields.forEach((field) => {
        const marker = L.circleMarker([field.latitude, field.longitude], {
          radius: 8,
          fillColor: "#16a34a",
          fillOpacity: 0.4,
          color: "#15803d",
          weight: 1,
        }).addTo(map);

        marker.bindPopup(
          `<div class="font-sans text-sm">
            <strong class="text-green-700">🌾 ${field.name}</strong><br/>
            <span class="text-gray-600">Crop: ${field.cropType}</span><br/>
            ${field.areaHectares ? `<span class="text-gray-500">Area: ${field.areaHectares} ha</span>` : ""}
          </div>`,
        );

        layersRef.current.push(marker);
      });

      // Add detection markers (colored by severity)
      detections.forEach((det) => {
        const color = SEVERITY_COLORS[det.severity] || "#6b7280";
        const isHealthy = det.disease.toLowerCase() === "healthy";
        const radius = isHealthy ? 4 : det.severity === "critical" ? 10 : det.severity === "high" ? 8 : 6;

        const marker = L.circleMarker([det.latitude, det.longitude], {
          radius,
          fillColor: color,
          fillOpacity: isHealthy ? 0.3 : 0.7,
          color: isHealthy ? "#a3a3a3" : color,
          weight: isHealthy ? 1 : 2,
        }).addTo(map);

        const confPercent = Math.round(det.confidence * 100);
        const dateStr = det.createdAt
          ? new Date(det.createdAt).toLocaleDateString()
          : "Unknown";

        marker.bindPopup(
          `<div class="font-sans text-sm min-w-[200px]">
            <div class="flex items-center gap-2 mb-1">
              <span style="background:${color}" class="inline-block w-3 h-3 rounded-full"></span>
              <strong>${det.disease}</strong>
            </div>
            <div class="text-gray-600 space-y-0.5">
              <div>Confidence: <strong>${confPercent}%</strong></div>
              <div>Severity: <span style="color:${color};font-weight:600">${det.severity.toUpperCase()}</span></div>
              <div>Crop: ${det.cropType}</div>
              <div>Date: ${dateStr}</div>
            </div>
            ${det.description ? `<p class="mt-1 text-xs text-gray-500">${det.description.slice(0, 120)}...</p>` : ""}
          </div>`,
        );

        marker.on("click", () => onSelectDetection?.(det));
        layersRef.current.push(marker);
      });

      // Add outbreak zones (red/orange pulsing circles)
      outbreaks.forEach((outbreak) => {
        const color = SEVERITY_COLORS[outbreak.severity] || "#ef4444";
        const radiusMeters = outbreak.radius * 1000;

        const circle = L.circle([outbreak.centerLat, outbreak.centerLng], {
          radius: radiusMeters,
          fillColor: color,
          fillOpacity: 0.15,
          color: color,
          weight: 2,
          dashArray: "8, 4",
        }).addTo(map);

        circle.bindPopup(
          `<div class="font-sans text-sm">
            <div class="flex items-center gap-2 mb-1">
              <span style="background:${color}" class="inline-block w-3 h-3 rounded-full animate-pulse"></span>
              <strong class="text-red-700">⚠️ Outbreak Zone</strong>
            </div>
            <div class="text-gray-600 space-y-0.5">
              <div>Disease: <strong>${outbreak.disease}</strong></div>
              <div>Severity: <span style="color:${color};font-weight:600">${outbreak.severity.toUpperCase()}</span></div>
              <div>Affected points: ${outbreak.count}</div>
              <div>Radius: ~${outbreak.radius.toFixed(1)} km</div>
            </div>
          </div>`,
        );

        layersRef.current.push(circle);
      });

      // Auto-fit bounds if we have detections
      if (detections.length > 0) {
        const allLats = detections.map((d) => d.latitude);
        const allLngs = detections.map((d) => d.longitude);
        const bounds = L.latLngBounds(
          [Math.min(...allLats), Math.min(...allLngs)],
          [Math.max(...allLats), Math.max(...allLngs)],
        );
        map.fitBounds(bounds.pad(0.2));
      }
    });
  }, [detections, outbreaks, fields, onSelectDetection]);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-emerald-50 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-emerald-700 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="w-full h-full rounded-xl z-0" />
    </>
  );
}
