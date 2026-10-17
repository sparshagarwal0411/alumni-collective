import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile } from "@/lib/mockData";

export const KNOWN_COORDINATES: Record<string, [number, number]> = {
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  delhi: [28.6139, 77.209],
  "new delhi": [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  hyderabad: [17.385, 78.4867],
  pune: [18.5204, 73.8567],
  chennai: [13.0827, 80.2707],
  sanfrancisco: [37.7749, -122.4194],
  "san francisco": [37.7749, -122.4194],
  cupertino: [37.323, -122.0322],
  london: [51.5074, -0.1278],
  oxford: [51.752, -1.2577],
  zurich: [47.3769, 8.5417],
  berlin: [52.52, 13.405],
  singapore: [1.3521, 103.8198],
  "new york": [40.7128, -74.006],
  chicago: [41.8781, -87.6298],
};

interface LocationPoint {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  people: Profile[];
}

interface AlumniDirectoryMapProps {
  people: Profile[];
  selectedCity?: string | null;
  onSelectCity?: (city: string | null) => void;
  className?: string;
}

function parseLocation(value: string | null) {
  const [city = "Unknown", country = "Global"] = (value ?? "Unknown").split(",").map((part) => part.trim());
  return { city, country };
}

function locationCoordinates(city: string, country: string): [number, number] {
  const cityCoordinates = KNOWN_COORDINATES[city.toLowerCase()];
  if (cityCoordinates) return cityCoordinates;
  return KNOWN_COORDINATES[country.toLowerCase()] ?? [20, 0];
}

function markerElement(count: number, selected: boolean) {
  const element = document.createElement("button");
  element.type = "button";
  element.setAttribute("aria-label", `${count} alumni`);
  element.style.cssText = [
    "border:0",
    "border-radius:9999px",
    "background:#e03131",
    "color:#fff",
    "cursor:pointer",
    "font:700 12px Instrument Sans, sans-serif",
    `height:${Math.max(28, Math.min(54, 24 + count * 4))}px`,
    `width:${Math.max(28, Math.min(54, 24 + count * 4))}px`,
    `box-shadow:0 2px 6px rgba(224,49,49,.4), 0 0 0 ${selected ? "3px #fff, 0 0 0 5px #e03131" : "1.5px rgba(255,255,255,.9)"}`,
  ].join(";");
  element.textContent = String(count);
  return element;
}

export function AlumniDirectoryMap({ people, selectedCity, onSelectCity, className = "" }: AlumniDirectoryMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(2);

  const locations = useMemo(() => {
    const grouped = new Map<string, LocationPoint>();
    people.forEach((person) => {
      const { city, country } = parseLocation(person.city);
      const key = `${city.toLowerCase()}|${country.toLowerCase()}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.people.push(person);
      } else {
        const [lat, lng] = locationCoordinates(city, country);
        grouped.set(key, { id: key, city, country, lat, lng, people: [person] });
      }
    });
    return Array.from(grouped.values());
  }, [people]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setIsLoading(false);
      setMapError("Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your deployment environment.");
      return;
    }
    if (!mapElementRef.current) return;

    let cancelled = false;
    const loader = new Loader({ apiKey, version: "weekly" });
    loader
      .importLibrary("maps")
      .then(async () => {
        if (cancelled || !mapElementRef.current) return;
        await google.maps.importLibrary("marker");
        mapRef.current = new google.maps.Map(mapElementRef.current, {
          center: { lat: 25, lng: 25 },
          zoom: 2,
          minZoom: 2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          mapId: "ALUMNI_NETWORK_MAP",
          styles: [
            { elementType: "geometry", stylers: [{ color: "#f3eee5" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#4a4037" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#ddd7cc" }] },
          ],
        });
        infoWindowRef.current = new google.maps.InfoWindow();
        mapRef.current.addListener("zoom_changed", () => setZoom(mapRef.current?.getZoom() ?? 2));
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        setIsLoading(false);
        setMapError(error instanceof Error ? error.message : "Google Maps could not be loaded.");
      });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => (marker.map = null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps?.marker) return;
    markersRef.current.forEach((marker) => (marker.map = null));
    markersRef.current = [];

    const visibleLocations =
      zoom < 5
        ? Array.from(
            locations.reduce((groups, location) => {
              const existing = groups.get(location.country) ?? { ...location, city: location.country, people: [] };
              existing.people.push(...location.people);
              groups.set(location.country, existing);
              return groups;
            }, new Map<string, LocationPoint>()),
          ).map(([, location]) => location)
        : locations;

    visibleLocations.forEach((location) => {
      const element = markerElement(location.people.length, Boolean(selectedCity && selectedCity === location.city));
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: location.lat, lng: location.lng },
        content: element,
        title: `${location.city}: ${location.people.length} alumni`,
      });
      element.addEventListener("click", () => {
        if (zoom < 5) {
          map.setZoom(6);
          map.panTo({ lat: location.lat, lng: location.lng });
          return;
        }
        onSelectCity?.(location.city);
        infoWindowRef.current?.setContent(
          `<div style="font-family:Instrument Sans,sans-serif;padding:4px"><strong>${location.city}, ${location.country}</strong><br/><span>${location.people.length} alumni settled here</span></div>`,
        );
        infoWindowRef.current?.open({ map, anchor: marker });
      });
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => (marker.map = null));
      markersRef.current = [];
    };
  }, [locations, onSelectCity, selectedCity, zoom]);

  return (
    <div className={`border border-rule bg-paper p-4 md:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-4">
        <div>
          <span className="eyebrow">Google Maps · Global alumni register</span>
          <h2 className="mt-1 font-display text-3xl">Where Ashwood has settled</h2>
          <p className="mt-1 text-sm text-ink-soft">Zoom in to move from country totals to city totals.</p>
        </div>
        <div className="text-right font-mono text-xs text-muted-foreground">
          <p>{people.length} settled alumni</p>
          <p>{new Set(locations.map((location) => location.country)).size} countries · {locations.length} cities</p>
        </div>
      </div>
      <div className="relative mt-5 h-[420px] overflow-hidden border border-rule/60 bg-background md:h-[520px]">
        <div ref={mapElementRef} className="h-full w-full" />
        {(isLoading || mapError) && (
          <div className="absolute inset-0 grid place-items-center bg-background/95 p-6 text-center">
            <p className="max-w-md text-sm text-ink-soft">{mapError ?? "Loading Google Maps…"}</p>
          </div>
        )}
        {!mapError && !isLoading && (
          <span className="absolute bottom-3 left-3 border border-rule bg-background/90 px-3 py-2 font-mono text-[10px] text-muted-foreground">
            {zoom < 5 ? "COUNTRY VIEW · zoom in to reveal cities" : "CITY VIEW · click a marker to filter"}
          </span>
        )}
      </div>
    </div>
  );
}
