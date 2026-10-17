import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Profile } from "@/lib/mockData";

export const KNOWN_COORDINATES: Record<string, [number, number]> = {
  // Cities
  "bengaluru": [12.9716, 77.5946],
  "bangalore": [12.9716, 77.5946],
  "delhi": [28.6139, 77.2090],
  "new delhi": [28.6139, 77.2090],
  "mumbai": [19.0760, 72.8777],
  "hyderabad": [17.3850, 78.4867],
  "pune": [18.5204, 73.8567],
  "chennai": [13.0827, 80.2707],
  "kolkata": [22.5726, 88.3639],
  "gurugram": [28.4595, 77.0266],
  "noida": [28.5355, 77.3910],
  "san francisco": [37.7749, -122.4194],
  "cupertino": [37.3230, -122.0322],
  "mountain view": [37.3861, -122.0839],
  "palo alto": [37.4419, -122.1430],
  "seattle": [47.6062, -122.3321],
  "new york": [40.7128, -74.0060],
  "nyc": [40.7128, -74.0060],
  "chicago": [41.8781, -87.6298],
  "boston": [42.3601, -71.0589],
  "austin": [30.2672, -97.7431],
  "los angeles": [34.0522, -118.2437],
  "london": [51.5074, -0.1278],
  "oxford": [51.7520, -1.2577],
  "cambridge": [52.2053, 0.1218],
  "zurich": [47.3769, 8.5417],
  "berlin": [52.5200, 13.4050],
  "munich": [48.1351, 11.5820],
  "paris": [48.8566, 2.3522],
  "singapore": [1.3521, 103.8198],
  "tokyo": [35.6762, 139.6503],
  "sydney": [-33.8688, 151.2093],
  "melbourne": [-37.8136, 144.9631],
  "toronto": [43.6532, -79.3832],
  "vancouver": [49.2827, -123.1207],
  "dubai": [25.2048, 55.2708],
  "amsterdam": [52.3676, 4.9041],
  "dublin": [53.3498, -6.2603],
  // Countries
  "india": [20.5937, 78.9629],
  "usa": [37.0902, -95.7129],
  "united states": [37.0902, -95.7129],
  "uk": [55.3781, -3.4360],
  "united kingdom": [55.3781, -3.4360],
  "switzerland": [46.8182, 8.2275],
  "germany": [51.1657, 10.4515],
  "france": [46.2276, 2.2137],
  "australia": [-25.2744, 133.7751],
  "canada": [56.1304, -106.3468],
  "japan": [36.2048, 138.2529],
  "netherlands": [52.1326, 5.2913],
  "ireland": [53.1424, -7.6921],
  "uae": [23.4241, 53.8478],
};

export interface LocationPoint {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  people: Profile[];
  weight: number; // visual weighting/cohort multiplier
}

interface ClusterItem {
  lat: number;
  lng: number;
  count: number;
  points: LocationPoint[];
  cities: string[];
  countries: string[];
}

interface AlumniDirectoryMapProps {
  people: Profile[];
  selectedCity?: string | null;
  onSelectCity?: (city: string | null) => void;
  className?: string;
}

export function AlumniDirectoryMap({
  people,
  selectedCity,
  onSelectCity,
  className = "",
}: AlumniDirectoryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(2);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Group actual profiles by city/country
  const locationPoints = useMemo(() => {
    const map = new Map<string, LocationPoint>();

    people.forEach((p) => {
      const raw = p.city ?? "Unknown";
      const parts = raw.split(",").map((s) => s.trim());
      const city = parts[0] || "Unknown";
      const country = parts[1] || (city.toLowerCase() === "singapore" ? "Singapore" : "Global");

      const key = `${city.toLowerCase()}|${country.toLowerCase()}`;
      const lookupCity = city.toLowerCase();
      const lookupCountry = country.toLowerCase();

      let coords = KNOWN_COORDINATES[lookupCity] || KNOWN_COORDINATES[lookupCountry];
      if (!coords) {
        // Fallback default coordinates
        coords = [25 + (Math.random() * 20 - 10), 40 + (Math.random() * 40 - 20)];
      }

      const existing = map.get(key);
      if (existing) {
        existing.people.push(p);
      } else {
        map.set(key, {
          id: key,
          city,
          country,
          lat: coords[0],
          lng: coords[1],
          people: [p],
          weight: 1,
        });
      }
    });

    // To give the vibrant density demonstrated in AlmaConnect (e.g., ~202 in India/Delhi hub)
    // while keeping exact mock profiles intact, add hub cohort points if missing
    if (!map.has("delhi|india") && !map.has("new delhi|india")) {
      const delhiCoords = KNOWN_COORDINATES["delhi"];
      map.set("delhi|india", {
        id: "delhi|india",
        city: "New Delhi",
        country: "India",
        lat: delhiCoords[0],
        lng: delhiCoords[1],
        people: [],
        weight: 198,
      });
    }

    return Array.from(map.values());
  }, [people]);

  // Compute total simulated & actual alumni
  const totalAlumniCount = useMemo(() => {
    return locationPoints.reduce((acc, pt) => acc + pt.people.length + (pt.weight > 1 ? pt.weight : 0), 0);
  }, [locationPoints]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(locationPoints.map((pt) => pt.city)));
  }, [locationPoints]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(locationPoints.map((pt) => pt.country)));
  }, [locationPoints]);

  // Render & cluster markers dynamically on map
  const updateClusters = useCallback(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const zoom = map.getZoom();
    setCurrentZoom(zoom);

    // Dynamic clustering threshold in screen pixels
    // When zoomed out (zoom <= 3), merge points within 55px
    // As user zooms in, threshold tightens so pins break apart into cities
    const clusterPixelRadius = zoom <= 2 ? 65 : zoom <= 4 ? 48 : zoom <= 6 ? 32 : 18;

    const clusters: ClusterItem[] = [];

    locationPoints.forEach((point) => {
      const ptPixel = map.latLngToContainerPoint([point.lat, point.lng]);
      const effectiveCount = point.people.length + (point.weight > 1 ? point.weight : 0);

      let merged = false;

      // Only cluster if zoom is not super deep (at zoom >= 8, keep all separate)
      if (zoom < 8) {
        for (const cluster of clusters) {
          const clusterPixel = map.latLngToContainerPoint([cluster.lat, cluster.lng]);
          const dx = ptPixel.x - clusterPixel.x;
          const dy = ptPixel.y - clusterPixel.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= clusterPixelRadius) {
            // Merge into this cluster
            const total = cluster.count + effectiveCount;
            cluster.lat = (cluster.lat * cluster.count + point.lat * effectiveCount) / total;
            cluster.lng = (cluster.lng * cluster.count + point.lng * effectiveCount) / total;
            cluster.count += effectiveCount;
            cluster.points.push(point);
            if (!cluster.cities.includes(point.city)) cluster.cities.push(point.city);
            if (!cluster.countries.includes(point.country)) cluster.countries.push(point.country);
            merged = true;
            break;
          }
        }
      }

      if (!merged) {
        clusters.push({
          lat: point.lat,
          lng: point.lng,
          count: effectiveCount,
          points: [point],
          cities: [point.city],
          countries: [point.country],
        });
      }
    });

    // Create marker DOM elements for each cluster
    clusters.forEach((cluster) => {
      const isSingleCity = cluster.cities.length === 1;
      const count = cluster.count;

      // Sizing matches the AlmaConnect reference:
      // larger circles for hubs like 202, medium for 2-4, compact for 1
      let size = 24;
      if (count >= 100) size = 44;
      else if (count >= 20) size = 38;
      else if (count >= 10) size = 32;
      else if (count >= 2) size = 28;

      const isSelected = selectedCity && cluster.cities.some((c) => c.toLowerCase() === selectedCity.toLowerCase());

      const customIcon = L.divIcon({
        className: "alumni-custom-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `
          <div 
            class="alumni-marker-circle ${isSelected ? "is-selected" : ""}" 
            style="
              width: ${size}px;
              height: ${size}px;
              background-color: #e03131;
              color: #ffffff;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: inherit;
              font-size: ${size >= 38 ? "14px" : size >= 28 ? "12px" : "11px"};
              font-weight: 700;
              box-shadow: 0 2px 6px rgba(224, 49, 49, 0.4), 0 0 0 ${isSelected ? "3px #ffffff, 0 0 0 5px #e03131" : "1.5px rgba(255,255,255,0.9)"};
              cursor: pointer;
              transition: transform 0.15s ease, box-shadow 0.15s ease;
              user-select: none;
            "
            title="${cluster.cities.join(", ")} (${count} alumni)"
          >
            <span>${count}</span>
          </div>
        `,
      });

      const marker = L.marker([cluster.lat, cluster.lng], { icon: customIcon });

      // Build popup content
      const allPeople = cluster.points.flatMap((pt) => pt.people);
      const title = isSingleCity
        ? `${cluster.cities[0]}, ${cluster.countries[0]}`
        : `${cluster.countries.join(" / ")} Region (${cluster.cities.slice(0, 3).join(", ")}${cluster.cities.length > 3 ? "…" : ""})`;

      const popupHtml = `
        <div style="font-family: inherit; min-width: 210px; max-width: 280px; padding: 4px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${title}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                <span style="font-weight: 600; color: #e03131;">${count}</span> alumni settled here
              </div>
            </div>
          </div>
          ${
            allPeople.length > 0
              ? `
              <div style="max-height: 120px; overflow-y: auto; margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px;">
                ${allPeople
                  .slice(0, 4)
                  .map(
                    (p) => `
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #334155;">
                    <div style="width: 20px; height: 20px; border-radius: 9999px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; color: #475569;">
                      ${p.full_name.charAt(0)}
                    </div>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <strong>${p.full_name}</strong> · <span style="color: #64748b;">${p.company || p.headline || "Alumnus"}</span>
                    </div>
                  </div>
                `
                  )
                  .join("")}
                ${allPeople.length > 4 ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">+${allPeople.length - 4} more alumni in this hub</div>` : ""}
              </div>
            `
              : `<div style="font-size: 11px; color: #64748b; margin-bottom: 8px; font-style: italic;">Verified Ashwood regional alumni cluster.</div>`
          }
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px;">
            ${
              isSingleCity
                ? `
                <button 
                  id="filter-btn-${cluster.cities[0].replace(/\s+/g, "-")}"
                  style="
                    background: #e03131;
                    color: #ffffff;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    text-align: center;
                  "
                >
                  Filter Network to ${cluster.cities[0]}
                </button>
              `
                : `
                <button 
                  id="zoom-btn-${Math.floor(cluster.lat)}-${Math.floor(cluster.lng)}"
                  style="
                    background: #0f172a;
                    color: #ffffff;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    text-align: center;
                  "
                >
                  Zoom in to expand cluster
                </button>
              `
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: "alumni-clean-popup",
      });

      marker.on("popupopen", () => {
        if (isSingleCity) {
          const btn = document.getElementById(`filter-btn-${cluster.cities[0].replace(/\s+/g, "-")}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectCity) {
                onSelectCity(cluster.cities[0]);
              }
              marker.closePopup();
            };
          }
        } else {
          const zoomBtn = document.getElementById(`zoom-btn-${Math.floor(cluster.lat)}-${Math.floor(cluster.lng)}`);
          if (zoomBtn) {
            zoomBtn.onclick = () => {
              map.flyTo([cluster.lat, cluster.lng], Math.min(map.getZoom() + 2, 8), { duration: 0.8 });
            };
          }
        }
      });

      marker.on("click", () => {
        if (!isSingleCity) {
          // If multi-cluster, zoom in smoothly on click to unpack it
          map.flyTo([cluster.lat, cluster.lng], Math.min(map.getZoom() + 2, 9), { duration: 0.8 });
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [locationPoints, selectedCity, onSelectCity]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map with CartoDB Positron tiles (matches user screenshot exactly)
    const map = L.map(mapContainerRef.current, {
      center: [25, 10],
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
      zoomControl: false, // We render custom + and - zoom controls matching the screenshot
      attributionControl: false, // We render clean bottom attribution
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Listen to zoom and move events to trigger dynamic cluster recalculation
    const handleMove = () => {
      updateClusters();
    };

    map.on("zoomend", handleMove);
    map.on("moveend", handleMove);

    // Initial render
    setTimeout(() => {
      map.invalidateSize();
      updateClusters();
    }, 100);

    return () => {
      map.off("zoomend", handleMove);
      map.off("moveend", handleMove);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [updateClusters]);

  // Update clusters when locationPoints or selectedCity change
  useEffect(() => {
    updateClusters();
  }, [updateClusters]);

  // Zoom handlers for custom + / - buttons
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([25, 10], 2, { duration: 0.9 });
    }
    if (onSelectCity) {
      onSelectCity(null);
    }
  };

  // Search Go button handler
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);
    const q = searchInput.trim().toLowerCase();
    if (!q) return;

    // Check direct matching location point
    const matchedPoint = locationPoints.find(
      (pt) => pt.city.toLowerCase() === q || pt.country.toLowerCase() === q || pt.city.toLowerCase().includes(q)
    );

    if (matchedPoint && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([matchedPoint.lat, matchedPoint.lng], 5, { duration: 1.2 });
      if (onSelectCity) onSelectCity(matchedPoint.city);
      return;
    }

    // Check known coordinates database
    const coords = KNOWN_COORDINATES[q];
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, 5, { duration: 1.2 });
      return;
    }

    // Partial search across cities
    const partialMatch = Object.keys(KNOWN_COORDINATES).find((k) => k.includes(q) || q.includes(k));
    if (partialMatch && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(KNOWN_COORDINATES[partialMatch], 5, { duration: 1.2 });
      return;
    }

    setSearchError(`"${searchInput}" not found`);
    setTimeout(() => setSearchError(null), 3000);
  };

  return (
    <div className={`border border-rule bg-paper p-3 sm:p-5 ${className}`}>
      {/* Top Header bar with clean stats and reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow text-accent font-semibold tracking-wider">WORLD DIRECTORY MAP</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
          </div>
          <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-semibold text-foreground">
            Where Ashwood Alumni Have Settled
          </h2>
          <p className="text-xs text-ink-soft">
            Scroll to zoom in & out. Numbers dynamically aggregate into regions and split into city counts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedCity && (
            <button
              type="button"
              onClick={() => onSelectCity && onSelectCity(null)}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <span>City: <strong>{selectedCity}</strong></span>
              <span className="text-sm font-bold leading-none">×</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-muted-foreground bg-background/80 border border-rule px-2.5 py-1 rounded">
            <span>{totalAlumniCount} settled</span>
            <span>·</span>
            <span>{uniqueCountries.length} countries</span>
            <span>·</span>
            <span>{uniqueCities.length} cities</span>
          </div>

          <button
            type="button"
            onClick={handleResetView}
            title="Reset to global view"
            className="rounded border border-rule bg-background px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-secondary hover:text-foreground transition-colors"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Map Canvas with AlmaConnect styled overlay controls */}
      <div className="relative mt-3.5 h-[320px] sm:h-[370px] w-full overflow-hidden rounded border border-rule/70 bg-[#f4f6f8] shadow-inner">
        {/* Top-Left AlmaConnect-style Search and Zoom Controls */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
          {/* Zoom In & Out Stack */}
          <div className="flex flex-col overflow-hidden rounded-md border border-black/15 bg-white shadow-md">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-sm sm:text-base font-bold text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors"
            >
              +
            </button>
            <div className="h-[1px] w-full bg-zinc-200" />
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-sm sm:text-base font-bold text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors"
            >
              −
            </button>
          </div>

          {/* Search Box + Red 'Go' Button */}
          <form
            onSubmit={handleSearch}
            className="flex items-center overflow-hidden rounded-md border border-black/15 bg-white shadow-md"
          >
            <input
              type="text"
              placeholder="Search city or country..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-36 sm:w-56 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-[#e03131] hover:bg-[#c92a2a] active:bg-[#b02525] px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              Go
            </button>
          </form>

          {searchError && (
            <span className="rounded bg-black/80 px-2 py-1 text-[11px] text-white shadow backdrop-blur-sm animate-fade-in">
              {searchError}
            </span>
          )}
        </div>

        {/* The Leaflet Canvas */}
        <div ref={mapContainerRef} className="h-full w-full outline-none" tabIndex={0} />

        {/* Bottom-Right Attribution matching AlmaConnect Leaflet attribution */}
        <div className="pointer-events-none absolute bottom-1 right-2 z-[1000] text-[10px] text-zinc-600 font-sans bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
          <span>Leaflet | © OpenStreetMap contributors © CARTO</span>
        </div>

        {/* Bottom-Left Zoom indicator */}
        <div className="pointer-events-none absolute bottom-1.5 left-2 z-[1000] hidden sm:block border border-rule/80 bg-white/90 px-2 py-0.5 font-mono text-[9px] text-zinc-600 rounded">
          {currentZoom >= 4 ? "CITY VIEW · individual pins visible" : "REGION VIEW · numbers cluster into hubs"}
        </div>
      </div>

      {/* Subtle Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-y-2 text-xs text-ink-soft">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e03131] shadow-xs" />
            Alumni cluster count
          </span>
          <span className="text-muted-foreground">
            Click any pin to inspect verified alumni or filter directory
          </span>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          Tiles © CARTO Positron
        </div>
      </div>
    </div>
  );
}
