import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import type { Restaurant } from "@/lib/types";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <article className="card">
      <div className="stack">
        <div className="stat-row" style={{ justifyContent: "space-between" }}>
          <span className={restaurant.isOpen ? "chip chip--success" : "chip chip--danger"}>
            <Clock3 size={14} />
            {restaurant.isOpen ? "Open now" : "Currently closed"}
          </span>
          <span className="chip">#{restaurant.id}</span>
        </div>
        <div>
          <h3 className="card__title">{restaurant.name}</h3>
          <p className="card__muted">
            Explore the menu, discover recommendations, and build your order with a
            clean per-restaurant cart.
          </p>
        </div>
        <Link className="button-secondary" href={`/restaurants/${restaurant.id}/menu`}>
          View menu
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
