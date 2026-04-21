import { useEffect, useState } from 'react';
import { subscribeKitchen } from '@/core/realtime/kitchen-subscription';
import type { KitchenEvent } from '@/core/orders/interface/order';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

interface Options {
    restaurantId: number;
    enabled?: boolean;
    onEvent: (event: KitchenEvent) => void;
}

export const useKitchenSubscription = ({
    restaurantId,
    enabled = true,
    onEvent,
}: Options) => {
    const token = useAuthStore((state) => state.token);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!enabled || !restaurantId) return;

        const handle = subscribeKitchen({
            restaurantId,
            token: token ?? null,
            onEvent,
            onStatusChange: setConnected,
        });

        return () => handle.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId, enabled, token]);

    return { connected };
};
