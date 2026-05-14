require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const admin   = require('firebase-admin');
const { createProxyMiddleware } = require('http-proxy-middleware');

const authMiddleware = require('./middleware/auth.middleware');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 8000;

// ─── URLs de los servicios ────────────────────────────────────────────────────
const SERVICES = {
  activity:        process.env.ACTIVITY_SERVICE_URL        || 'http://localhost:8001',
  notification:    process.env.NOTIFICATION_SERVICE_URL    || 'http://localhost:8002',
  personalization: process.env.PERSONALIZATION_SERVICE_URL || 'http://localhost:8003',
  analytics:       process.env.ANALYTICS_SERVICE_URL       || 'http://localhost:8004',
  chat:            process.env.CHAT_SERVICE_URL             || 'http://localhost:8005',
};

// ─── Firebase Admin ───────────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));

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
  ws: true,
  on: {
    error: (err, _req, res) => {
      console.error('[Gateway] Notification proxy error:', err.message);
      if (res && res.status) {
        res.status(502).json({ error: 'Notification service unavailable' });
      }
    },
  },
});

// ─── Middleware que inyecta el db_id del usuario como header ──────────────────
// El chat_service no tiene acceso a PostgreSQL, así que el gateway
// le pasa el db_id que ya resolvió el authMiddleware.
const makeChatProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { '^\/chat': '' },
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.user) {
          proxyReq.setHeader('x-user-db-id',  String(req.user.db_id));
          proxyReq.setHeader('x-user-uid',    req.user.uid   || '');
          proxyReq.setHeader('x-user-name',   req.user.name  || req.user.email || '');
          proxyReq.setHeader('x-user-email',  req.user.email || '');
        }
      },
      error: (err, _req, res) => {
        console.error('[Gateway] Chat proxy error:', err.message);
        res.status(502).json({ error: 'Chat service unavailable' });
      },
    },
  });

// ─── Rutas protegidas (HTTP) ──────────────────────────────────────────────────

app.use(
  '/activity',
  authMiddleware,
  makeProxy(SERVICES.activity, { '^/activity': '' })
);

app.use(
  '/notifications',
  authMiddleware,
  notificationProxy
);

app.use(
  '/personalization',
  authMiddleware,
  makeProxy(SERVICES.personalization, { '^/personalization': '' })
);

app.use('/chat', authMiddleware, makeChatProxy(SERVICES.chat));

app.use(
  '/analytics',
  authMiddleware,
  makeProxy(SERVICES.analytics, { '^/analytics': '' })
);

// ─── WebSocket upgrade ────────────────────────────────────────────────────────
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

    req.headers['x-user-uid']   = decoded.uid;
    req.headers['x-user-email'] = decoded.email || '';
    req.headers['x-user-name']  = decoded.name  || decoded.email || '';

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
  console.log(`[Gateway] Chat            -> ${SERVICES.chat}`);
});