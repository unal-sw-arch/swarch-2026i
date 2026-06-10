import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import type { KitchenOrder } from '@/lib/types';
import { getSession } from '@/lib/auth';

/**
 * Realtime kitchen events from OrderService over STOMP/WebSocket.
 *
 * Connects through the API Gateway at ws://<gateway>/ws/kitchen. The
 * gateway runs Spring Cloud Gateway on WebFlux/Netty, which proxies the
 * HTTP Upgrade handshake transparently. REST and realtime share a single
 * public edge on port 8080; OrderService is no longer reachable from the
 * host directly. See backend/APIGateway/.../RouteConfig.java.
 */

const DEFAULT_WS_URL = 'ws://localhost:8080/ws/kitchen';
const WS_URL = (import.meta.env.VITE_ORDER_WS_URL as string | undefined) ?? DEFAULT_WS_URL;

export type KitchenEventType = 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED';

export interface KitchenEvent {
  type: KitchenEventType;
  order: KitchenOrder;
  timestamp: string;
}

export interface KitchenRealtimeHandle {
  disconnect: () => void;
}

export function subscribeKitchen(
  restaurantId: number,
  onEvent: (event: KitchenEvent) => void,
  onStatusChange?: (connected: boolean) => void,
): KitchenRealtimeHandle {
  const session = getSession();
  let subscription: StompSubscription | null = null;

  const client = new Client({
    brokerURL: WS_URL,
    // Carry JWT in STOMP CONNECT headers. The server does not yet validate it
    // (MVP) but keeps the contract stable for when role-based auth is added.
    connectHeaders: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
    reconnectDelay: 3_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
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
          console.error('Failed to parse kitchen event:', err, message.body);
        }
      },
    );
  };

  client.onWebSocketClose = () => {
    onStatusChange?.(false);
  };

  client.onStompError = (frame) => {
    console.error('STOMP error:', frame.headers['message'], frame.body);
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
}
