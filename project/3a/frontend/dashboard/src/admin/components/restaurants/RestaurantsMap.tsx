import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { Restaurant } from "@/lib/types";

interface RestaurantsMapProps {
  restaurants: Restaurant[];
}

const BOGOTA: [number, number] = [4.711, -74.0721];

const defaultIcon = L.icon({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const FitBounds = ({ restaurants }: RestaurantsMapProps) => {
  const map = useMap();

  useEffect(() => {
    if (restaurants.length === 0) {
      map.setView(BOGOTA, 10);
      return;
    }

    const bounds = L.latLngBounds(
      restaurants.map((r) => [r.latitude, r.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
  }, [map, restaurants]);

  return null;
};

export const RestaurantsMap = ({ restaurants }: RestaurantsMapProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <MapContainer center={BOGOTA} zoom={10} scrollWheelZoom className="h-140 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurants.map((restaurant) => (
          <Marker key={restaurant.id} position={[restaurant.latitude, restaurant.longitude]}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{restaurant.name}</p>
                <p className="text-sm text-gray-600">{restaurant.category ?? "Restaurante"}</p>
                <p className="text-sm text-gray-600">⭐ {restaurant.rating.toFixed(1)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds restaurants={restaurants} />
      </MapContainer>
    </div>
  );
};

