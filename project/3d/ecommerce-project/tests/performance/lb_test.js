import http from 'k6/http';
import { check, sleep } from 'k6';

// Ejecutar: k6 run tests/performance/lb_test.js
// Para activar load balancing real, levantar con:
//   docker compose -f docker-compose.yml -f docker-compose.lb.yml up -d
const BASE = 'https://localhost:8443';

export const options = {
  stages: [
    { duration: '10s', target: 20 },   // ramp-up
    { duration: '30s', target: 50 },   // carga sostenida — 50 VUs
    { duration: '10s', target: 0  },   // ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<400'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(
    `${BASE}/products/?page=1&page_size=20`,
    { insecureSkipTLSVerify: true }
  );
  check(res, {
    'status 200': (r) => r.status === 200,
    'tiene items': (r) => {
      try { return JSON.parse(r.body).length > 0; } catch { return false; }
    },
  });
  sleep(0.5);
}
