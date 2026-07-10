import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const markerIconDefault = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface FocusPoint {
  lat: number;
  lng: number;
  token: number;
}

function MapRecenter({ focusPoint }: { focusPoint: FocusPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusPoint) {
      map.setView([focusPoint.lat, focusPoint.lng], 14);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPoint?.token]);
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  height = "16rem",
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}) {
  const center: [number, number] = [latitude || 20.5937, longitude || 78.9629];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focusPoint, setFocusPoint] = useState<FocusPoint | null>(null);
  const debounceRef = useRef<number>();

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`,
        );
        const data: GeocodeResult[] = response.ok ? await response.json() : [];
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => window.clearTimeout(debounceRef.current);
  }, [query]);

  function selectResult(result: GeocodeResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onChange(lat, lng);
    setFocusPoint({ lat, lng, token: Date.now() });
    setQuery(result.display_name);
    setResults([]);
  }

  return (
    <div>
      <div className="relative mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (results[0]) selectResult(results[0]);
            }
          }}
          placeholder="Search for a place, address, or landmark..."
          className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
        {isSearching && (
          <p className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline">Searching...</p>
        )}
        {results.length > 0 && (
          <ul className="absolute z-[1001] mt-1 max-h-56 w-full overflow-y-auto rounded border border-outline-variant bg-surface-container-lowest shadow-lg">
            {results.map((result, idx) => (
              <li key={`${result.lat}-${result.lon}-${idx}`}>
                <button
                  type="button"
                  onClick={() => selectResult(result)}
                  className="block w-full px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
                >
                  {result.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ height }} className="overflow-hidden rounded-lg border border-outline-variant">
        <MapContainer center={center} zoom={latitude ? 14 : 5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {latitude && longitude ? (
            <Marker position={[latitude, longitude]} icon={markerIconDefault} />
          ) : null}
          <ClickHandler onPick={onChange} />
          <MapRecenter focusPoint={focusPoint} />
        </MapContainer>
      </div>
      <p className="mt-1 text-xs text-outline">
        Search for a place above, or click on the map to set the coordinates.
      </p>
    </div>
  );
}
