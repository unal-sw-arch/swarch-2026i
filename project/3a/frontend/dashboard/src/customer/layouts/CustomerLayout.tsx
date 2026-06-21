import { useEffect, useMemo, useRef, useState } from "react";
import { KeyRound, LayoutGrid, LogOut, MapPin, Search } from "lucide-react";
import { Navigate, useNavigate } from "react-router";

import { AccountSettingsModal } from "@/admin/components/AccountSettingsModal";
import { RestaurantList } from "@/admin/components/restaurants/RestaurantList";
import { RestaurantPreviewDialog } from "@/admin/components/restaurants/RestaurantPreviewDialog";
import { RestaurantsMap } from "@/admin/components/restaurants/RestaurantsMap";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUserInitials, getCurrentUserName, getCurrentUsername, getCurrentUserRole } from "@/lib/auth";
import { restaurantService } from "@/lib/services/restaurantService";
import type { Restaurant } from "@/lib/types";

type GeoStatus = "requesting" | "granted" | "denied";

export const CustomerLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userRole = getCurrentUserRole();
  const userName = getCurrentUserName() || getCurrentUsername() || "Cliente";
  const userInitials = getCurrentUserInitials();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("requesting");
  const [configOpen, setConfigOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadRestaurants = async (lat?: number, lng?: number) => {
      setLoading(true);
      setApiError(null);
      try {
        const data = await restaurantService.getAll(lat, lng);
        setRestaurants(data);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("Error loading customer restaurants:", msg);
        setApiError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      setGeoStatus("denied");
      void loadRestaurants();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoStatus("granted");
        void loadRestaurants(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setGeoStatus("denied");
        void loadRestaurants();
      },
      { timeout: 10000 },
    );
  }, []);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return restaurants;
    return restaurants.filter((rest) =>
      rest.name.toLowerCase().includes(query) ||
      (rest.category ?? "").toLowerCase().includes(query) ||
      (rest.city ?? "").toLowerCase().includes(query)
    );
  }, [restaurants, search]);

  if (userRole && userRole !== "CUSTOMER") {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/auth/login");
  };

  const handleOpenSettings = () => {
    setConfigOpen(true);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Cliente</p>
            <h1 className="text-3xl font-semibold text-gray-900">Bienvenido, {userName}</h1>
            <p className="text-sm text-gray-600">Explora restaurantes, revisa el menú y reserva una mesa.</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-950 text-xl font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
            >
              {userInitials}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 z-20 mt-3 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                <button
                  onClick={handleOpenSettings}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <KeyRound className="h-4 w-4" /> Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Restaurantes</h2>
          <p className="text-gray-600">
            Haz click en un restaurante para desplegar su menú.
            {geoStatus === "granted" ? " Mostrando opciones cerca de tu ubicación." : ""}
          </p>
        </div>

        <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "map"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Mapa
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar restaurante, categoria o ciudad..."
                className="w-full rounded-md border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <span className="inline-flex items-center gap-2 text-sm text-gray-600">
              <LayoutGrid className="h-4 w-4" />
              {filteredRestaurants.length} disponibles
            </span>
          </div>
        </div>

        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Error al cargar restaurantes: <span className="font-mono">{apiError}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="h-44 animate-pulse bg-gray-100" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No encontramos restaurantes con esos filtros.
          </div>
        ) : viewMode === "map" ? (
          <RestaurantsMap restaurants={filteredRestaurants} onRestaurantClick={setSelectedRestaurant} />
        ) : (
          <RestaurantList restaurants={filteredRestaurants} onRestaurantClick={setSelectedRestaurant} />
        )}
      </main>

      <RestaurantPreviewDialog
        restaurant={selectedRestaurant}
        open={!!selectedRestaurant}
        onOpenChange={(open) => {
          if (!open) setSelectedRestaurant(null);
        }}
      />

      <AccountSettingsModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        username={getCurrentUsername() ?? userName}
        role={userRole ?? "CUSTOMER"}
      />
    </div>
  );
};
