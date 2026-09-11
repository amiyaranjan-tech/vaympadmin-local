import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Vite doesn't resolve Leaflet's default marker image URLs the way
// webpack's file-loader did — without this, the pin renders as a broken
// image. Pull the marker assets straight from Leaflet's own package.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LiveLocationMapProps {
  lat: number;
  lng: number;
  height?: number;
}

// Leaflet + OpenStreetMap tiles — free, no API key, matching the same
// zero-cost approach the Rider/Consumer apps use for their own in-app
// maps (see Vaymprider-local's StaticMap.tsx / vaympmobile-local's
// LocationMap.tsx). The marker is repositioned in place on prop changes
// rather than remounting the whole map, so a polling refresh doesn't
// flash/reset the view.
export function LiveLocationMap({ lat, lng, height = 260 }: LiveLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    markerRef.current = L.marker([lat, lng]).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Only the mount effect reads lat/lng — updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.panTo([lat, lng]);
  }, [lat, lng]);

  return <div ref={containerRef} style={{ height, width: "100%", borderRadius: 12 }} />;
}
