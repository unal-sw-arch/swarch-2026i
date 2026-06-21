# Lab 5 — Security Patterns

**Curso:** Software Architecture 2025-II  
**Fecha:** Junio 2026  
**Proyecto:** AICart — E-Commerce Microservices Platform

---

## Objetivo

Diseñar e implementar una arquitectura segura aplicando tres patrones de seguridad fundamentales sobre el sistema de e-commerce existente, complementado con rate limiting sobre el AI Service y pruebas de carga con JMeter.

---

## Cómo ejecutar

```bash
# 1. Generar certificado TLS (solo la primera vez)
bash generate_certs.sh

# 2. Levantar el stack
docker compose up -d --build

# 3. Confiar el certificado en el navegador (solo la primera vez)
#    Abrir en el browser: https://localhost:8443/health
#    → click "Avanzado" → "Continuar a localhost (no seguro)"
#    El browser recordará la excepción; no hace falta repetir este paso.

# 4. Abrir la aplicación
#    http://localhost:3000
```

> **Nota:** El certificado es autofirmado (entorno de desarrollo). El paso 3 es necesario una única vez por navegador para que el frontend pueda comunicarse con el gateway por HTTPS sin que el browser bloquee la conexión.

---

## Patrones Implementados

### 1. Network Segmentation Pattern

**Definición**  
Particiona la red en segmentos aislados para limitar el acceso no autorizado y contener amenazas. Sigue el modelo zero-trust donde ningún componente confía implícitamente en otro.

**Implementación**  
Se definieron dos redes virtuales en Docker Compose:

| Red | Zona | Contenedores |
|---|---|---|
| `subnet_a` (`172.20.0.0/24`) | Pública | Frontend (Next.js), API Gateway (NGINX) |
| `subnet_b` (`172.20.1.0/24`) | Privada | Auth, User, Product, Order, AI services + todas las DBs + Redis + RabbitMQ |

El API Gateway (NGINX) es el **único contenedor conectado a ambas redes**, actuando como puente controlado. Ningún servicio backend tiene puertos expuestos al host.

```yaml
networks:
  subnet_a:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24   # Zona pública
  subnet_b:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.1.0/24   # Zona privada
```

**Beneficio:** Un atacante que comprometa el frontend no puede alcanzar directamente las bases de datos ni los servicios internos.

---

### 2. Reverse Proxy Pattern

**Definición**  
Un servidor intermediario (NGINX) se sitúa entre los clientes externos y los servicios internos. Los clientes nunca acceden directamente al backend.

**Implementación**  
NGINX actúa como único punto de entrada público, enrutando por path:

| Path público | Servicio interno | Puerto interno |
|---|---|---|
| `/auth/*` | auth-service | 8001 |
| `/users/*` | user-service | 8000 |
| `/products/*` | product-service | 8003 |
| `/orders/*` | order-service | 8004 |
| `/ai/*` | ai-service | 8005 |

```nginx
location /ai/ {
    set $upstream_ai "ai-service";
    proxy_pass http://$upstream_ai:8005;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Beneficio:** Oculta la topología interna, centraliza CORS, headers de seguridad y SSL termination en un solo punto.

---

### 3. Secure Channel Pattern

**Definición**  
Protege los datos en tránsito estableciendo un canal cifrado mediante TLS/HTTPS, previniendo eavesdropping y tampering.

**Implementación**  
TLS configurado en NGINX con certificado autofirmado (RSA 2048, CN=localhost):

- Puerto `8000` → redirige con `301` a HTTPS
- Puerto `8443` → HTTPS con TLS 1.2/1.3

```nginx
server {
    listen 8000;
    return 301 https://$host:8443$request_uri;
}

server {
    listen 8443 ssl;
    ssl_certificate     /etc/nginx/certs/nginx.crt;
    ssl_certificate_key /etc/nginx/certs/nginx.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

**Beneficio:** Todo el tráfico entre clientes y el gateway viaja cifrado. HTTP queda bloqueado por redirección forzada.

---

## Rate Limiting (AI Service)

El AI Service consume un modelo LLM externo (Groq), haciendo cada request costoso en tiempo y dinero. Se implementó una doble capa de rate limiting:

### Capa 1 — NGINX (por IP)

```nginx
limit_req_zone $binary_remote_addr zone=ai_zone:10m rate=2r/s;

location /ai/ {
    limit_req        zone=ai_zone burst=5 nodelay;
    limit_req_status 429;
}
```

### Capa 2 — Redis Sliding Window (por usuario o IP)

Middleware en `backend/AI_service/src/core/rate_limit.py`:
- **Límite:** 10 requests por ventana de 60 segundos
- **Identificador:** JWT `sub` (usuario autenticado) o IP como fallback
- **Algoritmo:** Sliding window con sorted sets de Redis

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1748823600
Retry-After: 60  (solo en respuestas 429)
```

---

## Evidencias de Funcionamiento

### Secure Channel — Redirección HTTP → HTTPS

```bash
$ curl -I http://localhost:8000/health

HTTP/1.1 301 Moved Permanently
Location: https://localhost:8443/health
Server: nginx/1.27.5
```

### Reverse Proxy + HTTPS funcionando

```bash
$ curl -k https://localhost:8443/health

{"status":"ok","service":"api-gateway"}
```

### Rate Limiting activado (requests en paralelo)

```bash
$ for i in {1..10}; do
    curl -k -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://localhost:8443/ai/chat/ \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}' &
  done; wait

200  200  200  200  200  429  429  429  429  429
```

---

## Pruebas de Carga — JMeter

**Herramienta:** Apache JMeter 5.6.3  
**Target:** `https://localhost:8443/ai/chat/`  
**Plan de pruebas:** `lab5_ai_load_test_v2.jmx`

Se ejecutaron 8 escenarios divididos en dos fases: con y sin rate limiting activo.

---

### FASE 1 — CON Rate Limiting

#### Escenario 1 — Normal Traffic
**Configuración:** 2 usuarios, 5 iteraciones, timer de 2s entre requests, ramp-up 5s

| Métrica | Valor |
|---|---|
| Total Samples | 10 |
| Average (ms) | 671 |
| Min (ms) | 2 |
| Max (ms) | 6682 |
| Error % | 90% (429s) |
| Throughput | 40.8/min |

**Interpretación:** Incluso con tráfico liviano y espaciado, el rate limit de NGINX (2r/s burst 5) bloquea la mayoría de requests porque los 2 usuarios comparten la misma IP.

---

#### Escenario 2 — Baseline
**Configuración:** 5 usuarios, 10 iteraciones, ramp-up 1s

| Métrica | Valor |
|---|---|
| Total Samples | 50 |
| Average (ms) | 183 |
| Min (ms) | 0 |
| Max (ms) | 6762 |
| Error % | 94% (429s) |
| Throughput | 5.6/sec |

**Interpretación:** Con 5 usuarios el rate limit se activa casi inmediatamente. Solo los primeros requests dentro del burst de 5 pasan.

---

#### Escenario 3 — Burst
**Configuración:** 20 usuarios simultáneos, 5 iteraciones, ramp-up 0s

| Métrica | Valor |
|---|---|
| Total Samples | 100 |
| Average (ms) | 63 |
| Min (ms) | 1 |
| Max (ms) | 1686 |
| Error % | 94% (429s) |
| Throughput | 35.6/sec |

**Interpretación:** NGINX responde en 63ms promedio — bloquea casi todo antes de llegar al LLM, protegiendo el backend completamente.

---

#### Escenario 4 — Sustained
**Configuración:** 15 usuarios, 20 iteraciones, ramp-up 60s

| Métrica | Valor |
|---|---|
| Total Samples | 280 |
| Average (ms) | 1 |
| Min (ms) | 0 |
| Max (ms) | 27 |
| Error % | 100% (429s) |
| Throughput | 5.4/sec |

**Interpretación:** Bajo carga sostenida NGINX bloquea el 100% en ~1ms. El sistema permanece completamente estable.

---

### FASE 2 — SIN Rate Limiting

#### Escenario 5 — Normal Traffic
**Configuración:** idéntica al escenario 1

| Métrica | Valor |
|---|---|
| Total Samples | 7 |
| Average (ms) | 9541 |
| Min (ms) | 4685 |
| Max (ms) | 12639 |
| Error % | 0% |
| Throughput | 10.5/min |

---

#### Escenario 6 — Baseline
**Configuración:** idéntica al escenario 2

| Métrica | Valor |
|---|---|
| Total Samples | 26 |
| Average (ms) | 10825 |
| Min (ms) | 1279 |
| Max (ms) | 15646 |
| Error % | 0% |
| Throughput | 25.4/min |

---

#### Escenario 7 — Burst
**Configuración:** idéntica al escenario 3

| Métrica | Valor |
|---|---|
| Total Samples | 100 |
| Average (ms) | 10587 |
| Min (ms) | 420 |
| Max (ms) | 15528 |
| Error % | 0% |
| Throughput | 1.5/sec |

---

#### Escenario 8 — Sustained
**Configuración:** idéntica al escenario 4

| Métrica | Valor |
|---|---|
| Total Samples | 84 |
| Average (ms) | 11943 |
| Min (ms) | 668 |
| Max (ms) | 15663 |
| Error % | 0% |
| Throughput | 51.0/min |

---

## Comparativa Final CON vs SIN Rate Limiting

| Escenario | Error % CON RL | Error % SIN RL | Avg ms CON RL | Avg ms SIN RL |
|---|---|---|---|---|
| Normal Traffic | 90% | 0% | 671 | 9541 |
| Baseline | 94% | 0% | 183 | 10825 |
| Burst | 94% | 0% | 63 | 10587 |
| Sustained | 100% | 0% | 1 | 11943 |

### Conclusiones

**Sin rate limiting** todos los requests llegan al LLM con tiempos de respuesta de 9-12 segundos y 0% de errores. El servicio responde correctamente pero queda completamente expuesto a abuso.

**Con rate limiting** NGINX bloquea la mayoría con `429` en 1-183ms — protege el LLM de sobrecarga y controla costos. El tiempo de respuesta bajo porque NGINX rechaza sin consultar el backend.

**Trade-off:** El rate limiting sacrifica disponibilidad para usuarios que superan el límite a cambio de proteger el backend, garantizar estabilidad del sistema y controlar costos del LLM.

> **Nota:** Los "errores" en JMeter son respuestas `429 Too Many Requests` — comportamiento **esperado y correcto** del rate limiter, no fallos del sistema.

---

## Archivos relevantes

```
docs/lab5/
├── README.md                     ← este archivo
├── Deployment_Lab5.puml
├── Component_Connectors_Lab5.puml
├── lab5_ai_load_test.jmx
├── lab5_ai_load_test_v2.jmx
└── results/
    ├── baseline_results.csv
    ├── burst_results.csv
    ├── sustained_results.csv
    ├── con_rl_normal_results.csv
    ├── con_rl_baseline_results.csv
    ├── con_rl_burst_results.csv
    ├── con_rl_sustained_results.csv
    ├── sin_rl_normal_results.csv
    ├── sin_rl_baseline_results.csv
    ├── sin_rl_burst_results.csv
    ├── sin_rl_sustained_results.csv
    └── raw/                      ← corridas previas (otra ejecución)
        ├── baseline_results.csv
        ├── burst_results.csv
        └── sustained_results.csv

api-gateway/
├── nginx.conf
└── certs/
    ├── nginx.crt
    └── nginx.key

backend/AI_service/src/core/
├── rate_limit.py
├── settings.py
└── redis_client.py
```

---

## Referencias

- [NGINX Rate Limiting](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)
- [TLS/SSL NGINX Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Docker Network Segmentation](https://docs.docker.com/network/)
- [Redis Sorted Sets](https://redis.io/docs/data-types/sorted-sets/)
- [Apache JMeter](https://jmeter.apache.org/)
