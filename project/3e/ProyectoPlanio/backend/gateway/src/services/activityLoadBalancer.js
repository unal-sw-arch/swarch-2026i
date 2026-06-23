// backend/gateway/src/services/activityLoadBalancer.js
const { createProxyMiddleware } = require('http-proxy-middleware');

const PRIMARY_URL   = process.env.ACTIVITY_SERVICE_URL || 'http://activity_service:8001';
const SPARE_URL     = process.env.ACTIVITY_SPARE_URL   || 'http://activity_service_spare:8001';
const THRESHOLD_RPS = parseInt(process.env.LB_THRESHOLD_RPS || '6000', 10);

// ─── Estado ───────────────────────────────────────────────────────────────────
let requestsThisSecond = 0;
let spareActive        = false;
let spareReady         = false;
let activatingSpare    = false;
const pendingQueue     = [];

// ─── Heartbeat: mide req/s cada segundo ──────────────────────────────────────
setInterval(async () => {
  const rps = requestsThisSecond;
  requestsThisSecond = 0;

  if (rps > 0) {
    console.log(`[LB] Heartbeat: ${rps} req/s | spare: ${spareActive ? 'ACTIVO' : 'en espera'}`);
  }

  if (rps >= THRESHOLD_RPS && !spareActive && !activatingSpare) {
    console.warn(`[LB] ⚠ Saturación: ${rps} req/s >= ${THRESHOLD_RPS}. Activando Cold Spare...`);
    activateColdSpare();
  }
}, 1000);

// ─── Activación del Cold Spare ────────────────────────────────────────────────
async function activateColdSpare() {
  activatingSpare = true;
  const deadline  = Date.now() + 3 * 60 * 1000;

  while (Date.now() < deadline) {
    const ok = await checkHealth(SPARE_URL);
    if (ok) {
      spareReady      = true;
      spareActive     = true;
      activatingSpare = false;
      console.log('[LB] ✅ Cold Spare listo. Distribuyendo carga entre primary y spare.');
      flushPendingQueue();
      return;
    }
    console.log('[LB] Esperando que el spare responda /health...');
    await sleep(2000);
  }

  console.error('[LB] ❌ Spare no respondió en 3 minutos.');
  activatingSpare = false;
}

// ─── Health check ─────────────────────────────────────────────────────────────
const http = require('http');
function checkHealth(baseUrl) {
  return new Promise((resolve) => {
    const parsed = new URL('/health', baseUrl);
    const req = http.get(
      { hostname: parsed.hostname, port: parsed.port || 8001, path: '/health', timeout: 2000 },
      (res) => resolve(res.statusCode === 200)
    );
    req.on('error',   () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function flushPendingQueue() {
  console.log(`[LB] Vaciando ${pendingQueue.length} peticiones encoladas.`);
  while (pendingQueue.length > 0) pendingQueue.shift()();
}

// ─── Round-robin ──────────────────────────────────────────────────────────────
let turn = 0;
function selectTarget() {
  if (!spareActive || !spareReady) return PRIMARY_URL;
  turn = (turn + 1) % 2;
  return turn === 0 ? PRIMARY_URL : SPARE_URL;
}

// ─── Proxies reutilizables (uno por target) ───────────────────────────────────
// Usamos http-proxy-middleware igual que el resto del gateway.
// router dinámico: decide el target en cada petición.
const proxy = createProxyMiddleware({
  changeOrigin : true,
  pathRewrite  : { '^/activity': '' },
  router       : (_req) => selectTarget(),   // ← aquí está la clave
  on: {
    error: (err, _req, res) => {
      console.error('[LB] Proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Activity Service no disponible', detail: err.message });
      }
    },
  },
});

// ─── Middleware Express ───────────────────────────────────────────────────────
function activityLoadBalancer(req, res, next) {
  requestsThisSecond++;

  if (activatingSpare) {
    console.warn('[LB] Spare arrancando — petición encolada.');
    pendingQueue.push(() => proxy(req, res, next));
    return;
  }

  proxy(req, res, next);
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function getLoadBalancerStats() {
  return {
    spareActive,
    spareReady,
    activatingSpare,
    pendingRequests    : pendingQueue.length,
    currentThresholdRps: THRESHOLD_RPS,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
module.exports = { activityLoadBalancer, getLoadBalancerStats };