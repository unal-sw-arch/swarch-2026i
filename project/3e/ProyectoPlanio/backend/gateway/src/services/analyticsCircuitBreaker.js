// backend/gateway/src/services/analyticsCircuitBreaker.js
const CircuitBreaker = require('opossum');
const http = require('http');

const requestAnalytics = ({ method, path, body, headers }) =>
  new Promise((resolve, reject) => {
    const baseUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8004';
    const parsed  = new URL(path, baseUrl);

    const options = {
      hostname : parsed.hostname,
      port     : parsed.port || 80,
      path     : parsed.pathname + parsed.search,
      method   : method || 'GET',
      headers  : { 'Content-Type': 'application/json', ...headers },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 500) {
          return reject(new Error(`Analytics respondió ${res.statusCode}`));
        }
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.setTimeout(5000, () => {
      req.destroy(new Error('Timeout: Analytics Service no respondió en 5s'));
    });

    req.on('error', reject);

    if (body && method !== 'GET') {
      req.write(JSON.stringify(body));
    }
    req.end();
  });


const breakerOptions = {
  timeout                  : 5000,   
  errorThresholdPercentage : 50,     
  resetTimeout             : 60000,  
  volumeThreshold          : 3,      
  rollingCountTimeout      : 10000,  
};

const breaker = new CircuitBreaker(requestAnalytics, breakerOptions);


breaker.on('open',     () => console.error('[Analytics CB] CIRCUITO ABIERTO — bloqueado 60s'));
breaker.on('halfOpen', () => console.warn('[Analytics CB] SEMI-ABIERTO — probando recuperacion'));
breaker.on('close',    () => console.log('[Analytics CB] CIRCUITO CERRADO — servicio recuperado'));


breaker.fallback(() => ({
  statusCode : 503,
  body       : JSON.stringify({ error: 'Analytics temporalmente no disponible', retryAfter: 60 }),
  isFallback : true,
}));


const RETRY_DELAYS = [500, 1000, 5000, 10000, 30000];


const callAnalytics = async ({ method, path, body, headers }) => {
  let lastError;

  for (let i = 0; i < RETRY_DELAYS.length; i++) {
    try {
      const result = await breaker.fire({ method, path, body, headers });
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[Analytics CB] Intento ${i + 1}/5 fallido: ${err.message}`);

      if (breaker.opened) {
        console.error('[Analytics CB] Circuito abierto — abortando reintentos');
        break;
      }

      if (i < RETRY_DELAYS.length - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[i]));
      }
    }
  }

  console.error('[Analytics CB] Todos los reintentos agotados:', lastError?.message);
  return {
    statusCode : 503,
    body       : JSON.stringify({ error: 'Analytics no disponible tras 5 reintentos', retryAfter: 60 }),
    isFallback : true,
  };
};

module.exports = { callAnalytics, breaker };