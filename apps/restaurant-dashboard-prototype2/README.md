# Restaurant Dashboard

Restaurant Dashboard en React + TypeScript para operar pedidos, cocina y catálogo de un restaurante. Esta entrega cierra la Fase 10 con documentación técnica, alcance implementado, plan de QA manual y contratos esperados para la integración con backend.

## Overview

La aplicación está pensada para uso interno de un restaurante dentro de una plataforma distribuida. El flujo actual cubre autenticación de restaurante, consulta de pedidos, cola de cocina, cambios de estado de pedidos y actualización de disponibilidad de productos.

La arquitectura ya está preparada para alternar entre repositorios mock y API real mediante configuración de entorno, sin cambiar las pantallas ni los hooks de consumo.

## Implemented Scope

- Login de restaurante.
- Protección de rutas privadas con sesión persistida en `localStorage`.
- Visualización de pedidos del restaurante.
- Visualización de la cola de cocina.
- Cambio de estado de pedidos desde la vista de cocina.
- Visualización del menú del restaurante.
- Cambio de disponibilidad de productos.
- Separación de repositorios mock y API real.
- Capa de `httpClient` con `axios`, token bearer y normalización de errores.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Zod
- Tailwind CSS

## Project Structure

La estructura principal del proyecto es la siguiente:

- `src/app`: configuración global, layout, router, store y providers.
- `src/features/auth`: login y sesión.
- `src/features/orders`: listado de pedidos.
- `src/features/kitchen`: cola de cocina y cambio de estado.
- `src/features/products`: menú y disponibilidad.
- `src/services`: `httpClient`, adaptadores y repositorios API.
- `src/mocks`: datos y repositorios mock con estado en memoria.
- `src/shared`: componentes reutilizables, constantes y utilidades.

## Setup / Install / Run

Requisitos:

- Node.js instalado.
- npm disponible.

Instalación:

```bash
npm install
```

Ejecución local:

```bash
npm run dev
```

Build de producción:

```bash
npm run build
```

Preview del build:

```bash
npm run preview
```

## Environment Variables

Variables soportadas por la app:

- `VITE_API_BASE_URL`: base URL del backend. Valor por defecto: `http://localhost:3000`.
- `VITE_DATA_SOURCE`: origen de datos. Valores soportados: `mock` o `api`. Valor por defecto: `mock`.

Comportamiento:

- Si `VITE_DATA_SOURCE=mock`, la app usa repositorios mock.
- Si `VITE_DATA_SOURCE=api`, la app usa repositorios reales vía HTTP.

## Switching Between Mock and API

El selector de repositorios vive en `src/services/repositories/index.ts` y se controla con `ENV.dataSource`.

Para usar mocks:

```env
VITE_DATA_SOURCE=mock
```

Para usar API real:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3000
```

La capa de UI no cambia entre modos. Solo cambia la implementación detrás de los repositorios.

## Main Available Flows

- Login de restaurante con persistencia de sesión.
- Acceso a `Orders`, `Kitchen` y `Products` desde rutas protegidas.
- Refresh manual de listas.
- Cambio de estado de pedidos en cocina.
- Cambio de disponibilidad de productos del menú.
- Logout desde la app para limpiar la sesión.

## Expected Backend Contracts

La integración API está preparada para tolerar variaciones de nombres `snake_case` y `camelCase` en algunos contratos, pero estos son los endpoints esperados.

### Auth

- `POST /auth/login/restaurant`
- Body esperado:

```json
{
  "email": "restaurant@example.com",
  "password": "secret"
}
```

- Respuesta esperada:

```json
{
  "accessToken": "string",
  "role": "restaurant",
  "restaurantId": 1,
  "userId": 10
}
```

Compatibilidad aceptada por el adaptador:

- `accessToken` o `token`
- `restaurantId` o `restaurant_id`
- `userId` o `user_id`

### Orders

- `GET /restaurants/me/orders`
- También se acepta respuesta como array directo o como envoltorio con `items` o `data.items`.

Cada orden debe incluir al menos:

- `id`
- `customerId` o `customer_id`
- `restaurantId` o `restaurant_id`
- `status`
- `totalAmount` o `total_amount`
- `createdAt` o `created_at`

### Kitchen

- `GET /kitchen/orders`
- `PATCH /kitchen/orders/:orderId/status`

Body esperado para update:

```json
{
  "status": "in_preparation"
}
```

Respuesta esperada del update:

```json
{
  "orderId": 123,
  "status": "ready",
  "message": "Updated successfully"
}
```

Estados válidos en cocina:

- `created`
- `in_preparation`
- `ready`

### Products

- `GET /restaurants/:restaurantId/menu`
- `PATCH /menu-items/:productId/availability`

Body esperado para update:

```json
{
  "isAvailable": true
}
```

Respuesta esperada del update:

```json
{
  "id": 45,
  "isAvailable": false,
  "message": "Updated successfully"
}
```

Cada producto debe incluir:

- `id`
- `name`
- `description`
- `price`
- `isAvailable` o `is_available`
- `restaurantId` o `restaurant_id`

### Orders Status Update

La implementación API actual de `updateOrderStatus` valida existencia con `GET /orders/:orderId` y luego usa `PATCH /kitchen/orders/:orderId/status` para los estados de cocina soportados.

## Known Limitations

- La app depende del backend real del equipo para operar en modo `api`.
- En modo `mock`, los repositorios usan datos en memoria y no persisten fuera de la sesión del navegador.
- Si el contrato final del backend cambia, pueden requerirse ajustes en los adaptadores de `src/services/adapters`.
- No hay realtime ni suscripción a eventos; las pantallas se actualizan por refresh manual y por invalidación de queries tras mutaciones.
- Esta fase entrega documentación y QA manual; no incluye una suite de tests automatizados.

## Documentation Links

- [QA checklist](docs/qa-checklist.md)
- [Manual test plan](docs/manual-test-plan.md)
- [Demo flow](docs/demo-flow.md)