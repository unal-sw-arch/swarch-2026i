import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import type { KitchenOrder } from '@/lib/types';
import { getSession } from '@/lib/auth';

/**
 * Realtime kitchen events from OrderService over STOMP/WebSocket.
 *
 * Connects through the API Gateway at wss://<gateway>/ws/kitchen. The
 * gateway runs Spring Cloud Gateway on WebFlux/Netty, which proxies the
 * HTTP Upgrade handshake transparently. REST and realtime share a single
 * public edge on port 8080; OrderService is no longer reachable from the
 * host directly. See backend/APIGateway/.../RouteConfig.java.
 *
 * Secure Channel: the gateway is TLS-only. By default we connect to the same
 * origin that serves the dashboard, so in dev the Vite proxy (`/ws`, secure:
 * false) tunnels to wss://localhost:8080 and in prod the browser uses wss://
 * against the gateway's CA-issued certificate. Override with VITE_ORDER_WS_URL.
 */

const sameOriginWsUrl = (): string => {
  if (typeof window === 'undefined') return 'wss://localhost:8080/ws/kitchen';
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${scheme}://${window.location.host}/ws/kitchen`;
};

const WS_URL = (import.meta.env.VITE_ORDER_WS_URL as string | undefined) ?? sameOriginWsUrl();

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
    heartbeatIncoming: 4_000,
    heartbeatOutgoing: 4_000,
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
