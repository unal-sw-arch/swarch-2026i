package com.clickmunch.OrderService.realtime;

import com.clickmunch.OrderService.dto.OrderResponse;

import java.time.Instant;

/**
 * Envelope for kitchen events delivered over STOMP.
 *
 * type:
 *   "ORDER_CREATED"           - a waiter just placed a new order
 *   "ORDER_STATUS_CHANGED"    - chef (or waiter) advanced an order's state
 *
 * order: the full OrderResponse so the client can render immediately without
 *        issuing a follow-up REST call.
 */
public record KitchenEvent(
        String type,
        OrderResponse order,
        Instant timestamp
) {
    public static KitchenEvent created(OrderResponse order) {
        return new KitchenEvent("ORDER_CREATED", order, Instant.now());
    }

    public static KitchenEvent statusChanged(OrderResponse order) {
        return new KitchenEvent("ORDER_STATUS_CHANGED", order, Instant.now());
    }
}
