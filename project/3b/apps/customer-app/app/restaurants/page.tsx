import { RestaurantCard } from "@/components/restaurant-card";
import { CatalogRepository } from "@/lib/repositories/catalog-repository";

export default async function RestaurantsPage() {
  const restaurants = await CatalogRepository.getRestaurants();

  return (
    <div className="page-shell">
      <section className="panel section-card">
        <div className="page-heading">
          <div>
            <h1>Restaurants</h1>
            <p className="muted">
              Server-rendered list coming from the gateway and catalog contract.
            </p>
          </div>
        </div>

        {restaurants.items.length === 0 ? (
          <div className="empty-state">
            We could not load restaurants right now, but the route still SSRs cleanly.
          </div>
        ) : (
          <div className="grid grid--cards">
            {restaurants.items.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
