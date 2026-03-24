require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const admin   = require('firebase-admin');
const { createProxyMiddleware } = require('http-proxy-middleware');

const authMiddleware = require('./middleware/auth.middleware');

const app    = express();
const server = http.createServer(app);  // servidor HTTP propio (necesario para WebSocket)
const PORT   = process.env.PORT || 8000;

// ─── URLs de los servicios ────────────────────────────────────────────────────
const SERVICES = {
  activity:        process.env.ACTIVITY_SERVICE_URL        || 'http://localhost:8001',
  notification:    process.env.NOTIFICATION_SERVICE_URL    || 'http://localhost:8002',
  personalization: process.env.PERSONALIZATION_SERVICE_URL || 'http://localhost:8003',
};

// ─── Firebase Admin (para verificar tokens WS en el upgrade handler) ─────────
if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));

// IMPORTANTE: no usar express.json() aquí.
// http-proxy-middleware necesita el body crudo (stream); si express lo parsea
// antes, el proxy recibe el body vacío.

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway', timestamp: new Date().toISOString() });
});

// ─── Helper: crear proxy HTTP ─────────────────────────────────────────────────
const makeProxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err, _req, res) => {
        console.error(`[Gateway] Proxy error -> ${target}:`, err.message);
        res.status(502).json({ error: 'Service unavailable', detail: err.message });
      },
    },
  });

// ─── Proxy para notification_service (HTTP + WebSocket) ──────────────────────
const notificationProxy = createProxyMiddleware({
  target: SERVICES.notification,
  changeOrigin: true,
  pathRewrite: { '^/notifications': '' },
  ws: true,   // habilita proxy de WebSocket
  on: {
    error: (err, _req, res) => {
      console.error('[Gateway] Notification proxy error:', err.message);
      if (res && res.status) {
        res.status(502).json({ error: 'Notification service unavailable' });
      }
    },
  },
});

// ─── Rutas protegidas (HTTP) ──────────────────────────────────────────────────

app.use(
  '/activity',
  authMiddleware,
  makeProxy(SERVICES.activity, { '^/activity': '' })
  // GET /activity/rooms  ->  GET http://activity_service:8001/rooms
);

app.use(
  '/notifications',
  authMiddleware,
  notificationProxy
  // POST /notifications/...  ->  http://notification_service:8002/...
);

app.use(
  '/personalization',
  authMiddleware,
  makeProxy(SERVICES.personalization, { '^/personalization': '' })
  // GET /personalization/avatar  ->  GET http://personalization_service:8003/avatar
);

// ─── WebSocket upgrade para notificaciones ────────────────────────────────────
// El frontend conecta: new WebSocket('ws://localhost:8000/notifications/ws?token=...')
// El gateway verifica el token del query param antes de elevar la conexión.
server.on('upgrade', async (req, socket, head) => {
  if (!req.url.startsWith('/notifications')) {
    socket.destroy();
    return;
  }

  const url   = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Inyectar identidad como headers para que notification_service sepa quién es
    req.headers['x-user-uid']   = decoded.uid;
    req.headers['x-user-email'] = decoded.email || '';
    req.headers['x-user-name']  = decoded.name  || decoded.email || '';

    // Reescribir la URL: /notifications/ws -> /ws
    req.url = req.url.replace(/^\/notifications/, '');

    console.log(`[Gateway] WS upgrade autorizado para uid=${decoded.uid}`);
    notificationProxy.upgrade(req, socket, head);

  } catch (err) {
    console.error('[Gateway] WS token invalido:', err.message);
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
});

// ─── Ruta no encontrada ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found in gateway` });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT}`);
  console.log(`[Gateway] Activity        -> ${SERVICES.activity}`);
  console.log(`[Gateway] Notifications   -> ${SERVICES.notification}  (HTTP + WebSocket)`);
  console.log(`[Gateway] Personalization -> ${SERVICES.personalization}`);
});
