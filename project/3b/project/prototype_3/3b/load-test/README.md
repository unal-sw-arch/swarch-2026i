# Performance Testing (k6)

Pruebas de carga para los escenarios de **Performance & Scalability** de DELIUNAL.

## Requisitos

- El stack debe estar arriba: `docker compose up -d` (desde la raíz del repo).
- k6 instalado, **o** usar la imagen `grafana/k6` con Docker (no requiere instalar nada).

## Escenario P1 — Cache (comparativa ON vs OFF)

El objetivo es demostrar el patrón **Caching**: medir `GET /restaurants` a través
del gateway con el cache desactivado y luego activado.

### 1. Medición con cache OFF (baseline)

`CACHE_ENABLED=false` es el valor por defecto en `docker-compose.yml`.

```powershell
docker run --rm -i --network host grafana/k6 run -e BASE_URL=http://localhost:4000 - < catalog.js
```

> En Windows/Mac, si `--network host` no funciona, usa
> `-e BASE_URL=http://host.docker.internal:4000` y quita `--network host`.

Anota: `http_req_duration` (avg, p95, p99) y `http_reqs` (throughput).

### 2. Medición con cache ON

Edita `docker-compose.yml` → servicio `api-gateway` → `CACHE_ENABLED=true`
(y `CACHE_ENABLED=true` requiere que `valkey-cache` esté arriba, ya lo está).
Recrea el gateway:

```powershell
docker compose up -d --no-deps api-gateway
```

Repite la misma corrida de k6 y compara.

### 3. Resultados (50 VUs, ~70s, ~2.770 iteraciones)

| Métrica                | Cache OFF | Cache ON | Mejora |
|------------------------|-----------|----------|--------|
| Latencia avg (ms)      | 3.98      | 2.02     | −49%   |
| Latencia p90 (ms)      | 4.82      | 2.36     | −51%   |
| Latencia p95 (ms)      | 5.41      | 2.61     | −52%   |
| Latencia max (ms)      | 27.60     | 20.75    | −25%   |
| Throughput (req/s)     | 39.13     | 39.27    | ≈      |
| % errores              | 0.00%     | 0.00%    | —      |

El cache reduce la latencia ~50%. El throughput es equivalente porque el
`sleep(1)` por VU fija el techo en ~50 req/s; el patrón se evidencia en la
latencia.

## Escenario P2 — Load Balancer (escalado en K8s)

Demostrar que el throughput escala al aumentar réplicas del gateway tras el
Service de Kubernetes.

```powershell
# Desplegar en K8s (ver infrastructure/kubernetes/README.md)
kubectl scale deployment api-gateway --replicas=2 -n deliunal
docker run --rm -i --network host grafana/k6 run -e BASE_URL=http://localhost:30080 - < catalog.js

kubectl scale deployment api-gateway --replicas=4 -n deliunal
docker run --rm -i --network host grafana/k6 run -e BASE_URL=http://localhost:30080 - < catalog.js
```

| Réplicas | Throughput (req/s) | p95 (ms) |
|----------|--------------------|----------|
| 2        |                    |          |
| 4        |                    |          |

## Escenario P3 — Throttling / Rate Limiting (JMeter)

Demostrar que el gateway limita la tasa por IP: hasta `THROTTLE_LIMIT` (100)
peticiones por ventana (60s) responden 200 y el excedente recibe **429**.

Plan: [throttle-test.jmx](./throttle-test.jmx) — grupos de hilos de 1, 50 y 200
contra `GET /restaurants`.

```powershell
# Requiere Apache JMeter instalado.
jmeter -n -t throttle-test.jmx -JHOST=localhost -JPORT=4000 -l throttle-results.jtl
```

Verificación rápida sin JMeter (PowerShell): 115 peticiones seguidas →
~100 con 200 y ~15 con 429.

```powershell
1..115 | ForEach-Object { curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:4000/restaurants } | Group-Object | Select-Object Name, Count
```

**Resultado verificado:** 100× HTTP 200 + 15× HTTP 429 (headers `X-RateLimit-*`,
`Retry-After`).
