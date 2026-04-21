import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { HeroSection } from "@/components/hero-section";
import { PromotionCard } from "@/components/promotion-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { CatalogRepository } from "@/lib/repositories/catalog-repository";
import { PromotionsRepository } from "@/lib/repositories/promotions-repository";

export default async function HomePage() {
  const [restaurants, promotions] = await Promise.all([
    CatalogRepository.getRestaurants(),
    PromotionsRepository.getActivePromotions(),
  ]);

  return (
    <div className="page-shell stack">
      <HeroSection promotions={promotions.items} restaurants={restaurants.items} />

      <section className="panel section-card">
        <div className="page-heading">
          <div>
            <h2>Popular restaurants</h2>
            <p className="muted">
              The customer app treats the catalog service as the source of truth.
            </p>
          </div>
          <Link className="button-secondary" href="/restaurants">
            See all restaurants
            <ArrowRight size={16} />
          </Link>
        </div>

        {restaurants.items.length === 0 ? (
          <div className="empty-state">
            No restaurants are available yet. The page still renders because SSR is in place.
          </div>
        ) : (
          <div className="grid grid--cards">
            {restaurants.items.slice(0, 6).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      <section className="panel section-card">
        <div className="page-heading">
          <div>
            <h2>Active promotions</h2>
            <p className="muted">
              Commercial support from the promotions service, rendered inside the same visual system.
            </p>
          </div>
          <Link className="button-secondary" href="/cart">
            <ShoppingBag size={16} />
            Open cart
          </Link>
        </div>

        {promotions.items.length === 0 ? (
          <div className="empty-state">
            Active promotions will appear here once the promotion service responds.
          </div>
        ) : (
          <div className="grid grid--cards">
            {promotions.items.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
