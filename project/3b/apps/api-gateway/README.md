# API Gateway

Gateway HTTP en Node.js + TypeScript + Express. Su proposito es ser el punto unico de entrada del frontend hacia los microservicios, manteniendo un contrato publico estable y delegando la logica real a los servicios duenios.

## Responsabilidades

- Recibir requests del frontend y reenviarlos al microservicio correspondiente.
- Validar headers basicos de acceso en rutas privadas.
- Propagar `Authorization` cuando aplica.
- Generar y propagar `x-request-id`.
- Normalizar errores tecnicos del gateway y de upstream.
- Aplicar cache opcional y selectiva solo en endpoints GET publicos de bajo riesgo.
- Resolver configuracion por entorno desde `src/app/config/env.ts`.

## Fuera de alcance

- Implementar logica de negocio.
- Emitir JWT.
- Persistir transacciones.
- Exponer URLs internas de microservicios al frontend.
- Cambiar el contrato publico entre entornos.

## Rutas soportadas

- `GET /health`
- `POST /auth/register/customer`
- `POST /auth/login/customer`
- `POST /auth/login/restaurant`
- `GET /auth/me`
- `GET /restaurants`
- `GET /restaurants/:id/menu`
- `PATCH /menu-items/:id/availability`
- `POST /orders`
- `GET /orders/:id`
- `GET /customers/me/orders`
- `GET /restaurants/me/orders`
- `GET /kitchen/orders`
- `PATCH /kitchen/orders/:id/status`
- `GET /orders/:id/timeline`
- `GET /promotions/active`
- `GET /recommendations`

## Variables de entorno

`src/app/config/env.ts` es la unica fuente real de configuracion. Ningun otro archivo debe leer `process.env` directamente.

- `NODE_ENV`
- `PORT`
- `LOG_LEVEL`
- `BODY_LIMIT`
- `HTTP_TIMEOUT_MS`
- `AUTH_SERVICE_URL`
- `CATALOG_SERVICE_URL`
- `ORDER_SERVICE_URL`
- `KITCHEN_SERVICE_URL`
- `TIMELINE_SERVICE_URL`
- `PROMOTIONS_SERVICE_URL`
- `CACHE_ENABLED`
- `REDIS_URL`
- `CACHE_TTL_RESTAURANTS`
- `CACHE_TTL_MENU`
- `CACHE_TTL_PROMOTIONS`
- `USE_MOCK_SERVICES`

## Ejecucion

Local:

```bash
npm install
npm run dev
```

Build compilado:

```bash
npm run build
npm start
```

Docker:

```bash
docker build -t api-gateway .
docker run --rm -p 3000:3000 --env-file .env api-gateway
```

Docker Compose:

```bash
docker compose up --build
```

## Notas reales de integracion

- El frontend debe hablar solo con el gateway.
- Las URLs de microservicios se resuelven por configuracion; no deben hardcodearse en modulos ni clientes.
- `Authorization` es obligatorio en rutas privadas y debe enviarse como `Bearer <token>`.
- `x-request-id` es opcional inbound; si no llega, el gateway lo genera y siempre lo propaga outbound.
- La cache actual solo aplica a `GET /restaurants`, `GET /restaurants/:id/menu` y `GET /promotions/active`.
- Redis es opcional. Si falla o no esta habilitado, el gateway sigue funcionando sin cache.
- `USE_MOCK_SERVICES` queda centralizado como bandera de configuracion para integracion futura.
