# Planio API Gateway

Punto de entrada único para todos los requests del frontend. Se encarga de:

1. **Verificar el token de Firebase** — si es inválido, responde 401 y el request nunca llega a los servicios.
2. **Inyectar la identidad del usuario** como headers internos (`x-user-uid`, `x-user-email`, `x-user-name`) para que los microservicios no necesiten verificar Firebase ellos mismos.
3. **Hacer proxy** de cada request al microservicio correcto según el prefijo de la URL.
4. **Proxy WebSocket** — las conexiones en tiempo real del notification_service también pasan por aquí.

## Tabla de rutas

| Prefijo (frontend llama a)    | Se redirige a                    | Protocolo    |
|-------------------------------|----------------------------------|--------------|
| `/activity/*`                 | `activity_service:8001/*`        | HTTP         |
| `/notifications/*`            | `notification_service:8002/*`    | HTTP + WS    |
| `/personalization/*`          | `personalization_service:8003/*` | HTTP         |

## Tecnologías

- **Node.js** + **Express**
- **http-proxy-middleware** — proxy HTTP y WebSocket
- **firebase-admin** — verificación de tokens
- **morgan** — logging de requests

## Estructura

```
gateway/
├── src/
│   ├── index.js                  # Entry point, definición de rutas
│   └── middleware/
│       └── auth.middleware.js    # Verifica token Firebase, inyecta headers
├── .env.example
├── Dockerfile
└── package.json
```

## Variables de entorno

Copiar `src/.env.example` a `src/.env` y completar:

```
PORT=8000
FIREBASE_PROJECT_ID=planio-social-todo
ACTIVITY_SERVICE_URL=http://activity_service:8001
NOTIFICATION_SERVICE_URL=http://notification_service:8002
PERSONALIZATION_SERVICE_URL=http://personalization_service:8003
```

Con Docker Compose las URLs internas ya están configuradas en el `docker-compose.yml`.

## Headers que inyecta el gateway

Después de verificar el token, el gateway agrega estos headers a cada request antes de hacer el proxy:

| Header          | Contenido                     |
|-----------------|-------------------------------|
| `x-user-uid`    | UID de Firebase (= google_id) |
| `x-user-email`  | Email del usuario             |
| `x-user-name`   | Nombre del usuario            |

Los microservicios deben leer estos headers para conocer la identidad del usuario, **sin verificar Firebase por su cuenta**.

## Cómo adaptar activity_service para leer los headers

El `auth.middleware.js` actual del activity_service verifica Firebase directamente. Una vez que el gateway esté corriendo, ese middleware se simplifica para leer los headers internos:

```js
// activity_service/src/middleware/auth.middleware.gateway.js
const pool = require('../db/connection');

const authMiddleware = async (req, res, next) => {
  const uid   = req.headers['x-user-uid'];
  const email = req.headers['x-user-email'];

  if (!uid) {
    return res.status(401).json({ error: 'Missing identity headers' });
  }

  const result = await pool.query('SELECT id FROM users WHERE google_id = $1', [uid]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'User not registered' });
  }

  req.user = { uid, email, db_id: result.rows[0].id };
  next();
};

module.exports = authMiddleware;
```

## WebSocket (notificaciones en tiempo real)

El gateway hace proxy transparente de conexiones WebSocket hacia `notification_service`. El frontend se conecta así:

```js
// El frontend conecta al gateway, no al notification_service directamente
const socket = new WebSocket('ws://localhost:8000/notifications/ws?token=<firebase_id_token>');
```

El gateway verifica el token del query param `token` antes de elevar la conexión WebSocket. El notification_service recibe la conexión ya autenticada con los headers `x-user-uid` y `x-user-email`.

## Levantar en local (sin Docker)

```bash
cd backend/gateway
cp src/.env.example src/.env   # completar variables
npm install
npm run dev
```

## Levantar con Docker Compose

Desde la raíz del proyecto:

```bash
docker-compose up --build
```

El gateway queda en `http://localhost:8000`.

Hola
