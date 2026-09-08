"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

type MapReport = {
  id: string;
  location?: { latitude?: number; longitude?: number };
  damage?: { type?: string; severity?: string };
  status?: string;
  priority?: { score?: number; classification?: string };
};

type GoogleRoadMapProps = {
  reports: MapReport[];
  center?: google.maps.LatLngLiteral;
};

const severityColors: Record<string, string> = {
  HIGH: "#b8493f",
  MEDIUM: "#d3a62a",
  LOW: "#3e7854",
};

export function GoogleRoadMap({ reports, center = { lat: -7.2575, lng: 112.7521 } }: GoogleRoadMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapElement.current) return;

    setOptions({ key: apiKey, v: "weekly", libraries: ["places"] });
    const markers: google.maps.Marker[] = [];

    Promise.all([importLibrary("maps"), importLibrary("marker")]).then(() => {
      if (!mapElement.current) return;
      const map = new google.maps.Map(mapElement.current, {
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        mapId: "jalanin-road-map",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#e8eee7" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#5b6468" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#c8dce0" }] },
        ],
      });

      const infoWindow = new google.maps.InfoWindow();
      reports.forEach((report) => {
        const latitude = report.location?.latitude;
        const longitude = report.location?.longitude;
        if (typeof latitude !== "number" || typeof longitude !== "number") return;
        const severity = report.damage?.severity || "LOW";
        const marker = new google.maps.Marker({
          map,
          position: { lat: latitude, lng: longitude },
          title: report.damage?.type || "Road report",
          label: { text: "!", color: "#ffffff", fontWeight: "700" },
          icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: severityColors[severity] || severityColors.LOW, fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3, scale: 10 },
        });
        marker.addListener("click", () => {
          infoWindow.setContent(`<div style="font-family: sans-serif; padding: 4px 2px; color: #172026"><strong>${report.damage?.type || "Kondisi jalan"}</strong><br><span>${severity} · ${report.status || "REPORTED"}</span><br><a href="/reports/${report.id}">Lihat detail</a></div>`);
          infoWindow.open({ map, anchor: marker });
        });
        markers.push(marker);
      });
    }).catch(() => undefined);

    return () => markers.forEach((marker) => marker.setMap(null));
  }, [center, reports]);

  return <div className="relative h-full min-h-120 w-full overflow-hidden rounded-[1.5rem] bg-[#d9e1d8]"><div className="absolute inset-0" ref={mapElement} /><span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-surface/95 px-4 py-2 text-xs font-bold text-muted-ink shadow-sm">Google Maps · {reports.length} laporan</span></div>;
}
