import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

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

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
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

  return (
    <div>
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
        </MapContainer>
      </div>
      <p className="mt-1 text-xs text-outline">Click on the map to set the registered coordinates.</p>
    </div>
  );
}
