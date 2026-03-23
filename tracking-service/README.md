# Tracking Service

Servicio HTTP para registrar y consultar eventos de actividad de entidades de negocio (en especial ordenes), construido con Django + Django REST Framework y persistencia en MongoDB.

## Stack

- Python 3.12+
- Django 6
- Django REST Framework
- PyMongo
- MongoDB 7

## Arquitectura

El proyecto esta organizado en capas:

- `activities/domain/`: entidades, enums y validaciones de dominio.
- `activities/application/`: casos de uso y puertos.
- `activities/infrastructure/`: repositorio Mongo, cliente Mongo y wiring.
- `activities/interfaces/http/`: serializers, vistas y rutas HTTP.
- `activities/tests/unit/`: pruebas unitarias de dominio, casos de uso y capa HTTP.

## Endpoints

### `POST /activities`
Registra un evento de actividad.

Payload base:

```json
{
  "eventType": "ORDER_CREATED",
  "entityType": "ORDER",
  "entityId": "5001",
  "restaurantId": 1,
  "orderId": "5001",
  "timestamp": "2026-03-14T21:10:00Z",
  "sourceService": "order-service",
  "payload": {
    "status": "CREATED"
  }
}
```

Respuesta exitosa (`201`):

```json
{
  "id": "<event_id>",
  "status": "RECORDED"
}
```

### `GET /activities/order/{order_id}`
Obtiene historial de eventos de una orden.

Respuesta exitosa (`200`):

```json
{
  "orderId": "5001",
  "events": [
    {
      "id": "evt-1",
      "eventType": "ORDER_CREATED",
      "entityType": "ORDER",
      "entityId": "5001",
      "restaurantId": 1,
      "orderId": "5001",
      "timestamp": "2026-03-14T21:10:00Z",
      "sourceService": "order-service",
      "payload": {
        "status": "CREATED"
      }
    }
  ]
}
```

## Contrato de errores HTTP

Todas las respuestas de error exponen el mismo shape:

```json
{
  "code": "ERROR_CODE",
  "message": "human readable message"
}
```

Codigos actuales:

- Validacion de input y dominio: `INVALID_EVENT` (`400`).
- Errores de persistencia: `INTERNAL_ERROR` (`503`).

## Contrato de estados de orden

`OrderStatus` esta alineado con el contrato:

- `CREATED`
- `IN_PREPARATION`
- `READY`
- `DELIVERED`
- `CANCELLED`

## Variables de entorno

Se cargan desde `.env` (via `python-dotenv`) y/o entorno del proceso.

- `DEBUG` (default: `False`)
- `ALLOWED_HOSTS` (default: `*`, formato CSV)
- `MONGO_URI` (default: `mongodb://localhost:27017/`)
- `MONGO_DB_NAME` (default: `tracking_service_db`)
- `MONGO_COLLECTION_NAME` (default: `activity_events`)

## Logging

Se usa logging estandar de Python en:

- Recepcion de evento HTTP.
- Validaciones fallidas.
- Persistencia exitosa.
- Fallas de persistencia con `logger.exception(...)`.
- Consulta de historial de orden.

## Indices Mongo

Al obtener la coleccion, el cliente Mongo crea indices idempotentes en:

- `orderId`
- `restaurantId`
- `eventType`
- `timestamp`

## Ejecutar local (sin Docker)

1. Crear y activar entorno virtual.
2. Instalar dependencias.
3. Levantar MongoDB (local o contenedor).
4. Ejecutar servidor Django.

Ejemplo en PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

## Ejecutar con Docker Compose

```powershell
docker compose up --build
```

Servicios:

- API: `http://127.0.0.1:8000`
- Mongo: `mongodb://127.0.0.1:27017`

## Tests

Ejecutar suite unitaria de activities:

```powershell
python manage.py test activities.tests.unit
```

## Notas

- Las rutas publicas actuales no usan `activities/views.py` legacy.
- Las rutas activas estan definidas en `activities/interfaces/http/urls.py` e incluidas desde `tracking_service/urls.py`.
