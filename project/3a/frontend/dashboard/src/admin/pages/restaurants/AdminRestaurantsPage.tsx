import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RestaurantList } from "@/admin/components/restaurants/RestaurantList";
import { restaurantService } from "@/lib/services/restaurantService";
import type { Restaurant } from "@/lib/types";

export const AdminRestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    const loadRestaurants = async () => {
      setLoading(true);
      try {
        const data = await restaurantService.getAll();
        setRestaurants(data);
      } catch (error) {
        console.error("Error loading restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const cities = useMemo(() => {
    return Array.from(new Set(restaurants.map((rest) => rest.city).filter(Boolean))).sort((a, b) =>
      String(a).localeCompare(String(b)),
    );
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((rest) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        rest.name.toLowerCase().includes(q) ||
        (rest.category ?? "").toLowerCase().includes(q) ||
        (rest.city ?? "").toLowerCase().includes(q);
      const matchesCity = cityFilter === "all" || rest.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [restaurants, search, cityFilter]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Restaurantes</h1>
        <p className="text-gray-600">
          Explora restaurantes disponibles con un formato visual tipo app de delivery.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar restaurante, categoria o ciudad..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          {loading ? "Cargando restaurantes..." : `Restaurantes cerca de tu ubicacion (${filteredRestaurants.length})`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="h-44 animate-pulse bg-gray-100" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No encontramos restaurantes con esos filtros.
          </div>
        ) : (
          <RestaurantList restaurants={filteredRestaurants} />
        )}
      </div>
    </div>
  );
};

