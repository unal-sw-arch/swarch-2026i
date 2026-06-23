# Performance Tests — AICart Prototype 3

Scripts k6 para los escenarios de Performance & Scalability del Prototype 3.

## Requisitos

```bash
# Instalar k6
# Arch Linux:
yay -S k6
# O con binario oficial:
# https://k6.io/docs/get-started/installation/
```

## Preparación

```bash
# 1. Levantar el stack
docker compose up -d --build

# 2. Obtener un JWT válido
TOKEN=$(curl -sk -X POST https://localhost:8443/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"tu@email.com","password":"TuPassword1!"}' | jq -r .access_token)
```

## Escenario A — PERF-01: Cache Pattern

Mide la diferencia de latencia con caché fría vs caché caliente en el AI Service.

```bash
k6 run --env TOKEN=$TOKEN tests/performance/cache_test.js
```

**Salida esperada:**
- `scenario:cold_cache` p95 ≈ 400-500 ms (llama a user-service + order-service)
- `scenario:warm_cache` p95 < 200 ms (sirve desde Redis)

## Escenario B — PERF-02: Load Balancer Pattern

Mide throughput de `/products/` bajo carga de 50 VUs. Para ver el efecto del load balancer, comparar con y sin réplicas:

```bash
# Con 1 réplica (configuración estándar)
k6 run tests/performance/lb_test.js

# Con 2 réplicas (activar docker-compose.lb.yml primero)
docker compose -f docker-compose.yml -f docker-compose.lb.yml up -d --build
k6 run tests/performance/lb_test.js
```

**Salida esperada con 2 réplicas:**
- Throughput ≈ 1.9× respecto a 1 réplica
- p95 < 200 ms bajo 50 VUs
