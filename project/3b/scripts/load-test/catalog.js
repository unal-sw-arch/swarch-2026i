import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

/**
 * Performance test — Escenario P1 (Cache de lecturas en el gateway).
 *
 * Mide latencia y throughput de GET /restaurants a través del API Gateway.
 * Se ejecuta DOS veces para comparar el patrón Caching:
 *   - Cache OFF (CACHE_ENABLED=false): cada petición golpea al Catalog Service.
 *   - Cache ON  (CACHE_ENABLED=true) : el gateway responde desde Valkey.
 *
 * Uso:
 *   k6 run -e BASE_URL=http://localhost:4000 catalog.js
 *   # o vía Docker (sin instalar k6):
 *   docker run --rm -i --network host grafana/k6 run -e BASE_URL=http://localhost:4000 - < catalog.js
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

const latency = new Trend('catalog_latency', true);

export const options = {
  stages: [
    { duration: '20s', target: 50 }, // ramp-up
    { duration: '40s', target: 50 }, // carga sostenida
    { duration: '10s', target: 0 },  // ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // < 1% de errores
    http_req_duration: ['p(95)<500'], // objetivo: p95 < 500ms
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/restaurants`);

  latency.add(res.timings.duration);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
