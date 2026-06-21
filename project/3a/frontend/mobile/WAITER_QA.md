# Waiter App – QA manual

This document lists the steps to verify the waiter app end-to-end against a
local docker-compose stack.

## Prerequisites

1. Backend stack up (from `backend/`):

   ```bash
   docker compose up -d
   ```

   Only the API Gateway is published to the host. REST and STOMP/WebSocket
   share a single edge on port 8080:

   - `http://<host>:8080` – API Gateway (REST)
   - `ws://<host>:8080/ws/kitchen` – Kitchen WebSocket (proxied to OrderService)

   `<host>` is `localhost` for iOS simulator, `10.0.2.2` for Android
   emulator, your LAN IP for a physical device.

2. Mobile config (`frontend/mobile/.env`):

   ```dotenv
   EXPO_PUBLIC_STAGE=dev
   EXPO_PUBLIC_API_URL_IOS=http://localhost:8080
   EXPO_PUBLIC_API_URL_ANDROID=http://10.0.2.2:8080
   EXPO_PUBLIC_GATEWAY_URL_IOS=http://localhost:8080
   EXPO_PUBLIC_GATEWAY_URL_ANDROID=http://10.0.2.2:8080
   EXPO_PUBLIC_ORDER_WS_URL_IOS=ws://localhost:8080/ws/kitchen
   EXPO_PUBLIC_ORDER_WS_URL_ANDROID=ws://10.0.2.2:8080/ws/kitchen
   EXPO_PUBLIC_WAITER_RESTAURANT_ID=1
   ```

3. Seed data (AuthService / MenuService):

   - At least one user with role `WAITER` (or `RESTAURANT_MANAGER`, `ADMIN`).
   - Menu items for `restaurantId=1` so the "Nueva orden" tab shows products.

## Scenarios

### 1. Role-based entry

- [ ] Log in with a `CUSTOMER` user → lands on `/(products-app)` (restaurant list).
- [ ] Log out, log in with a `WAITER` user → lands on `/(waiter-app)/(tabs)/active`.
- [ ] Re-open the app with an existing `WAITER` token → auto-routes to the
      waiter tabs (no flicker through the customer home).

### 2. New order flow (per-unit notes)

- [ ] In **Nueva orden**, pick a table (e.g. 5).
- [ ] Tap the same menu item twice → it appears as two draft units.
- [ ] Write different notes on each unit ("sin lechuga" vs "con todo").
- [ ] Add a general order note.
- [ ] Tap **Enviar a cocina** → success alert and tab switches to **Activas**.
- [ ] The new order shows as `Pendiente`. Verify items render grouped:
      `1x Hamburguesa · sin lechuga` and `1x Hamburguesa · con todo`.

### 3. Real-time kitchen events

- [ ] Open the dashboard's Chef Kitchen Portal in another browser as
      `RESTAURANT_MANAGER`/`CHEF` for the same restaurant.
- [ ] On the mobile **Activas** screen, confirm the pill shows **En vivo**.
- [ ] From the chef UI, move the order `PENDING → IN_PREPARATION`. The waiter
      card should update its status badge in under 1 s (no pull-to-refresh).
- [ ] From the chef UI, move the order to `READY`. Expect on mobile:
      - [ ] A green banner slides down with *"Pedido listo · Mesa 5"*.
      - [ ] Haptic feedback (success) fires on a physical device.
      - [ ] The order is now listed under the **Listas** tab.

### 4. Delivery and cancellation

- [ ] On **Listas**, tap **Entregada** → the order disappears from the tab;
      checking `/order/{id}` shows `DELIVERED`.
- [ ] Create another order, and from **Activas** tap **Cancelar** → confirm
      dialog, then the order disappears; backend shows `CANCELLED`.

### 5. Offline resilience

- [ ] Kill the OrderService container while the app is open on **Activas**.
- [ ] The pill should flip to **Offline** within a few seconds.
- [ ] Restart the container; the pill should return to **En vivo** without a
      restart of the app (reconnect delay ≈ 3 s).

### 6. Auth guard

- [ ] Log in with a `WAITER`, log out, then try to deep-link into
      `/(waiter-app)/(tabs)/active` → should be redirected to `/auth/login`.
- [ ] Log in with a `CUSTOMER` and deep-link into the same URL → redirected
      to `/` (customer home).

## Known constraints

- `EXPO_PUBLIC_WAITER_RESTAURANT_ID` is a hardcoded fallback until the waiter's
  restaurant can be inferred from a JWT claim.
- WebSockets do NOT pass through the API Gateway (MVC flavor of Spring Cloud
  Gateway does not support WS upgrade). This is intentional for MVP; see
  `backend/APIGateway/.../RouteConfig.java`.
