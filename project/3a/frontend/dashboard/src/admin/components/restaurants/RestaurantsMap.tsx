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
  onRestaurantClick?: (restaurant: Restaurant) => void;
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

const MapPaneLayers = () => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.style.overflow = "hidden";

    const popupPane = map.getPane("popupPane");
    const tooltipPane = map.getPane("tooltipPane");
    const markerPane = map.getPane("markerPane");

    if (popupPane) popupPane.style.zIndex = "10000";
    if (tooltipPane) tooltipPane.style.zIndex = "10001";
    if (markerPane) markerPane.style.zIndex = "9000";
  }, [map]);

  return null;
};

export const RestaurantsMap = ({ restaurants, onRestaurantClick }: RestaurantsMapProps) => {
  return (
    <div className="relative z-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <MapContainer center={BOGOTA} zoom={10} scrollWheelZoom className="h-140 w-full rounded-2xl">
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
                {onRestaurantClick && (
                  <button
                    type="button"
                    onClick={() => onRestaurantClick(restaurant)}
                    className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Ver menú
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <MapPaneLayers />
        <FitBounds restaurants={restaurants} />
      </MapContainer>
    </div>
  );
};
