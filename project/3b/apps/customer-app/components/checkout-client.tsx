"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CartPanel } from "@/components/cart-panel";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import type { ApiError, OrderDetail } from "@/lib/types";

export function CheckoutClient() {
  const router = useRouter();
  const { items, activeRestaurantId, clearCart } = useCart();
  const { pushToast } = useToast();
  const [notes, setNotes] = useState("");
  const [isPending, setIsPending] = useState(false);

  const canSubmit = useMemo(
    () => items.length > 0 && Boolean(activeRestaurantId),
    [activeRestaurantId, items.length],
  );

  const submitOrder = async () => {
    if (!canSubmit || !activeRestaurantId) {
      pushToast("VALIDATION_ERROR", "Add at least one item before placing an order.");
      return;
    }

    setIsPending(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: activeRestaurantId,
        notes,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      pushToast(error.code, error.message);
      setIsPending(false);
      return;
    }

    const order = (await response.json()) as OrderDetail;
    clearCart();
    router.push(`/orders/${order.id}`);
    router.refresh();
  };

  return (
    <div className="two-column">
      <div className="panel section-card">
        <div className="stack">
          <div>
            <h1 style={{ marginTop: 0 }}>Checkout</h1>
            <p className="muted">
              We submit the exact contract expected by the gateway and let the backend
              calculate totals and snapshots.
            </p>
          </div>

          <label className="field">
            <span>Notes for the restaurant</span>
            <textarea
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Sin cebolla"
              value={notes}
            />
          </label>

          <div className="meta-grid">
            <div className="meta-card">
              <strong>JWT protected route</strong>
              <p className="muted">This checkout only works for authenticated customers.</p>
            </div>
            <div className="meta-card">
              <strong>Single restaurant</strong>
              <p className="muted">
                All items in the cart belong to restaurant #{activeRestaurantId ?? "--"}.
              </p>
            </div>
          </div>

          <button className="button" disabled={!canSubmit || isPending} onClick={submitOrder}>
            {isPending ? "Creating order..." : "Place order"}
          </button>
        </div>
      </div>

      <CartPanel allowCheckout={false} />
    </div>
  );
}
