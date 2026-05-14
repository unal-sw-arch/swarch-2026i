import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { Platform } from 'react-native';
import type { KitchenEvent } from '@/core/orders/interface/order';

// Realtime kitchen channel for the waiter app.
//
// Connects through the API Gateway (Spring Cloud Gateway on WebFlux/Netty)
// at ws://<gateway>:8080/ws/kitchen. The gateway proxies the HTTP Upgrade
// handshake transparently and pipes STOMP frames to OrderService. REST and
// realtime share the same public edge — backend microservice ports are no
// longer published to the host. See backend/APIGateway/.../RouteConfig.java.

const resolveWsUrl = (): string => {
    const stage = process.env.EXPO_PUBLIC_STAGE || 'dev';
    if (stage === 'prod') {
        return process.env.EXPO_PUBLIC_ORDER_WS_URL ?? 'ws://localhost:8080/ws/kitchen';
    }
    if (Platform.OS === 'ios') {
        return (
            process.env.EXPO_PUBLIC_ORDER_WS_URL_IOS ??
            'ws://localhost:8080/ws/kitchen'
        );
    }
    return (
        process.env.EXPO_PUBLIC_ORDER_WS_URL_ANDROID ??
        'ws://10.0.2.2:8080/ws/kitchen'
    );
};

export interface KitchenSubscriptionHandle {
    disconnect: () => void;
}

export interface SubscribeKitchenOptions {
    restaurantId: number;
    token?: string | null;
    onEvent: (event: KitchenEvent) => void;
    onStatusChange?: (connected: boolean) => void;
}

export const subscribeKitchen = (
    options: SubscribeKitchenOptions,
): KitchenSubscriptionHandle => {
    const { restaurantId, token, onEvent, onStatusChange } = options;
    let subscription: StompSubscription | null = null;

    const client = new Client({
        brokerURL: resolveWsUrl(),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 3_000,
        heartbeatIncoming: 10_000,
        heartbeatOutgoing: 10_000,
        // React Native's `console` already provides the right level-based
        // output, so we keep the default `debug` off.
        debug: () => undefined,
    });

    client.onConnect = () => {
        onStatusChange?.(true);
        subscription = client.subscribe(
            `/topic/kitchen/${restaurantId}`,
            (message: IMessage) => {
                try {
                    const event = JSON.parse(message.body) as KitchenEvent;
                    onEvent(event);
                } catch (err) {
                    console.log('Failed to parse kitchen event', err);
                }
            },
        );
    };

    client.onWebSocketClose = () => {
        onStatusChange?.(false);
    };

    client.onStompError = (frame) => {
        console.log('STOMP error', frame.headers['message'], frame.body);
        onStatusChange?.(false);
    };

    client.activate();

    return {
        disconnect: () => {
            try {
                subscription?.unsubscribe();
            } catch {
                /* ignore */
            }
            void client.deactivate();
        },
    };
};
