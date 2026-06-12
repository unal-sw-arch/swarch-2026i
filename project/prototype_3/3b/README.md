# Prototype 3 — Quality Attributes (Security, Performance & Reliability)

> **Estado de este documento:** BORRADOR. Las secciones marcadas con 🟡
> *(pendiente de implementar)* describen patrones acordados por el equipo cuyo
> código/configuración aún se va a añadir. Las marcadas con ✅ ya están
> implementadas en el repositorio.

---

## Team

- **Name:** 3b (Team B)
- **Members:**
  - Manuel Alejandro Navas Bohorquez
  - German Camilo Bernal Ladino
  - Edwin Felipe Pinilla Peralta
  - Juan David Rivera Buitrago
  - Obed Felipe Espinosa Angarita

---

## Software System

- **Name:** DELIUNAL
- **Logo:**

  ![DELIUNAL logo](../../../docs/LOGO%20FORMATO%20ESCALA%20500x500px.png)

- **Description:** DELIUNAL es una plataforma de domicilios (food delivery) con
  dos tipos de usuario principales: **restaurantes**, que publican sus menús e
  ítems con precios, descripciones e información asociada; y **clientes**, que
  exploran el catálogo, arman su carrito, realizan pedidos y hacen el
  seguimiento (tracking) de los mismos. El sistema está construido como un
  conjunto de **microservicios** desplegados con Docker Compose y orquestables
  en Kubernetes.

---

## Architectural Structures

### Component-and-Connector (C&C) Structure

**C&C View:**

![C&C View](./c_and_c_view.png) <!-- exportar desde ../../3b/c_and_c_view.drawio.xml -->

**Elementos y relaciones principales:**

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Customer App | Next.js (SSR) | Frontend de clientes: registro/login, explorar restaurantes, carrito, pedidos |
| Restaurant Dashboard | React + Vite | Frontend operativo de restaurantes: gestión de menú/disponibilidad |
| **API Gateway** | Node.js + Express | Punto único de entrada; enruta, autentica (JWT), aplica roles, cachea |
| Auth Service | Python (FastAPI) | Registro, login, emisión/validación de JWT |
| Catalog Service | Node.js + TypeScript | Restaurantes, menús, ítems, disponibilidad |
| Order Service | Java (Spring Boot) | Creación y ciclo de vida de pedidos |
| Kitchen Service | Go | Procesamiento de órdenes en cocina vía eventos |
| Notification / Tracking Service | Python | Eventos de actividad e historial de tracking |
| Event Broker | RabbitMQ | Mensajería asíncrona entre servicios |
| Cache | Valkey (Redis-compatible) | Cache de lecturas en el gateway |
| Bases de datos | PostgreSQL ×3, MongoDB | Persistencia poliglota por servicio |

**Conectores:**

- **REST HTTP/JSON síncrono** entre frontends → API Gateway → servicios.
- **AMQP asíncrono** (RabbitMQ) entre Order / Catalog / Kitchen / Notification.
- **JDBC / Prisma / ODM** entre cada servicio y su base de datos.

**Estilos y patrones usados:**
- **Microservicios** con *bounded contexts* (DDD): Order Management, Catalog,
  Auth, Kitchen, Tracking.
- **API Gateway / Reverse Proxy** como único punto de entrada.
- **Event-Driven Architecture** vía RabbitMQ.
- **Persistencia poliglota** (PostgreSQL para datos transaccionales, MongoDB
  para eventos/logs).

### Deployment Structure

**Deployment View:**

![Deployment View](./deployment_view.png) <!-- exportar desde ../../3b/deployment_view.drawio.xml -->

- **Local (Docker Compose):** topología segmentada en tres redes —
  `edge-net` (borde TLS + frontends + gateway), `backend-net` (gateway +
  microservicios + broker + cache, `internal`) y `data-net` (microservicios +
  bases de datos, `internal`). Un terminador TLS (`nginx-tls`) expone HTTPS.
- **Kubernetes:** el `api-gateway` se despliega como Deployment con 2 réplicas,
  expuesto por un Service NodePort, con readiness/liveness probes.

**Patrones de despliegue:** Containerización, Cluster Pattern (K8s),
Active Redundancy (Hot Spare).

### Layered Structure

**Layered View:**

![Layered View](./layered_view.png) <!-- exportar desde ../../3b/layered_view.drawio.xml -->

- **Presentación:** Customer App, Restaurant Dashboard.
- **Lógica / Aplicación:** API Gateway + microservicios de negocio.
- **Datos:** PostgreSQL, MongoDB, Valkey, RabbitMQ.

### Decomposition Structure

**Decomposition View:**

![Decomposition View](./decomposition_view.png) <!-- desde ../../3b/decomposition_view.jpg -->

Descomposición por *bounded context*: cada microservicio encapsula su dominio,
su API y su almacén de datos, comunicándose solo por contratos REST/eventos.

---

## Quality Attributes

> Cada escenario se redacta con **fuente · estímulo · artefacto · ambiente ·
> respuesta · medida de respuesta** (formato ATAM).

### 🔒 Security

#### Escenario S1 — Punto único de entrada controlado (Reverse Proxy) ✅

| Campo | Valor |
|---|---|
| **Fuente** | Cliente externo (navegador / atacante) |
| **Estímulo** | Petición HTTP a cualquier capacidad del sistema |
| **Artefacto** | API Gateway |
| **Ambiente** | Operación normal |
| **Respuesta** | El gateway valida JWT y rol, oculta la topología interna y reenvía solo peticiones autorizadas a los servicios; los servicios internos no se exponen directamente |
| **Medida** | 100% del tráfico externo pasa por el gateway; 0 servicios de negocio con puertos publicados hacia el exterior tras la segmentación |

- **Patrón aplicado:** **Reverse Proxy Pattern**.
- **Tácticas:** *Authenticate users* (JWT en [auth.middleware.ts](../../../apps/api-gateway/src/middlewares/auth.middleware.ts)),
  *Authorize users* (roles en [role.middleware.ts](../../../apps/api-gateway/src/middlewares/role.middleware.ts)),
  *Limit exposure* (único punto de entrada).

#### Escenario S2 — Aislamiento de la red interna (Network Segmentation) ✅

| Campo | Valor |
|---|---|
| **Fuente** | Atacante en la red del host |
| **Estímulo** | Intento de conexión directa a una base de datos o servicio interno |
| **Artefacto** | Topología de red de Docker Compose |
| **Ambiente** | Operación normal |
| **Respuesta** | Las bases de datos y servicios de negocio viven en redes internas (`internal: true`) sin puertos publicados; solo el borde TLS, los frontends y el gateway son alcanzables desde fuera |
| **Medida** | Solo quedan expuestos los puertos de borde/frontends/gateway; conexión directa a DB/servicios desde el host = rechazada |

- **Patrón aplicado:** **Network Segmentation Pattern**.
- **Tácticas:** *Limit access*, *Restrict exposure*.
- **Implementación:** `docker-compose.yml` define tres redes:
  `edge-net` (borde TLS + frontends + gateway), `backend-net` (gateway +
  microservicios + broker + cache, `internal`) y `data-net` (microservicios +
  bases de datos, `internal`). Se eliminaron los `ports:` publicados de las DBs
  y servicios internos. Detalle en
  [infrastructure/edge/README.md](../../../infrastructure/edge/README.md).

#### Escenario S3 — Canal seguro extremo a extremo (Secure Channel / TLS) ✅

| Campo | Valor |
|---|---|
| **Fuente** | Cliente externo |
| **Estímulo** | Envío de credenciales / JWT por la red |
| **Artefacto** | Borde HTTPS (nginx) frente al API Gateway |
| **Ambiente** | Operación normal |
| **Respuesta** | El tráfico cliente↔borde viaja cifrado con TLS; HTTP (80) redirige a HTTPS (443) |
| **Medida** | 100% del tráfico de borde sobre TLS; credenciales nunca en texto plano |

- **Patrón aplicado:** **Secure Channel Pattern**.
- **Tácticas:** *Encrypt data in transit*.
- **Implementación:** servicio `nginx-tls` como terminador TLS
  ([infrastructure/edge/nginx.conf](../../../infrastructure/edge/nginx.conf))
  con certificado autofirmado para entorno local
  ([generate-cert.ps1](../../../infrastructure/edge/generate-cert.ps1)).

---

### ⚡ Performance and Scalability

#### Escenario P1 — Cache de lecturas en el gateway 🟡 *(código existe, falta activar/medir)*

| Campo | Valor |
|---|---|
| **Fuente** | Múltiples clientes |
| **Estímulo** | Ráfaga de lecturas a catálogo/restaurantes/promociones |
| **Artefacto** | API Gateway + Valkey |
| **Ambiente** | Carga alta de lecturas |
| **Respuesta** | El gateway sirve respuestas cacheadas y evita golpear los servicios de negocio en cada petición |
| **Medida** | Reducción de latencia p95 y de RPS contra los servicios upstream con cache ON vs OFF |

- **Patrón aplicado:** **Caching** (Valkey/Redis).
- **Tácticas:** *Maintain multiple copies of data*, *Reduce computational overhead*.
- **Pendiente:** poner `CACHE_ENABLED=true` en `docker-compose.yml` (hoy está en
  `false`) y medir con k6.

#### Escenario P2 — Balanceo de carga horizontal (Load Balancer) ✅/🟡

| Campo | Valor |
|---|---|
| **Fuente** | Múltiples clientes concurrentes |
| **Estímulo** | Volumen de peticiones que supera la capacidad de una instancia |
| **Artefacto** | API Gateway replicado tras el Service de Kubernetes |
| **Ambiente** | Carga alta |
| **Respuesta** | El Service de K8s distribuye las peticiones entre las réplicas del gateway |
| **Medida** | Throughput escala al aumentar réplicas (2→4); latencia p95 se mantiene bajo carga |

- **Patrón aplicado:** **Load Balancer Pattern** (Service de K8s sobre 2+ Pods).
- **Tácticas:** *Introduce concurrency*, *Maintain multiple copies of computations*.

#### Performance testing (k6) ✅

- **Herramienta:** [k6](https://k6.io/) (imagen `grafana/k6`).
- **Escenario bajo prueba:** P1 (cache) — comparativa cache ON vs OFF sobre
  `GET /restaurants` a través del gateway.
- **Script:** [load-test/catalog.js](./load-test/catalog.js) — 50 VUs, etapas
  ramp-up (20s) / sostenido (40s) / ramp-down (10s), thresholds (`p95<500ms`,
  `errores<1%`). Procedimiento completo (incluyendo escalado en K8s para P2) en
  [load-test/README.md](./load-test/README.md).
- **Configuración de prueba:** 50 usuarios virtuales, ~70s, ~2.770 iteraciones
  por corrida, 0% de errores en ambos casos.

**Resultados (GET /restaurants, 50 VUs):**

| Métrica            | Cache OFF | Cache ON | Mejora |
|--------------------|-----------|----------|--------|
| Latencia avg (ms)  | 3.98      | 2.02     | −49%   |
| Latencia p90 (ms)  | 4.82      | 2.36     | −51%   |
| Latencia p95 (ms)  | 5.41      | 2.61     | −52%   |
| Latencia max (ms)  | 27.60     | 20.75    | −25%   |
| Throughput (req/s) | 39.13     | 39.27    | ≈      |
| % errores          | 0.00%     | 0.00%    | —      |

**Análisis:** activar el cache del gateway (Valkey) **reduce la latencia a la
mitad** (p95 de 5.41ms a 2.61ms) al evitar el viaje al Catalog Service y su
base de datos en cada lectura. El throughput es equivalente porque la prueba
está limitada por el `sleep(1)` de cada VU (techo ~50 req/s); el efecto del
patrón se observa en la **latencia**, que es la métrica relevante para este
escenario de lecturas. Bajo una carga sin *think time* (más agresiva), la
diferencia de throughput también se ampliaría porque el servicio upstream deja
de ser el cuello de botella.

---

### 🔁 Reliability

#### Escenario R1 — Réplica activa con auto-recuperación (Cluster / Hot Spare) ✅

| Campo | Valor |
|---|---|
| **Fuente** | Fallo de infraestructura |
| **Estímulo** | Una réplica del gateway se cae / es eliminada |
| **Artefacto** | Deployment del API Gateway en Kubernetes |
| **Ambiente** | Operación con fallo |
| **Respuesta** | El Service sigue sirviendo desde la réplica sana; K8s recrea automáticamente la réplica caída hasta restaurar el conteo deseado |
| **Medida** | 0 downtime percibido; réplica reemplazada en segundos; vuelve a `2/2 Ready` |

- **Patrón aplicado:** **Cluster Pattern** + **Active Redundancy (Hot Spare)**.
- **Tácticas:** *Active redundancy*, *Health monitoring* (readiness/liveness
  probes), *Self-healing* (ver [kubernetes/README.md](../../../infrastructure/kubernetes/README.md)).

#### Escenario R2 — Tolerancia a fallos de servicios upstream (Retry + Circuit Breaker) ✅

| Campo | Valor |
|---|---|
| **Fuente** | Servicio de negocio (p.ej. Catalog) |
| **Estímulo** | El servicio upstream responde lento o falla intermitentemente |
| **Artefacto** | Cliente HTTP del API Gateway |
| **Ambiente** | Degradación parcial |
| **Respuesta** | El gateway reintenta con backoff exponencial los fallos transitorios; si el servicio sigue fallando, el circuit breaker se abre y responde rápido (fail-fast) con error controlado en vez de colgarse, evitando cascada de fallos |
| **Medida** | Errores transitorios absorbidos por reintentos; con el servicio caído, el gateway responde en < timeout (no se cuelga) y se recupera solo al volver el servicio |

- **Patrón aplicado:** **Circuit Breaker** + **Retry** (tácticas de
  resiliencia).
- **Tácticas:** *Retry*, *Circuit breaker*, *Limit retries*, *Timeout*.
- **Implementación:** módulo de resiliencia propio (sin dependencias externas)
  cableado en el cliente HTTP base del gateway:
  - [circuit-breaker.ts](../../../apps/api-gateway/src/shared/resilience/circuit-breaker.ts)
    — máquina de estados CLOSED/OPEN/HALF_OPEN, un breaker por servicio upstream.
  - [retry.ts](../../../apps/api-gateway/src/shared/resilience/retry.ts)
    — reintentos con backoff exponencial solo para errores transitorios (timeout,
    upstream no disponible, 5xx).
  - Cableado en
    [base-http.client.ts](../../../apps/api-gateway/src/services/clients/base-http.client.ts);
    configurable por env (`RETRY_MAX_ATTEMPTS`, `BREAKER_FAILURE_THRESHOLD`,
    `BREAKER_RESET_TIMEOUT_MS`).
  - **Demostración (verificada):** con `catalog-service` detenido, se enviaron
    7 peticiones a `/restaurants`:
    - Intentos 1–5 → **HTTP 502** (cada uno con 2 reintentos de backoff
      100ms/200ms antes de fallar; breaker CLOSED contando fallos).
    - Tras 5 fallos consecutivos → breaker **OPEN**
      (`circuit-breaker.state-change`, `consecutiveFailures:5`).
    - Intentos 6–7 → **HTTP 503 inmediato** (fail-fast, sin reintentar).
    - Al reiniciar el servicio, el breaker pasó **OPEN → HALF_OPEN → CLOSED**
      (`consecutiveFailures:0`) y las peticiones volvieron a **HTTP 200**,
      demostrando recuperación automática.

---

### 🔗 Interoperability

#### Escenario I1 — Comunicación asíncrona desacoplada vía broker ✅

| Campo | Valor |
|---|---|
| **Fuente** | Order Service |
| **Estímulo** | Se crea/actualiza un pedido que la cocina y el tracking deben conocer |
| **Artefacto** | Event Broker (RabbitMQ) |
| **Ambiente** | Operación normal |
| **Respuesta** | Order publica un evento; Kitchen y Notification lo consumen sin acoplamiento directo ni dependencia temporal entre servicios escritos en distintos lenguajes (Java, Go, Python) |
| **Medida** | Servicios heterogéneos interoperan por contrato de mensajes; un consumidor caído no bloquea al productor |

- **Patrón aplicado:** **Message Broker / Publish-Subscribe** (interoperabilidad
  por mensajería estandarizada AMQP).
- **Tácticas:** *Orchestrate*, *Tailor interface*, *Adhere to standards* (AMQP/JSON).

> Alternativa/adicional: el **API Gateway** también es un punto de
> interoperabilidad (REST/JSON estándar) entre frontends heterogéneos y los
> servicios.

---

## Prototype — Instrucciones de despliegue local

### Opción A — Docker Compose (stack completo)

```powershell
# Desde la raíz del repositorio.
# 1. Cargar el archivo .env (provisto aparte en Classroom) en la raíz.
# 2. Generar el certificado TLS autofirmado (una sola vez):
./infrastructure/edge/generate-cert.ps1
# 3. Levantar el stack:
docker compose up -d
```

Servicios expuestos al host (tras segmentación: solo borde, frontends y gateway):
- **Borde TLS (HTTPS):** https://localhost  → `curl.exe -k https://localhost/health`
- API Gateway (interno/dev): http://localhost:4000
- Customer App: http://localhost:3001
- Restaurant Dashboard: http://localhost:5173

Las bases de datos, el broker y los microservicios internos **no** publican
puertos: viven en redes `internal` (`backend-net`, `data-net`).

### Opción B — Kubernetes (Cluster / Hot Spare del gateway)

```powershell
docker build -t deliunal-api-gateway:k8s ./services/api-gateway
kubectl apply -f infrastructure/kubernetes/
kubectl rollout status deployment/api-gateway -n deliunal
Invoke-WebRequest http://localhost:30080/health
```

Ver la guía completa (self-healing y escalado) en
[infrastructure/kubernetes/README.md](../../../infrastructure/kubernetes/README.md).

### Performance test (k6) 🟡

```powershell
docker run --rm -i grafana/k6 run - < load-test/catalog.js
```

---

## Checklist de la entrega

| Requisito | Estado |
|---|---|
| Seguridad — Reverse Proxy | ✅ |
| Seguridad — Network Segmentation | ✅ implementado |
| Seguridad — Secure Channel (TLS) | ✅ implementado |
| Performance — Cache | ✅ código (toggle `CACHE_ENABLED`) |
| Performance — Load Balancer | ✅ (K8s Service) |
| Performance testing (k6) | ✅ script · 🟡 ejecutar y pegar resultados |
| Reliability — Cluster / Hot Spare | ✅ |
| Reliability — Retry + Circuit Breaker | ✅ implementado |
| Interoperability — Message Broker | ✅ |
| Diagramas (C&C, deployment, layered, decomposition) | ⚠️ exportar a PNG aquí |
| Estructura `project/prototype_3/3b/` | ✅ creada |
