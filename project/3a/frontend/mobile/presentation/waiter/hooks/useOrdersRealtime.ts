import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { getRestaurantOrders } from '@/core/orders/actions/get-restaurant-orders.action';
import type { KitchenEvent, Order } from '@/core/orders/interface/order';
import { useKitchenSubscription } from './useKitchenSubscription';

export const ORDERS_QUERY_KEY = ['waiter', 'orders'] as const;

interface Options {
    restaurantId: number;
}

// Single source of truth for the orders list in the waiter app. It combines:
//  - React Query polling as a safety net (30s)
//  - STOMP events that patch the cache optimistically
//  - a queue of "just turned READY" orders for banner notifications
export const useOrdersRealtime = ({ restaurantId }: Options) => {
    const queryClient = useQueryClient();
    const [readyQueue, setReadyQueue] = useState<Order[]>([]);
    const previousStatuses = useRef<Map<number, string>>(new Map());

    const query = useQuery<Order[]>({
        queryKey: [...ORDERS_QUERY_KEY, restaurantId],
        queryFn: () => getRestaurantOrders(restaurantId),
        staleTime: 10_000,
        refetchInterval: 30_000,
        enabled: !!restaurantId,
    });

    // Seed the status map whenever fresh data arrives so we can tell, on the
    // next WS event, whether a transition newly entered READY.
    useEffect(() => {
        if (!query.data) return;
        const next = new Map<number, string>();
        query.data.forEach((order) => next.set(order.id, order.status));
        previousStatuses.current = next;
    }, [query.data]);

    const applyEvent = useCallback(
        (event: KitchenEvent) => {
            const incoming = event.order;
            if (!incoming) return;

            queryClient.setQueryData<Order[]>(
                [...ORDERS_QUERY_KEY, restaurantId],
                (current = []) => {
                    const idx = current.findIndex((o) => o.id === incoming.id);
                    if (idx === -1) return [incoming, ...current];
                    const copy = [...current];
                    copy[idx] = incoming;
                    return copy;
                },
            );

            const prev = previousStatuses.current.get(incoming.id);
            previousStatuses.current.set(incoming.id, incoming.status);

            const wentReady = incoming.status === 'READY' && prev !== 'READY';
            if (wentReady) {
                setReadyQueue((queue) => [...queue, incoming]);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                ).catch(() => undefined);
            }
        },
        [queryClient, restaurantId],
    );

    const { connected } = useKitchenSubscription({
        restaurantId,
        enabled: !!restaurantId,
        onEvent: applyEvent,
    });

    const dismissReady = useCallback((orderId: number) => {
        setReadyQueue((queue) => queue.filter((o) => o.id !== orderId));
    }, []);

    return {
        orders: query.data ?? [],
        isLoading: query.isLoading,
        refetch: query.refetch,
        connected,
        readyQueue,
        dismissReady,
    };
};
