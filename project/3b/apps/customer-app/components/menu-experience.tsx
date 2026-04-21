"use client";

import Link from "next/link";
import { AlertTriangle, Plus, ShoppingBag, Sparkles } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import type { MenuItem, Recommendation, Restaurant } from "@/lib/types";

export function MenuExperience({
  items,
  recommendations,
  restaurant,
}: {
  items: MenuItem[];
  recommendations: Recommendation[];
  restaurant: Restaurant | null;
}) {
  const { addItem, activeRestaurantId } = useCart();
  const { pushToast } = useToast();

  const addToCart = (item: MenuItem) => {
    if (!restaurant) return;

    if (!item.isAvailable) {
      pushToast("MENU_ITEM_NOT_FOUND", "This product is not available right now.");
      return;
    }

    if (activeRestaurantId && activeRestaurantId !== restaurant.id) {
      pushToast(
        "VALIDATION_ERROR",
        "Your cart was reset because orders can only belong to one restaurant.",
      );
    }

    addItem(restaurant.id, item);
    pushToast("ADDED_TO_CART", `${item.name} is now in your cart.`);
  };

  return (
    <div className="two-column">
      <div className="stack">
        {recommendations.length > 0 ? (
          <section className="panel section-card">
            <div className="page-heading" style={{ marginBottom: 16 }}>
              <div>
                <h2>Simple recommendations</h2>
                <p className="muted">Based on the promotion service contract.</p>
              </div>
            </div>
            <div className="inline-list">
              {recommendations.map((recommendation) => (
                <span className="chip chip--success" key={recommendation.menuItemId}>
                  <Sparkles size={14} />
                  #{recommendation.menuItemId} · {recommendation.reason}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="menu-list">
          {items.length === 0 ? (
            <div className="empty-state">
              No products are available for this restaurant yet.
            </div>
          ) : (
            items.map((item) => (
              <article className="menu-item" key={item.id}>
                <div className="stack" style={{ gap: 10 }}>
                  <div className="stat-row">
                    <span className="chip">#{item.id}</span>
                    <span
                      className={
                        item.isAvailable ? "chip chip--success" : "chip chip--danger"
                      }
                    >
                      {item.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                    </span>
                  </div>
                  <div>
                    <h3 className="card__title">{item.name}</h3>
                    <p className="card__muted">{item.description}</p>
                  </div>
                </div>

                <div className="menu-item__actions">
                  <strong className="badge-price">
                    ${item.price.toLocaleString("en-US")}
                  </strong>
                  <button
                    className="button"
                    disabled={!item.isAvailable}
                    onClick={() => addToCart(item)}
                    type="button"
                  >
                    <Plus size={16} />
                    Add to cart
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      <aside className="panel section-card">
        <div className="stack">
          <div>
            <h2 style={{ marginTop: 0 }}>Cart rules</h2>
            <p className="muted">
              The order service only accepts one restaurant per order, so the cart stays
              scoped to a single restaurant at a time.
            </p>
          </div>
          <div className="meta-card">
            <div className="stat-row">
              <AlertTriangle size={16} />
              <strong>Availability is enforced</strong>
            </div>
            <p className="muted">
              Unavailable products stay disabled and should be rejected by the backend too.
            </p>
          </div>
          <div className="meta-card">
            <div className="stat-row">
              <ShoppingBag size={16} />
              <strong>Checkout uses backend totals</strong>
            </div>
            <p className="muted">
              We only display local estimates. The order response remains the source of truth.
            </p>
          </div>
          <Link className="button-secondary" href="/cart">
            Open cart
          </Link>
        </div>
      </aside>
    </div>
  );
}
