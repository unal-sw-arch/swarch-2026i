import Link from "next/link";
import { ArrowRight, Clock3, MapPinned, Sparkles } from "lucide-react";

import type { Promotion, Restaurant } from "@/lib/types";

export function HeroSection({
  promotions,
  restaurants,
}: {
  promotions: Promotion[];
  restaurants: Restaurant[];
}) {
  const openRestaurants = restaurants.filter((restaurant) => restaurant.isOpen).length;

  return (
    <section className="hero">
      <div className="hero__grid">
        <div>
          <span className="hero__eyebrow">
            <Sparkles size={14} />
            Prototype 2 customer app
          </span>
          <h1 className="hero__title">
            Premium delivery for small restaurants.
          </h1>
          <p className="hero__lead">
            Browse restaurants, build a real cart, place orders through the gateway,
            and follow every status transition from CREATED to DELIVERED with the same
            visual energy your current frontend already has.
          </p>
          <div className="stat-row" style={{ marginTop: 22 }}>
            <Link className="button" href="/restaurants">
              Browse restaurants
              <ArrowRight size={16} />
            </Link>
            <Link className="button-secondary" href="/orders">
              View my orders
            </Link>
          </div>
        </div>

        <div className="hero__aside">
          <div className="hero__bubble">
            <strong>{openRestaurants}</strong>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              Restaurants currently open and ready to receive orders.
            </p>
          </div>
          <div className="hero__bubble">
            <div className="stat-row">
              <span className="chip">
                <Clock3 size={14} />
                Live timeline
              </span>
              <span className="chip">
                <MapPinned size={14} />
                Gateway ready
              </span>
            </div>
            <p className="muted" style={{ margin: "12px 0 0" }}>
              {promotions[0]?.title
                ? `${promotions[0].title}: ${promotions[0].description}`
                : "Promotions will appear here as soon as the service returns active offers."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
