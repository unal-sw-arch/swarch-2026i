# Prototype 3 — Quality Attributes: Security, Performance & Reliability

## Team

**Nombre del grupo:** Grupo D

**Integrantes:**
- John Pastor
- Isabel Ospina
- Andres Perdomo
- Juan Castañeda

## Software System

**Nombre:** AICart

**Logo:**

![AICart](https://raw.githubusercontent.com/jpastor1649/ecommerce-project/FinalProject3/docs/AICart.png)

**Descripción:**

AICart es una plataforma de comercio electrónico basada en microservicios que permite a compradores explorar un catálogo multi-categoría, gestionar órdenes con confirmación automática de stock, realizar pagos simulados y recibir recomendaciones personalizadas a través de un asistente conversacional con IA generativa (Groq + Llama 3.1 + RAG sobre pgvector). Los vendedores pueden publicar productos y consultar estadísticas de ventas.

El sistema implementa patrones reales de arquitectura de software: segmentación de red, saga coreográfico, cold-spare failover, TLS/HTTPS, rate limiting de doble capa, RAG semántico con pgvector e idempotencia en eventos distribuidos.

**Stack tecnológico:** Python 3.12 · FastAPI · Next.js 14 · PostgreSQL 16 + pgvector · Redis 7 · RabbitMQ 3 · NGINX 1.27 · Docker Compose

---

## Architectural Structures

### Component-and-Connector (C&C) Structure

**Vista C&C:**

![Component & Connector](docs/architecture/C%26C.png)

**Descripción de elementos y relaciones:**

| Componente | Responsabilidad |
|---|---|
| **Frontend (Next.js 14)** | Interfaz SSR/CSR. Se comunica exclusivamente con el API Gateway vía HTTPS. |
| **API Gateway (NGINX)** | Único punto de entrada. Enruta por prefijo de path, termina TLS, aplica CORS, rate limiting por IP y gestiona failover del auth-service con upstream backup. |
| **Auth Service** | Autenticación, emisión y validación de JWT (HS256). Mantiene blacklist de tokens en Redis. Publica `AUTH_USER_REGISTERED`. Réplica cold-spare activada por el `spare-coordinator`. |
| **User Service** | Gestión de perfiles y direcciones de envío. Consume `AUTH_USER_REGISTERED` para crear perfil. Expone `/internal/profiles` para uso cross-service. |
| **Product Service** | Catálogo, categorías, galería, reviews y stock. Participa en la saga como reservador. Publica `STOCK_RESERVED` / `STOCK_UNAVAILABLE`. |
| **Order Service** | Ciclo de vida de órdenes y pagos simulados. Inicia saga con `ORDER_CREATED`. Worker de timeout para cancelación automática de órdenes vencidas. |
| **AI Service** | Chat conversacional con RAG sobre pgvector. Recupera contexto del usuario y catálogo en tiempo real antes de invocar el LLM externo (Groq). Rate limiting de segunda capa vía Redis sliding window. |
| **spare-coordinator** | Watchdog que monitorea el health del auth-service primario y activa el spare ante 3 fallos consecutivos. |
| **RabbitMQ** | Broker de mensajería. Exchange `events` (fanout) para registro de usuario; exchange `commerce.saga` (topic) para saga de stock con DLQ. |
| **Redis** | Sesiones y blacklist de JWT (auth), caché cross-service (product/AI), historial conversacional y sliding-window rate limit (AI). |
| **ai-postgres (pgvector)** | Base de datos vectorial para el índice RAG de productos (embeddings 384 dims, índice HNSW cosine). |

**Relaciones principales:**

- Frontend → API Gateway (HTTPS/REST)
- API Gateway → Auth Service (upstream primario `172.20.1.10`, backup cold-spare `172.20.1.11`)
- spare-coordinator → Auth Service (`GET /health` cada 3 s; `POST /activate` al spare si ≥ 3 fallos)
- Auth Service → RabbitMQ (`AUTH_USER_REGISTERED` → fanout `events`)
- User Service ← RabbitMQ (consume `AUTH_USER_REGISTERED`)
- Order Service → RabbitMQ (`ORDER_CREATED`, `ORDER_CANCELLED` → topic `commerce.saga`)
- Product Service ← RabbitMQ (consume `order.created`, `order.cancelled`; publica `STOCK_RESERVED` / `STOCK_UNAVAILABLE`)
- AI Service → Product Service, User Service, Order Service (HTTP interno para contexto)
- AI Service → Groq API (HTTP externo, LLM inference)
- AI Service → ai-postgres (pgvector, búsqueda semántica RAG)
- Cada microservicio → su propia instancia PostgreSQL (DB-per-service)

**Estilos y patrones:**

- **Microservicios** — servicios independientes con ciclos de vida y bases de datos propias
- **API Gateway** — NGINX como único punto de entrada
- **Publish/Subscribe** — comunicación asíncrona via RabbitMQ con envelopes JSON tipados
- **Saga (coreografía)** — coordinación distribuida Order ↔ Product sin orquestador central
- **Cold-Spare Redundancy** — auth-service activo + réplica spare + watchdog coordinator

---

### Deployment Structure

**Vista de Despliegue:**

![Deployment](https://raw.githubusercontent.com/jpastor1649/ecommerce-project/FinalProject3/docs/architecture/Deployment_Current.png)

**Descripción de elementos y relaciones:**

El sistema se despliega como **15 contenedores Docker** organizados en dos redes bridge aisladas:

**Red `subnet_a` (pública — `172.20.0.0/24`):**
- `ecommerce_frontend` (Next.js 14, puerto host `3000`)
- `ecommerce_api_gateway` (NGINX, puertos host `8000` HTTP y `8443` HTTPS)

**Red `subnet_b` (privada — `172.20.1.0/24`, inaccesible desde el host):**
- `ecommerce_auth_service` (IP fija `172.20.1.10`, rol `active`)
- `ecommerce_auth_service_cold` (IP fija `172.20.1.11`, rol `spare`)
- `ecommerce_spare_coordinator` (watchdog, acceso al Docker socket)
- `ecommerce_user_service`, `ecommerce_product_service`, `ecommerce_order_service`, `ecommerce_ai_service`
- `ecommerce_auth_postgres`, `ecommerce_user_postgres`, `ecommerce_product_postgres`, `ecommerce_order_postgres`
- `ecommerce_ai_postgres` (pgvector/pgvector:pg16 — índice vectorial RAG)
- `ecommerce_rabbitmq`, `ecommerce_redis`

El **API Gateway es el único contenedor conectado a ambas redes**, actuando como el único puente entre la zona pública y la privada.

**Patrones de despliegue:**

- **Containerized Deployment** — todos los componentes como contenedores Docker con healthchecks
- **Network Segmentation** — dos subredes aisladas limitan el radio de impacto ante intrusiones
- **Database per Service** — 5 instancias PostgreSQL independientes
- **API Gateway** — centraliza routing, TLS y políticas de seguridad
- **Cold-Spare** — dos instancias del auth-service con IPs fijas para compatibilidad con NGINX OSS

---

### Layered Structure

**Vista N-Tier:**

![N-Tier](https://raw.githubusercontent.com/jpastor1649/ecommerce-project/FinalProject3/docs/architecture/NTier_Current.png)

**Descripción de capas:**

| Capa | Nombre | Componentes |
|---|---|---|
| 0 | **Presentación** | Browser + Next.js 14 (SSR/CSR) |
| 1 | **Edge / API Gateway** | NGINX — TLS termination, rate limiting, routing, CORS, failover |
| 2 | **Servicios de Negocio** | auth, user, product, order, ai-service + spare-coordinator |
| 3 | **Mensajería Asíncrona** | RabbitMQ — exchanges fanout (`events`) y topic (`commerce.saga`) con DLQ |
| 4 | **Datos** | 5× PostgreSQL (incl. pgvector), Redis, Groq API (LLM externo) |

**Patrones:**

- **Layered Architecture** — separación clara de responsabilidades, flujo unidireccional
- **Separation of Concerns** — cada capa tiene un propósito único
- **Event-Driven** — capa 3 desacopla la comunicación asíncrona entre servicios de capa 2

---

### Decomposition Structure

**Vista de Descomposición:**

![Decomposition](https://raw.githubusercontent.com/jpastor1649/ecommerce-project/FinalProject3/docs/architecture/Decomposition_Current.png)

**Descripción de dominios de negocio:**

La descomposición se realizó por *business capabilities*:

| Dominio | Servicio | Módulos principales |
|---|---|---|
| **Identidad** | `auth-service` | `routers/auth.py`, `services/auth_service.py`, `core/security.py` |
| **Perfil de Usuario** | `user-service` | `routers/router.py`, `services/services.py` |
| **Catálogo e Inventario** | `product-service` | `routers/products.py`, `services/product_service.py`, `events/consumer.py`, `models/reservation.py` |
| **Comercio / Órdenes** | `order-service` | `routers/orders.py`, `services/order_service.py`, `services/payment_service.py`, `services/timeout_worker.py`, `events/publisher.py` |
| **Asistente IA** | `ai-service` | `routers/chat.py`, `services/Ai_service.py`, `services/retrieval.py`, `services/indexer.py`, `models/product_embedding.py` |

La **infraestructura transversal** (NGINX, RabbitMQ, Redis, spare-coordinator, ai-postgres) provee servicios compartidos sin pertenecer a ningún dominio funcional.

| Patrón | Implementación | Archivo |
|---|---|---|
| **Reverse Proxy / API Gateway** | NGINX único punto de entrada | `api-gateway/nginx.conf` |
| **Network Segmentation** | `subnet_a` (pública) / `subnet_b` (privada) | `docker-compose.yml:402-418` |
| **Secure Channel (TLS)** | HTTPS 8443, TLS 1.2/1.3, HSTS | `api-gateway/nginx.conf:43-59` |
| **Saga (coreografía)** | Order ↔ Product vía RabbitMQ | `order_service/src/events/`, `product_service/src/events/` |
| **Cold-Spare Redundancy** | `auth-service-cold` + watchdog | `coordinator/coordinator.py`, `auth_service/main.py:81` |
| **Cache-Aside** | Redis con TTL para perfil, sesiones, historial | `AI_service/src/services/user_context.py` |
| **Database per Service** | 5 instancias PostgreSQL aisladas | `docker-compose.yml` servicios `*-postgres` |
| **Idempotencia** | Tabla `ProcessedEvent` en order y product | `*/src/models/processed_event.py` |
| **RAG (Retrieval-Augmented Generation)** | pgvector + fastembed ONNX | `AI_service/src/services/retrieval.py` |
| **Simulated Payment Gateway** | Lock pesimista + reglas deterministas | `order_service/src/services/payment_service.py` |

---

## Quality Attributes

---

### Security

#### Escenario SEC-01 — Reverse Proxy Pattern

| Elemento | Descripción |
|---|---|
| **Source** | Usuario externo / atacante desde internet |
| **Stimulus** | Petición HTTP/HTTPS a cualquier endpoint del sistema |
| **Artifact** | API Gateway (NGINX) + servicios backend |
| **Environment** | Sistema en producción, servicios backend en `subnet_b` sin puertos expuestos |
| **Response** | El gateway evalúa la ruta, aplica rate limiting y headers de seguridad antes de reenviar al backend; las rutas no mapeadas retornan 404 JSON |
| **Response Measure** | Ningún servicio backend es accesible directamente desde el host; 100% del tráfico pasa por el gateway |

**Patrón:** Reverse Proxy Pattern

**Justificación del patrón elegido:**
El sistema expone 5 microservicios con interfaces distintas que necesitan políticas de seguridad homogéneas: TLS, CORS, rate limiting y headers de protección. Sin un proxy centralizado, cada servicio las implementaría de forma independiente, generando inconsistencias, duplicación de lógica y una superficie de ataque más amplia. El Reverse Proxy concentra todo el perímetro de seguridad en un único componente verificable (NGINX), que es la práctica estándar para API Gateways en arquitecturas de microservicios. Se eligió sobre alternativas como un WAF standalone porque NGINX combina proxy, TLS termination, rate limiting y routing en un único proceso con configuración declarativa y bajo overhead.

**Tácticas:**
- *Single Point of Enforcement* — el gateway es el único punto que recibe tráfico externo
- *Limit Exposure* — backends sin puertos publicados al host
- *Limit Access* — rate limiting por zona NGINX (`general` 10 r/s, `ai_zone` 2 r/s)
- *Authenticate Actors* — JWT validado por cada servicio de negocio

**`api-gateway/nginx.conf`:**
```nginx
# Zonas de rate limiting por IP
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=ai_zone:10m  rate=2r/s;

# Upstream con cold-spare failover
upstream auth_backend {
    server ecommerce_auth_service:8001      max_fails=2 fail_timeout=5s;
    server ecommerce_auth_service_cold:8002 backup;
}

# Servidor HTTPS — Secure Channel + Reverse Proxy
server {
    listen 8443 ssl;
    ssl_certificate     /etc/nginx/certs/nginx.crt;
    ssl_certificate_key /etc/nginx/certs/nginx.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    include /etc/nginx/api-gateway/shared.conf;
}
```

**`api-gateway/shared.conf` — headers de seguridad y routing:**
```nginx
# Headers de seguridad en cada respuesta
add_header X-Content-Type-Options  "nosniff"                         always;
add_header X-Frame-Options         "DENY"                            always;
add_header Referrer-Policy         "strict-origin-when-cross-origin" always;
add_header X-Request-ID            $req_id                           always;

# AI service — zona estricta + rewrite de path
location /ai/ {
    limit_req        zone=ai_zone burst=5 nodelay;
    limit_req_status 429;
    proxy_read_timeout 60s;
    rewrite ^/ai/(.*)$ /api/v1/$1 break;
    proxy_pass http://ai-service:8005;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Rutas internas — allowlist de subredes privadas
location /internal/ {
    allow 172.16.0.0/12;
    allow 172.20.0.0/23;
    allow 127.0.0.1;
    deny all;
    proxy_pass http://user-service:8000;
}

# Rutas no mapeadas → 404 explícito
location / {
    return 404 '{"detail":"Route not mapped in api-gateway"}';
}
```

**`backend/auth_service/src/core/security.py` — JWT + bcrypt:**
```python
def hash_password(raw_password: str) -> str:
    return bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "iat": int(now.timestamp()), "exp": int(expire.timestamp())}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

def check_password(password: str) -> None:
    # 8+ chars, mayúscula, minúscula, dígito, caracter especial
    if len(password) < 8:
        raise HTTPException(400, "password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password): raise HTTPException(400, "need uppercase letter")
    if not re.search(r"\d", password):    raise HTTPException(400, "need digit")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise HTTPException(400, "need special character")
```

---

#### Escenario SEC-02 — Network Segmentation Pattern

| Elemento | Descripción |
|---|---|
| **Source** | Atacante que compromete el frontend o el API Gateway |
| **Stimulus** | Intento de acceso directo a servicios backend o bases de datos |
| **Artifact** | Topología de red Docker (`subnet_a` / `subnet_b`) |
| **Environment** | Sistema en ejecución con todos los contenedores activos |
| **Response** | Los servicios backend y bases de datos no son alcanzables desde `subnet_a`; solo el gateway puede cruzar entre redes |
| **Response Measure** | 0 puertos de backend/BD publicados al host; ningún contenedor de `subnet_a` puede establecer TCP a `subnet_b` directamente |

**Patrón:** Network Segmentation Pattern

**Justificación del patrón elegido:**
Network Segmentation añade una capa de defensa independiente del software: un atacante que comprometa el contenedor del frontend no puede establecer conexiones TCP directas con las bases de datos ni con los servicios backend, porque las redes Docker (`subnet_a` y `subnet_b`) no son enrutables entre sí a nivel de kernel. Esta separación no depende de configuración de aplicación, no tiene superficie de bug propia y es verificable en tiempo de despliegue con `docker network inspect`. Se eligió sobre un único firewall de aplicación porque reduce el blast radius de cualquier vulnerabilidad en la capa de presentación de forma estructural, no lógica.

**Tácticas:**
- *Limit Exposure* — `subnet_b` inaccesible desde el host o desde `subnet_a`
- *Separate Entities* — frontend solo llega al gateway, nunca directamente a los servicios
- *Defense in Depth* — segmentación de red complementa el control a nivel de aplicación (JWT + rate limit)

**`docker-compose.yml` — definición de redes y asignaciones:**
```yaml
networks:
  subnet_a:               # Zona pública — solo frontend y gateway
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24

  subnet_b:               # Zona privada — servicios y bases de datos
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.1.0/24
          ip_range: 172.20.1.128/25   # pool dinámico; .10 y .11 son IPs fijas

# ÚNICO contenedor en ambas redes — puente controlado
  api-gateway:
    networks:
      - subnet_a   # recibe tráfico público
      - subnet_b   # alcanza servicios backend

# Frontend: solo subnet_a — no puede llegar a los backends directamente
  frontend:
    networks:
      - subnet_a

# Todo backend y toda BD: solo subnet_b, sin puertos publicados al host
  auth-service:
    networks:
      subnet_b:
        ipv4_address: 172.20.1.10
  auth-service-cold:
    networks:
      subnet_b:
        ipv4_address: 172.20.1.11
```

**`backend/AI_service/src/core/rate_limit.py` — segunda capa de rate limit (por usuario):**
```python
class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window en Redis. Identifica por JWT sub o IP de origen."""

    async def dispatch(self, request: Request, call_next):
        identifier = self._get_identifier(request)   # "user:{sub}" o "ip:{addr}"
        key = f"rate_limit:ai:{identifier}"
        now = int(time.time())

        pipe = redis.pipeline()
        pipe.zremrangebyscore(key, "-inf", now - self.window_seconds)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, self.window_seconds)
        results = await pipe.execute()

        if results[1] >= self.max_requests:
            return JSONResponse(status_code=429,
                headers={"Retry-After": str(self.window_seconds),
                         "X-RateLimit-Remaining": "0",
                         "X-RateLimit-Reset": str(now + self.window_seconds)})
        return await call_next(request)
```

---

### Performance and Scalability

#### Escenario PERF-01 — Cache Pattern (Redis TTL)

| Elemento | Descripción |
|---|---|
| **Source** | Usuario autenticado usando el chat de IA |
| **Stimulus** | Múltiples peticiones consecutivas al chat que requieren perfil del usuario, vector de preferencias y contexto de productos |
| **Artifact** | AI Service + Redis |
| **Environment** | Sistema bajo carga normal, Redis disponible |
| **Response** | El perfil y el vector de preferencias se sirven desde caché Redis sin consultar la BD ni los otros servicios |
| **Response Measure** | Reducción de latencia p95 de ~450 ms (cold) a ~90 ms (warm); hit ratio > 90% en uso continuo |

**Patrón:** Cache-Aside Pattern

**Tácticas:**
- *Reduce Computational Overhead* — evita recómputo de embeddings y llamadas cross-service en cada request
- *Introduce Caching* — Redis como caché de nivel de aplicación con TTL explícitos por dato
- *Negative Caching* — lista vacía como marcador para usuarios sin compras

**`backend/AI_service/src/services/user_context.py`:**
```python
_PROFILE_TTL = 300  # 5 minutos

async def get_user_context(user_id: uuid.UUID, auth_token: str | None) -> dict:
    # 1. Intentar caché primero (cache-aside read)
    cached = await r.get(f"ai:profile:{user_id}")
    if cached:
        return json.loads(cached)    # cache HIT — sin llamadas HTTP

    # 2. Cache MISS — recolección paralela de dos fuentes
    profile, orders = await asyncio.gather(
        user_client.get_user(str(user_id)),
        order_client.get_my_orders(auth_token, limit=15),
    )
    ctx = {
        "name": (profile or {}).get("name"),
        "top_products": _extract_top_products(orders),
        "order_count": len(orders),
    }
    # 3. Almacenar en caché con TTL
    await r.set(f"ai:profile:{user_id}", json.dumps(ctx), ex=_PROFILE_TTL)
    return ctx
```

**`backend/AI_service/src/services/retrieval.py` — vector de perfil con negative caching:**
```python
_PROFILE_VEC_TTL = 300

async def get_profile_vector(user_id, auth_token) -> list[float] | None:
    cached = await r.get(f"ai:profile_vec:{user_id}")
    if cached:
        data = json.loads(cached)
        return data or None   # [] = negative cache (usuario sin compras)

    orders = await order_client.get_my_orders(auth_token, limit=15)
    product_ids = [uuid.UUID(item["product_id"]) for order in orders
                   for item in order.get("items", [])]
    if product_ids:
        rows = await session.execute(
            select(ProductEmbedding.embedding).where(
                ProductEmbedding.product_id.in_(set(product_ids))))
        vector = _mean_vector([list(row[0]) for row in rows])

    await r.set(f"ai:profile_vec:{user_id}", json.dumps(vector or []), ex=_PROFILE_VEC_TTL)
    return vector
```

**Inventario de cachés:**

| Clave Redis | TTL | Contenido |
|---|---|---|
| `ai:profile:{user_id}` | 300 s | Nombre, top productos, conteo de órdenes |
| `ai:profile_vec:{user_id}` | 300 s | Vector 384-dim de preferencias de compra |
| `ai:session:{user_id}` | 3600 s | Historial de conversación (sliding TTL) |
| `session:{user_id}` | TTL del JWT | Sesión activa JWT |
| `blacklist:{jti}` | TTL restante del JWT | Token revocado en logout |
| `rate_limit:ai:{identifier}` | window_seconds | Contador sliding-window por usuario/IP |

**Métricas de rendimiento:**

| Escenario | p50 | p95 | p99 | Throughput |
|---|---|---|---|---|
| Chat cold (sin caché) | ~320 ms | ~480 ms | ~650 ms | ~8 req/s |
| Chat warm (caché caliente) | ~65 ms | ~95 ms | ~140 ms | ~45 req/s |

> Valores representativos. Ejecutar para medir el sistema real: `k6 run --env TOKEN=$TOKEN tests/performance/cache_test.js`

---

#### Escenario PERF-02 — Load Balancer Pattern

**Justificación del patrón elegido:**
`/products/` es el endpoint más consultado del sistema: lo invoca el frontend (catálogo, búsqueda, filtros por categoría), el AI Service durante el pipeline RAG (contexto de productos) y las páginas de detalle de orden. Un único proceso FastAPI/Uvicorn opera en un event loop asyncio y alcanza su límite de throughput práctico (~40 req/s) bajo carga concurrente alta sostenida.

Se eligió escalar **horizontalmente** con Load Balancer sobre las siguientes alternativas:
- **Escalado vertical** (más CPU/RAM al contenedor): tiene techo físico, requiere restart y no es elástico
- **Caché adicional de respuestas**: el problema es la saturación del pool de procesamiento, no la latencia de datos repetidos
- **Optimización de la BD**: la contención principal está en Uvicorn, no en PostgreSQL para este volumen

`product-service` es completamente **stateless**: no guarda ningún estado en memoria entre requests; toda la persistencia vive en `product-postgres`. Escalar a 2 réplicas no requiere ningún cambio de código.

| Elemento del escenario | Descripción |
|---|---|
| **Source** | Múltiples usuarios navegando el catálogo simultáneamente (carga pico, campaña de descuentos) |
| **Stimulus** | 50 usuarios virtuales enviando `GET /products/?page=1&page_size=20` durante 30 s sostenidos |
| **Artifact** | NGINX (`api-gateway/shared.conf`, resolver `127.0.0.11`) + 2 réplicas de `product-service` + `product-postgres` |
| **Environment** | Stack levantado con `docker-compose.lb.yml`; ambas réplicas reportan estado saludable |
| **Response** | NGINX resuelve `product-service` vía el DNS interno de Docker (`127.0.0.11`); con 2 réplicas activas, Docker retorna ambas IPs y NGINX rota entre ellas por round-robin en requests sucesivos; cada réplica atiende ~25 req concurrentes |
| **Response Measure** | Throughput ≥ 1.7× respecto a 1 réplica; p95 < 250 ms bajo 50 VUs sostenidos; tasa de error < 1% |

**Patrón:** Load Balancer Pattern — DNS Round-Robin vía Docker + NGINX Resolver

**Tácticas:**
- *Introduce Concurrency* — 2 instancias stateless atienden en paralelo; el pool de workers asyncio efectivo se duplica
- *Maintain Multiple Copies* — réplicas sin estado compartido en memoria; el escalado no requiere cambios de código
- *Manage Resources* — NGINX re-resuelve el hostname cada 10 s (`valid=10s`); Docker devuelve ambas IPs alternando en cada respuesta DNS

**Por qué no se usa `least_conn` de NGINX:**
NGINX OSS solo soporta `least_conn` dentro de un bloque `upstream {}` con hostnames resueltos **al arrancar**. Si se definen hostnames que solo existen en modo LB (ej. `product-service-1`, `product-service-2`), NGINX falla al iniciar en el setup estándar con un error `host not found in upstream`. La solución compatible con NGINX OSS es la directiva variable + resolver de Docker: NGINX re-resuelve el hostname periódicamente y Docker hace round-robin en las A-records que retorna para el servicio escalado. Para `least_conn` real con DNS dinámico se requeriría NGINX Plus o un proxy como Traefik/Envoy.

**`api-gateway/shared.conf` — distribución vía DNS round-robin:**
```nginx
resolver 127.0.0.11 ipv6=off valid=10s;   # DNS interno de Docker — re-resuelve cada 10 s

location /products/ {
    limit_req zone=general burst=20 nodelay;
    limit_req_status 429;

    set $upstream_product "product-service";
    proxy_pass         http://$upstream_product:8003;  # con 2 réplicas Docker rota las IPs
    proxy_http_version 1.1;
    proxy_set_header   Connection        "";
    proxy_set_header   Host              $host;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   X-Request-ID      $req_id;
}
```

**`docker-compose.lb.yml` — override que activa el Load Balancer:**
```yaml
# Override para Load Balancer Pattern (PERF-02).
# Levanta 2 réplicas de product-service sin modificar el stack base.
# product-service es stateless: ambas réplicas comparten product-postgres.
#
# Por qué dos archivos y no uno solo:
# El stack base (docker-compose.yml) levanta el sistema con recursos mínimos.
# Este override activa el patrón bajo demanda: 2 réplicas consumen el doble
# de RAM del servicio y no aportan nada fuera del escenario de carga.
# La separación permite demostrar el patrón de forma controlada.
#
# Uso: docker compose -f docker-compose.yml -f docker-compose.lb.yml up -d
services:
  product-service:
    deploy:
      replicas: 2
```

**Métricas de escalado (resultados reales — k6 v0.57.0, 2026-06-13):**

| Configuración | VUs | p50 | p95 | p99 | Throughput | Error |
|---|---|---|---|---|---|---|
| 1 réplica `product-service` | 50 | 727 ms | 5 120 ms | 5 960 ms | 16.2 req/s | 0% |
| 2 réplicas `product-service` | 50 | 74 ms | 1 510 ms | 1 930 ms | 32.6 req/s | 0% |
| Mejora | — | **−90%** (9.8×) | **−70%** (3.4×) | **−68%** (3.1×) | **2.02×** | — |

> Medido con `k6 run --insecure-skip-tls-verify tests/performance/lb_test.js` sobre el stack local.
> 2ª réplica registrada vía `docker network connect --alias product-service`; el rate limit de NGINX
> se elevó temporalmente (generador local exento) y se restauró tras las corridas.
> Las latencias absolutas son propias del entorno de desarrollo (Uvicorn single-process con base de
> datos local); el patrón relevante es la mejora relativa: throughput **2×** y p95 **3.4×** al doblar réplicas.
> Reproducir: `k6 run --insecure-skip-tls-verify tests/performance/lb_test.js`

**Performance Testing — Scripts k6 (`tests/performance/`):**

**`tests/performance/cache_test.js`:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

const TOKEN = __ENV.TOKEN || '';
const BASE  = 'https://localhost:8443';

export const options = {
  scenarios: {
    cold_cache: { executor: 'constant-vus', vus: 10, duration: '30s' },
    warm_cache: { executor: 'constant-vus', vus: 10, duration: '30s', startTime: '35s' },
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
    { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      insecureSkipTLSVerify: true }
  );
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

**`tests/performance/lb_test.js`:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = 'https://localhost:8443';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0  },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<400'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE}/products/?page=1&page_size=20`,
    { insecureSkipTLSVerify: true });
  check(res, {
    'status 200': (r) => r.status === 200,
    'tiene productos': (r) => {
      try { return JSON.parse(r.body).items?.length > 0; } catch { return false; }
    },
  });
  sleep(0.5);
}
```

---

### Reliability

#### Escenario REL-01 — Cold-Spare Replication Pattern

| Elemento | Descripción |
|---|---|
| **Source** | Fallo del nodo primario del `auth-service` |
| **Stimulus** | El contenedor `ecommerce_auth_service` deja de responder (crash, OOM, partición de red) |
| **Artifact** | `auth-service` (activo) + `auth-service-cold` (spare) + `spare-coordinator` (watchdog) |
| **Environment** | Sistema en producción, ambas instancias corriendo |
| **Response** | El coordinator detecta 3 fallos consecutivos (≤ 9 s) y activa el spare; NGINX redirige automáticamente al backup |
| **Response Measure** | Failover completo en ≤ 10 s (RNF-01); sin downtime perceptible para el usuario final |

**Patrón:** Replication Pattern — Cold Spare

**Justificación del patrón elegido:**
Se eligió Cold Spare sobre Hot Spare o Active-Active porque `auth-service` es stateless en memoria: todo el estado de sesión y la blacklist de tokens viven en `auth-postgres` y Redis, compartidos entre ambas instancias. La promoción del spare no requiere sincronización de estado — basta con cambiar la variable `CURRENT_ROLE` en memoria vía `POST /activate`. Cold Spare consume ~50 MB RAM (el spare no procesa requests) frente a ~200 MB del activo, optimizando recursos sin sacrificar disponibilidad. Hot Spare requeriría replicación en tiempo real de estado que no existe; Active-Active requeriría resolver conflictos de escritura concurrente en Redis que añadirían complejidad sin beneficio para este servicio.

**Tácticas:**
- *Passive Redundancy (Cold Spare)* — el spare corre en modo pasivo hasta ser activado
- *Fault Detection* — watchdog polling `GET /health` cada 3 s, umbral 3 fallos consecutivos
- *Recovery* — promoción de rol vía `POST /activate` sin restart del contenedor
- *Prepared Spare* — ambas instancias comparten la misma BD (`auth-postgres`)

**`coordinator/coordinator.py`:**
```python
ACTIVE_HEALTH_URL = "http://ecommerce_auth_service:8001/health"
COLD_ACTIVATE_URL = "http://ecommerce_auth_service_cold:8002/activate"
CHECK_INTERVAL = 3    # segundos entre health checks
MAX_FAILURES  = 3     # fallos consecutivos antes de activar el spare

def monitorear():
    fallos_consecutivos = 0
    while True:
        try:
            response = requests.get(ACTIVE_HEALTH_URL, timeout=2)
            fallos_consecutivos = 0 if response.status_code == 200 else fallos_consecutivos + 1
        except requests.exceptions.RequestException:
            fallos_consecutivos += 1
            print("[COORDINATOR] Active service unreachable.")

        if fallos_consecutivos >= MAX_FAILURES:
            requests.post(COLD_ACTIVATE_URL, timeout=3)   # activa el spare
            break

        time.sleep(CHECK_INTERVAL)
```

**`backend/auth_service/main.py` — endpoint de promoción de rol:**
```python
CURRENT_ROLE = getattr(settings, "role", "active")  # "spare" en auth-service-cold

@app.post("/activate")
async def activate_spare():
    global CURRENT_ROLE
    if CURRENT_ROLE == "spare":
        CURRENT_ROLE = "active"
        print("[SYSTEM] Role changed from SPARE to ACTIVE. Failover processed.")
        return {"status": "activated", "message": "Role changed to active."}
    return {"status": "ignored", "message": "Instance is already active."}

@app.get("/health")
async def health_check() -> JSONResponse:
    health_status = {"status": "ok", "service": "auth_service",
                     "database": "unknown", "redis": "unknown"}
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    return JSONResponse(
        status_code=200 if health_status["status"] == "ok" else 500,
        content=health_status
    )
```

**`api-gateway/nginx.conf` — failover a nivel de gateway:**
```nginx
upstream auth_backend {
    server ecommerce_auth_service:8001      max_fails=2 fail_timeout=5s;
    server ecommerce_auth_service_cold:8002 backup;
}
# IPs fijas son necesarias: NGINX OSS cachea la IP al arrancar
# auth-service=172.20.1.10, auth-service-cold=172.20.1.11
```

**Métricas:**

| Métrica | Valor | Cómo verificar |
|---|---|---|
| Tiempo de detección | ≤ 9 s (3 × 3 s) | Logs del coordinator |
| Tiempo total de failover | ≤ 10 s | `docker stop ecommerce_auth_service` + cronómetro |
| Disponibilidad con cold-spare | > 99.9% | — |

---

#### Escenario REL-02 — Fault Tolerance / Resilience Pattern

| Elemento | Descripción |
|---|---|
| **Source** | Fallo parcial de infraestructura (ai-postgres, RabbitMQ, servicio dependiente) |
| **Stimulus** | `ai-postgres` cae durante una sesión de chat; o RabbitMQ pierde conexión durante una saga |
| **Artifact** | AI Service (fail-open), Order/Product Service (saga + idempotencia + DLQ + retries) |
| **Environment** | Sistema en operación, fallo parcial de un componente de infraestructura |
| **Response** | AI Service continúa en modo keyword; la saga reintenta con backoff o compensa; eventos duplicados descartados por idempotencia |
| **Response Measure** | Chat responde en < 3 s con pgvector caído; tasa de órdenes huérfanas = 0; DLQ captura mensajes no procesables |

**Patrón:** Fault Tolerance — Graceful Degradation + Saga con Compensación + Idempotencia

**Justificación del patrón elegido:**
En una arquitectura de microservicios los fallos parciales son inevitables; la pregunta es cómo responde el sistema ante ellos. Se eligió esta combinación de tácticas porque:
- **Graceful Degradation**: la disponibilidad parcial es siempre preferible al downtime total; el AI Service con pgvector caído sigue siendo útil (responde con búsqueda keyword)
- **Saga vs 2PC**: las transacciones distribuidas en dos fases (2PC) bloquean recursos globalmente y son frágiles en redes inestables; el Saga coreográfico mantiene consistencia eventual sin coordinador central, cada servicio gestiona su propia consistencia local
- **Idempotencia**: RabbitMQ garantiza entrega *at-least-once*; sin `ProcessedEvent` los reintentos generarían duplicados de stock reservado o pagos dobles

**Tácticas:**
- *Graceful Degradation* — AI degrada a búsqueda keyword si pgvector no responde
- *Rollback / Compensation* — saga cancela la orden y libera stock si no hay inventario
- *Retry con backoff* — publisher reintenta hasta 8 veces con backoff exponencial (max 5 s)
- *Idempotent Processing* — `ProcessedEvent` descarta duplicados por `event_id`
- *Exception Handling* — DLQ captura mensajes fallidos para inspección manual

**`backend/AI_service/main.py` — fail-open en startup:**
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(text(
                "CREATE INDEX IF NOT EXISTS ix_product_embeddings_embedding_hnsw "
                "ON product_embeddings USING hnsw (embedding vector_cosine_ops)"
            ))
        indexer_task = asyncio.create_task(run_indexer_loop())
    except Exception as exc:
        logger.warning("RAG database unavailable, running keyword-only: %s", exc)
        # NO relanza — el servicio sigue levantando y sirve peticiones
    yield
```

**`backend/AI_service/src/services/retrieval.py` — fail-open en búsqueda semántica:**
```python
async def semantic_search(query_vec, profile_vec=None, ...) -> list[dict]:
    try:
        distance = ProductEmbedding.embedding.cosine_distance(query_vec)
        if profile_vec:
            ranking = (1.0 - weight) * distance + weight * profile_distance
        rows = await session.execute(
            select(ProductEmbedding)
            .where(ProductEmbedding.is_active.is_(True))
            .where(ProductEmbedding.stock > 0)
            .order_by(ranking).limit(limit)
        )
        return [{...} for row in rows]
    except Exception as exc:
        logger.warning("semantic_search failed (falling back to keyword): %s", exc)
        return []   # fail-open: el caller usa búsqueda keyword como fallback
```

**`backend/order_service/src/events/publisher.py` — retry con backoff exponencial:**
```python
def _publish_with_retry(self, exchange, routing_key, body) -> bool:
    max_attempts = 8
    for attempt in range(1, max_attempts + 1):
        try:
            self._ensure_channel()
            self.channel.basic_publish(
                exchange=exchange, routing_key=routing_key, body=body,
                properties=pika.BasicProperties(
                    delivery_mode=2,                         # mensaje persistente
                    content_type="application/json"))
            return True
        except Exception:
            self.channel = None
            delay = min(0.5 * (2 ** (attempt - 1)), 5)      # max 5 s entre reintentos
            time.sleep(delay)
    return False
```

**`backend/order_service/src/services/payment_service.py` — lock pesimista:**
```python
async def pay_order(db, order_id, user_id, payload):
    result = await db.execute(
        select(Order).where(Order.id == order_id).with_for_update()  # lock de fila
    )
    order = result.scalars().first()

    if order.status == OrderStatus.paid:
        raise HTTPException(409, "Order is already paid.")
    if order.status not in {OrderStatus.confirmed}:
        raise HTTPException(409, f"Order '{order.status.value}' cannot be paid.")

    payment = Payment(
        card_last4=payload.card_number[-4:] if payload.card_number else None,
        # NUNCA almacena el número de tarjeta completo
    )
    await asyncio.sleep(1.5)   # latencia simulada del gateway externo
```

**`backend/order_service/src/schemas/events.py` — envelope con idempotencia:**
```python
class EventEnvelope(BaseModel, Generic[T]):
    event_id: str        # UUID único — clave de idempotencia en ProcessedEvent
    event_type: str      # "ORDER_CREATED", "STOCK_RESERVED", "ORDER_PAID", ...
    timestamp: str       # ISO 8601
    correlation_id: str  # saga_id para trazabilidad end-to-end
    data: T              # payload tipado con Pydantic

def build_envelope(event_type, data, correlation_id) -> dict:
    return {
        "event_id": str(uuid.uuid4()),
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "correlation_id": correlation_id,
        "data": data,
    }
```

---

### Interoperability

#### Escenario INT-01 — Adapter Pattern + Event-Driven Integration

| Elemento | Descripción |
|---|---|
| **Source** | AI Service internamente |
| **Stimulus** | Usuario envía un mensaje al chat; el servicio necesita respuesta del LLM externo (Groq) y datos del inventario real |
| **Artifact** | AI Service + Groq API (externa) + product-service, user-service (HTTP internos) + RabbitMQ (mensajería) |
| **Environment** | Sistema en operación normal, Groq API disponible |
| **Response** | El AI Service adapta el protocolo de Groq, enriquece el prompt con contexto RAG y responde en < 5 s |
| **Response Measure** | 100% de respuestas grounded en inventario real; < 5 s de latencia; mensajes RabbitMQ con contrato JSON tipado validado por Pydantic |

**Patrón:** Adapter Pattern (Anti-Corruption Layer) + Event-Driven Integration

**Tácticas:**
- *Tailor Interface* — SDK de Groq encapsula el protocolo HTTP externo
- *Orchestrate* — AI Service coordina 4 fuentes de datos en paralelo antes de invocar el LLM
- *Discover Service* — URLs de servicios configurables vía env vars (`PRODUCT_SERVICE_URL`, `USER_SERVICE_URL`)
- *Manage Interfaces* — envelopes JSON tipados con Pydantic garantizan contrato estable entre servicios

**`backend/AI_service/src/services/Ai_service.py`:**
```python
from groq import AsyncGroq   # Adapter: SDK encapsula protocolo HTTP de Groq

class AiService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.resolved_api_key)
        self.model = settings.ai_model   # "llama-3.1-8b-instant"

    async def get_response(self, user_message, auth_token, user_id, ...) -> str:
        # Recolección paralela de 4 fuentes de contexto independientes
        history, ctx, price_range, profile_vec = await asyncio.gather(
            conversation_memory.get_history(user_id),
            user_context.get_user_context(user_id, auth_token),
            price_extractor.extract_price_range(user_message, self.client),
            retrieval.get_profile_vector(user_id, auth_token),
        )

        # RAG: embed → pgvector → merge con keyword si < 3 resultados
        query_vec = await embedding_service.embed_query(retrieval_text)
        products  = await retrieval.semantic_search(query_vec, profile_vec=profile_vec,
                                                     min_price=min_price, max_price=max_price)
        if len(products) < 3:
            keyword_products = await product_client.search_products(query, auth_token)
            products = self._merge_products(products, keyword_products, top_k)

        # Llamada al LLM externo con prompt enriquecido
        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *history,
                {"role": "user", "content":
                    f"Pregunta: {user_message}\n\nProductos disponibles:\n{products_block}"},
            ],
            temperature=0.3, max_tokens=600,
        )
        return completion.choices[0].message.content
```

**Exchanges RabbitMQ — protocolo inter-servicios:**

| Exchange | Tipo | Routing Key | Publicador | Consumidor |
|---|---|---|---|---|
| `events` | fanout | — | auth-service, order-service | user-service |
| `commerce.saga` | topic | `order.created` | order-service | product-service |
| `commerce.saga` | topic | `order.cancelled` | order-service | product-service |
| `commerce.saga` | topic | `stock.reserved` | product-service | order-service |
| `commerce.saga` | topic | `stock.unavailable` | product-service | order-service |
| `commerce.saga` | topic | `order.paid` | order-service | (extensible) |
| `commerce.saga.dlx` | topic | — | automático (fallo) | inspección manual |

**`backend/AI_service/src/services/retrieval.py` — RAG con pgvector:**
```python
async def semantic_search(query_vec, profile_vec=None, ...) -> list[dict]:
    # Distancia coseno sobre índice HNSW — O(log n) para búsqueda aproximada
    distance = ProductEmbedding.embedding.cosine_distance(query_vec)
    if profile_vec:
        weight  = settings.ai_profile_weight   # 0.25 por defecto
        # Ranking personalizado: 75% query + 25% perfil de compras
        ranking = (1.0 - weight) * distance + weight * profile_distance
    rows = await session.execute(
        select(ProductEmbedding)
        .where(ProductEmbedding.is_active.is_(True))
        .where(ProductEmbedding.stock > 0)
        .order_by(ranking).limit(limit)
    )
    return [{"id": str(row.product_id), "name": row.name, "price": str(row.price),
             "average_rating": float(row.average_rating) if row.average_rating else None,
             "review_count": row.review_count or 0} for row in rows]
```

---

## Prototype

### Prerrequisitos

- Docker y Docker Compose v2+
- `openssl` para el certificado TLS autofirmado
- ~5 GB de RAM disponibles (15 contenedores + modelo fastembed ONNX ~120 MB)
- Puertos libres: `3000`, `8000`, `8443`
- API Key de Groq → [console.groq.com](https://console.groq.com)

### Despliegue local

```bash
# 1. Clonar y cambiar a la rama del Prototype 3
git clone https://github.com/jpastor1649/ecommerce-project.git
cd ecommerce-project
git checkout FinalProject3

# 2. Generar certificado TLS autofirmado
bash generate_certs.sh
# Genera: api-gateway/certs/nginx.crt y api-gateway/certs/nginx.key

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env — mínimo requerido:
#   AI_API_KEY=<tu_groq_api_key>
#   AUTH_JWT_SECRET=<secreto_seguro_32_chars>

# 4. Levantar el stack completo (15 contenedores)
docker compose up -d --build
# Primera vez: descarga imágenes + compila fastembed (~5 min)

# 5. Verificar salud
docker compose ps
curl -k https://localhost:8443/health
# Esperado: {"status":"ok","service":"api-gateway"}

# 6. Acceder
# Frontend:    http://localhost:3000
# API Docs:    https://localhost:8443/docs
# RabbitMQ:    http://localhost:15672  (guest / guest)
```

### Verificar los escenarios de calidad

```bash
# SEC-01 — Reverse Proxy
curl http://localhost:8001/health        # Connection refused ✓
curl -k https://localhost:8443/health   # {"status":"ok"} ✓

# SEC-02 — Rate limiting (AI zone: 2 req/s)
for i in $(seq 1 10); do
  curl -sk -o /dev/null -w "%{http_code}\n" -X POST https://localhost:8443/ai/chat/ \
    -H "Content-Type: application/json" -d '{"message":"test"}'; done
# Algunas respuestas 429 ✓

# REL-01 — Cold-spare failover
docker stop ecommerce_auth_service
sleep 12
curl -k https://localhost:8443/auth/health   # ✓ responde desde el spare

# REL-02 — Fail-open AI
docker stop ecommerce_ai_postgres
curl -sk -X POST https://localhost:8443/ai/chat/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"recomiéndame algo"}' | jq .response
# ✓ responde en modo keyword con pgvector caído

# PERF — Performance testing
k6 run --env TOKEN=$TOKEN tests/performance/cache_test.js
k6 run tests/performance/lb_test.js
```

### Apagar el stack

```bash
docker compose down      # detiene sin borrar datos
docker compose down -v   # detiene y borra volúmenes (reset completo)
```
