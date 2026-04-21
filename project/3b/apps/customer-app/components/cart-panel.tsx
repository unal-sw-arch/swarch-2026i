"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart-provider";

export function CartPanel({ allowCheckout = true }: { allowCheckout?: boolean }) {
  const { items, removeItem, subtotal, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty-state">
        Your cart is empty. Add products from a restaurant menu to continue.
      </div>
    );
  }

  return (
    <div className="panel section-card">
      <div className="page-heading" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Cart summary</h2>
          <p className="muted">One restaurant per order, persisted locally.</p>
        </div>
      </div>

      <div className="stack">
        {items.map((item) => (
          <div className="cart-line" key={item.menuItemId}>
            <div className="stack" style={{ gap: 8 }}>
              <strong>{item.name}</strong>
              <span className="muted">
                ${item.price.toLocaleString("en-US")} each
              </span>
            </div>
            <div className="stack" style={{ justifyItems: "end", gap: 10 }}>
              <div className="quantity-controls">
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  type="button"
                >
                  <Minus size={14} />
                </button>
                <strong>{item.quantity}</strong>
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  type="button"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                className="button-ghost"
                onClick={() => removeItem(item.menuItemId)}
                type="button"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="divider" />

        <div className="stat-row" style={{ justifyContent: "space-between" }}>
          <span className="muted">Estimated subtotal</span>
          <strong className="badge-price">
            ${subtotal.toLocaleString("en-US")}
          </strong>
        </div>

        {allowCheckout ? (
          <div className="stat-row">
            <Link className="button" href="/checkout">
              Continue to checkout
            </Link>
            <Link className="button-secondary" href="/restaurants">
              Keep shopping
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
