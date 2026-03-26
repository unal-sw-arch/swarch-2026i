# Click & Munch Backend

Este backend tiene una arquitectura de microservicios con un único API Gateway como punto de entrada para la comunicación con el frontend. Cada microservicio gestiona sus propios datos y utiliza una base de datos dedicada (PostgreSQL o MongoDB).

## Arquitectura

- Microservicios: `AuthService`, `RestaurantService`, `GeoService`, `MenuService`
- Bases de datos:
  - AuthService → PostgreSQL (`auth_db` en localhost:5433)
  - RestaurantService → PostgreSQL (`restaurant_db` en localhost:5434)
  - GeoService → PostGIS (`geo_db` en localhost:5435)
  - MenuService → MongoDB (`menu_db` en localhost:27018)
- API Gateway: `APIGateway` (expone una interfaz pública unificada al frontend)
- Puertos de servicios:
  - APIGateway: 8080
  - AuthService: 8081
  - RestaurantService: 8082
  - GeoService: 8083
  - MenuService: 8084
- Enrutamiento (Gateway → Servicios):
  - `/auth/**` → AuthService (`/api/auth/**`)
  - `/restaurant/**` → RestaurantService (`/api/restaurants/**`)
  - `/menu/**` → MenuService (`/api/menus/**`)

El gateway reescribe las rutas entrantes hacia la API interna de cada servicio. Por ejemplo, `/auth/register` → `/api/auth/register` en AuthService.

## Patrones de Diseño y Prácticas

- Patrón API Gateway: Punto de ingreso central que enruta a los servicios internos; reescritura de rutas y CORS se manejan en el gateway.
- Filtro: `JwtAuthenticationFilter` en el gateway protege las rutas restringidas (ej. restaurant/menu) mientras que las rutas de autenticación permanecen públicas.
- Autenticación basada en JWT: La generación y validación de tokens está encapsulada en `JwtTokenUtil`.
- Arquitectura por capas:
  - Controller (endpoints HTTP)
  - Service (lógica de negocio)
  - Repository (acceso a datos mediante Spring Data)
  - DTOs (modelos de petición/respuesta entre capas)
- Patrón Repository: Los repositorios de Spring Data como `UserRepository` abstraen la persistencia.
- Patrón Builder: Las entidades (ej. `User`) usan Lombok `@Builder` para su construcción.
- Inyección de Dependencias: Componentes gestionados por Spring (`@Service`, `@RestController`, `@Bean`).
- Patrón de Integración/Cliente: `RestaurantService` usa `AuthClient` para consultar datos de usuarios; los servicios se comunican entre sí vía HTTP.

## API Gateway (Punto Único de Acceso)

Todo el tráfico del frontend pasa por el gateway en `http://localhost:8080`.

- Público:
  - `/auth/**` → redirigido a AuthService; no requiere JWT.
- Protegido (JWT requerido mediante filtro del gateway):
  - `/restaurant/**` → redirigido a RestaurantService
  - `/menu/**` → redirigido a MenuService

Nota: Las rutas de GeoService son consumidas internamente por otros servicios y no están expuestas directamente a través del gateway.

## Endpoints de los Servicios

A continuación se listan los endpoints internos de cada servicio (el gateway mapea las solicitudes externas a estos). Desde el frontend, usa las rutas del gateway.

### AuthService (base interna: `/api/auth`)
- `POST /api/auth/login` → Iniciar sesión y recibir un token.
- `POST /api/auth/register` → Registrar un nuevo usuario.
- `GET /api/auth/users/{userId}` → Obtener información de usuario por ID.
- Restablecimiento de contraseña (base: `/auth/password-reset`)
  - `POST /auth/password-reset/request` → Solicitar un token de restablecimiento por correo.
  - `POST /auth/password-reset/confirm` → Confirmar el restablecimiento con token y nueva contraseña.

Mapeo del gateway:
- `/auth/login` → `/api/auth/login`
- `/auth/register` → `/api/auth/register`
- `/auth/users/{userId}` → `/api/auth/users/{userId}`
- Para restablecimiento de contraseña, asegurar que la base del controlador coincida con la reescritura de rutas del gateway (recomendado: `/api/auth/password-reset/**`).

### RestaurantService (base interna: `/api/restaurants`)
- `POST /api/restaurants` → Crear un restaurante.
- `GET /api/restaurants/{id}` → Obtener restaurante por ID.
- `GET /api/restaurants/owner/{ownerId}` → Listar restaurantes por ID de propietario.
- `GET /api/restaurants/nearby` → Búsqueda de restaurantes cercanos usando GeoService.
- `GET /api/restaurants/{id}/details` → Detalles agregados del restaurante.

Mapeo del gateway:
- `/restaurant` → `/api/restaurants`
- `/restaurant/{id}` → `/api/restaurants/{id}`
- `/restaurant/owner/{ownerId}` → `/api/restaurants/owner/{ownerId}`
- `/restaurant/nearby` → `/api/restaurants/nearby`
- `/restaurant/{id}/details` → `/api/restaurants/{id}/details`

### MenuService (base interna: `/api/menus`)
Categorías:
- `POST /api/menus/categories` → Crear categoría.
- `GET /api/menus/categories/{categoryId}` → Obtener categoría.
- `PUT /api/menus/categories/{categoryId}` → Actualizar categoría.
- `DELETE /api/menus/categories/{categoryId}` → Eliminar categoría.

Ítems:
- `POST /api/menus/categories/{categoryId}/items` → Crear ítem en una categoría.
- `GET /api/menus/items/{itemId}` → Obtener ítem.
- `PUT /api/menus/items/{itemId}` → Actualizar ítem.
- `DELETE /api/menus/items/{itemId}` → Eliminar ítem.

Restaurantes:
- `POST /api/menus` → Crear menú completo (categorías + ítems) para un restaurante.
- `GET /api/menus/restaurants/{restaurantId}` → Obtener menú completo por restaurante.
- `GET /api/menus/restaurants/{restaurantId}/items` → Listar ítems de un restaurante.
- `DELETE /api/menus/restaurants/{restaurantId}` → Eliminar todos los datos del menú de un restaurante.

Mapeo del gateway:
- `/menu/**` → `/api/menus/**`

### GeoService (base interna: `/api/geo`)
- `POST /api/geo/locations` → Crear ubicación (restaurante, etc.).
- `POST /api/geo/nearby` → Buscar ubicaciones cercanas.
- `GET /api/geo/locations` → Listar todas las ubicaciones.

Consumido generalmente por RestaurantService; no está expuesto directamente a través del gateway.

## Ejecución Local

1. Iniciar toda la pila del backend con Docker Compose:

```bash
cd ClickAndMunchApp/backend
docker compose up --build -d
```

2. Verificar que los contenedores estén saludables:

```bash
docker compose ps
```

3. Probar un registro a través del gateway:

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plinio Rodolfo",
    "email": "plinio@example.com",
    "username": "plinieichon",
    "password": "123987",
    "role": "CUSTOMER"
  }'
```

Si proteges más rutas, incluye `Authorization: Bearer <token>` en las solicitudes a `/restaurant/**` o `/menu/**`.
