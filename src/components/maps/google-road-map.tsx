"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";

type MapReport = { id: string; location?: { latitude?: number; longitude?: number }; damage?: { type?: string; severity?: string; description?: string }; status?: string; priority?: { score?: number; classification?: string } };
type GoogleRoadMapProps = { reports: MapReport[]; center?: google.maps.LatLngLiteral };
type MapState = "loading" | "ready" | "error" | "unconfigured";

const severityColors: Record<string, string> = { HIGH: "#b8493f", MEDIUM: "#d3a62a", LOW: "#3e7854" };
const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: -7.2575, lng: 112.7521 };

function markerLabel(status: string, severity: string) { if (status === "RESOLVED") return "✓"; if (severity === "HIGH") return "H"; if (severity === "MEDIUM") return "M"; return "L"; }
function markerColor(status: string, severity: string) { return status === "RESOLVED" ? "#35736b" : severityColors[severity] || severityColors.LOW; }

export function GoogleRoadMap({ reports, center = DEFAULT_CENTER }: GoogleRoadMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const searchElement = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapState, setMapState] = useState<MapState>(() => process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "loading" : "unconfigured");
  const [searchMessage, setSearchMessage] = useState("");

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapElement.current) return;
    let isMounted = true;
    let autocomplete: google.maps.places.Autocomplete | null = null;
    setOptions({ key: apiKey, v: "weekly" });
    Promise.all([importLibrary("maps"), importLibrary("marker"), importLibrary("places")]).then(() => {
      if (!mapElement.current || !isMounted) return;
      const map = new google.maps.Map(mapElement.current, { center, zoom: 13, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, mapId: "jalanin-road-map", styles: [{ elementType: "geometry", stylers: [{ color: "#e8eee7" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#5b6468" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#c8dce0" }] }] });
      mapRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow();
      if (searchElement.current) {
        autocomplete = new google.maps.places.Autocomplete(searchElement.current, { fields: ["geometry", "name", "formatted_address"], types: ["geocode"] });
        autocomplete.bindTo("bounds", map);
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          if (!place?.geometry?.location) { setSearchMessage("Lokasi tidak ditemukan."); return; }
          map.panTo(place.geometry.location);
          map.setZoom(15);
          setSearchMessage(place.formatted_address || place.name || "Lokasi ditemukan");
        });
      }
      if (isMounted) setMapState("ready");
    }).catch(() => { if (isMounted) setMapState("error"); });
    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
      mapRef.current = null;
      infoWindowRef.current = null;
    };
  }, [center]);

  useEffect(() => {
    if (mapState !== "ready" || !mapRef.current || !infoWindowRef.current) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    reports.forEach((report) => {
      const latitude = report.location?.latitude;
      const longitude = report.location?.longitude;
      if (typeof latitude !== "number" || typeof longitude !== "number") return;
      const severity = report.damage?.severity || "LOW";
      const status = report.status || "REPORTED";
      const marker = new google.maps.Marker({ map: mapRef.current, position: { lat: latitude, lng: longitude }, title: `${report.damage?.type || "Kondisi jalan"} · ${severity}`, label: { text: markerLabel(status, severity), color: "#ffffff", fontWeight: "700" }, icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: markerColor(status, severity), fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3, scale: 10 } });
      marker.addListener("click", () => {
        const content = document.createElement("div");
        content.className = "jalanin-map-info";
        const title = document.createElement("strong");
        title.textContent = report.damage?.type || "Kondisi jalan";
        const meta = document.createElement("span");
        meta.textContent = `${severity} · ${status}`;
        const link = document.createElement("a");
        link.href = `/reports/${encodeURIComponent(report.id)}`;
        link.textContent = "Lihat detail";
        content.append(title, meta, link);
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open({ map: mapRef.current, anchor: marker });
      });
      markersRef.current.push(marker);
    });
  }, [mapState, reports]);

  return <div className="relative h-full min-h-120 w-full overflow-hidden rounded-[1.5rem] bg-[#d9e1d8]"><div className="absolute inset-0" ref={mapElement} /><div className="absolute left-4 right-4 top-4 z-10 sm:left-5 sm:right-auto sm:w-80"><label className="sr-only" htmlFor="map-location-search">Cari lokasi</label><input id="map-location-search" ref={searchElement} className="h-11 w-full rounded-full border border-line bg-surface/95 px-4 text-sm text-ink shadow-lg outline-none placeholder:text-muted-ink focus:border-road-blue focus:ring-2 focus:ring-road-blue/20" placeholder="Cari alamat atau tempat" type="search" />{searchMessage && <p className="mt-2 rounded-xl bg-surface/95 px-3 py-2 text-xs text-muted-ink shadow-lg" role="status">{searchMessage}</p>}</div>{mapState === "loading" && <div className="absolute inset-0 z-20 grid place-items-center bg-[#d9e1d8]/80"><span className="rounded-full bg-surface/95 px-4 py-2 text-sm font-bold text-muted-ink shadow-lg" role="status">Memuat peta...</span></div>}{mapState === "error" && <div className="absolute inset-0 z-20 grid place-items-center bg-[#d9e1d8]/90 px-5 text-center"><p className="max-w-sm rounded-2xl border border-danger-red/30 bg-surface p-5 text-sm text-danger-red" role="alert">Google Maps belum dapat dimuat. Periksa API key, billing, dan restriction domain.</p></div>}{mapState === "unconfigured" && <div className="absolute inset-0 z-20 grid place-items-center bg-[#d9e1d8]/90 px-5 text-center"><p className="max-w-sm rounded-2xl bg-surface p-5 text-sm text-muted-ink">Google Maps belum dikonfigurasi di environment ini.</p></div>}<div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-surface/95 px-4 py-2 text-xs font-bold text-muted-ink shadow-sm">{reports.length} laporan</span><span className="rounded-full bg-surface/95 px-4 py-2 text-[11px] text-muted-ink shadow-sm">H tinggi · M sedang · L rendah · ✓ selesai</span></div></div>;
}
