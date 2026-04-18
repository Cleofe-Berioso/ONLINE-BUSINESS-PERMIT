"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { EB_MAGALONA, getMarkerColor } from "@/lib/locations";
import "leaflet/dist/leaflet.css";

// Define types directly to avoid Prisma import issues
interface BusinessLocation {
  id: string;
  applicationId: string;
  latitude: number;
  longitude: number;
  label: string | null;
  businessType: string | null;
  markerColor: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BusinessMapContentProps {
  locations: (BusinessLocation & {
    application?: { businessName?: string };
  })[];
}

export function BusinessMapContent({ locations }: BusinessMapContentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Only initialize once
    if (mapInstanceRef.current || !mapRef.current) {
      return;
    }

    // Create map instance manually to avoid react-leaflet double-initialization
    const mapInstance = L.map(mapRef.current).setView(
      [EB_MAGALONA.center.lat, EB_MAGALONA.center.lon],
      EB_MAGALONA.zoom
    );

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    mapInstanceRef.current = mapInstance;

    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach((marker) => {
        mapInstance.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, []); // Empty dependency array - initialize once only

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    const mapInstance = mapInstanceRef.current;

    // Remove old markers
    markersRef.current.forEach((marker) => {
      mapInstance.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const color = getMarkerColor(location.businessType);

      // Create custom marker using divIcon
      const marker = L.marker([location.latitude, location.longitude], {
        icon: L.divIcon({
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
          className: "leaflet-custom-marker",
        }),
      });

      // Add popup content
      const popupContent = `
        <div style="font-size: 12px; line-height: 1.4;">
          <p style="font-weight: 600; margin: 0 0 4px 0;">
            ${location.label || location.application?.businessName || "Location"}
          </p>
          ${
            location.businessType
              ? `<p style="color: #666; margin: 0 0 4px 0;">${location.businessType}</p>`
              : ""
          }
          <p style="color: #888; margin: 0; font-family: monospace;">
            ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(mapInstance);
      markersRef.current.push(marker);
    });
  }, [locations]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "0.5rem",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}
    />
  );
}
