import Link from "next/link";
import { notFound } from "next/navigation";

import { MenuExperience } from "@/components/menu-experience";
import { CatalogRepository } from "@/lib/repositories/catalog-repository";

type MenuPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantMenuPage({ params }: MenuPageProps) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (Number.isNaN(restaurantId)) {
    notFound();
  }

  const [restaurants, menu, recommendations] = await Promise.all([
    CatalogRepository.getRestaurants(),
    CatalogRepository.getRestaurantMenu(restaurantId),
    CatalogRepository.getRecommendations(restaurantId),
  ]);

  const restaurant =
    restaurants.items.find((item) => item.id === restaurantId) ?? null;

  if (!menu) {
    return (
      <div className="page-shell">
        <div className="panel section-card empty-state">
          This restaurant menu is not available right now.
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell stack">
      <section className="panel section-card">
        <div className="page-heading">
          <div>
            <h1>{restaurant?.name ?? `Restaurant #${restaurantId}`}</h1>
            <p className="muted">
              Menu #{menu.menuId} · only available products can be ordered.
            </p>
          </div>
          <Link className="button-secondary" href="/restaurants">
            Back to restaurants
          </Link>
        </div>
      </section>

      <MenuExperience
        items={menu.items}
        recommendations={recommendations.items}
        restaurant={restaurant}
      />
    </div>
  );
}
