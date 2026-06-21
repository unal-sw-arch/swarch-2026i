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

import { resolveUrl } from '../api/resolve-url';

const resolveWsUrl = (): string => {
    return resolveUrl('ws');
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
        // ── React Native workarounds ──────────────────────────────────
        // RN's WebSocket impl strips the NULL byte (\x00) that terminates
        // every STOMP frame when using text-mode frames. Sending as binary
        // avoids the issue outright; appendMissingNULL re-adds the byte on
        // incoming frames in case the server's response is also mangled.
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        // ──────────────────────────────────────────────────────────────
        reconnectDelay: 3_000,
        heartbeatIncoming: 4_000,
        heartbeatOutgoing: 4_000,
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
