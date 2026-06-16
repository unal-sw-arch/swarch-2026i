import http from 'k6/http';
import { check, sleep } from 'k6';

// Ejecutar: k6 run --env TOKEN=<jwt> tests/performance/cache_test.js
const TOKEN = __ENV.TOKEN || '';
const BASE  = 'https://localhost:8443';

export const options = {
  scenarios: {
    // Cold: caché vacía — mide latencia sin caché
    cold_cache: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
    },
    // Warm: caché ya poblada — mide latencia con caché caliente
    warm_cache: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '35s',
    },
  },
  thresholds: {
    'http_req_duration{scenario:warm_cache}': ['p(95)<200'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function () {
  const res = http.post(
    `${BASE}/ai/chat/`,
    JSON.stringify({ message: 'recomiéndame algo económico' }),
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      insecureSkipTLSVerify: true,
    }
  );
  check(res, {
    'status 200': (r) => r.status === 200,
    'tiene respuesta': (r) => {
      try { return JSON.parse(r.body).response?.length > 0; } catch { return false; }
    },
  });
  sleep(1);
}
