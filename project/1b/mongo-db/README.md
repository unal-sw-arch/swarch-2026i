# Base de Datos - Tracking Service (MongoDB)

Este módulo contiene la infraestructura de base de datos NoSQL para el servicio de trazabilidad (Tracking Service). Está diseñado para registrar el historial y los eventos operativos del sistema, aislando la trazabilidad documental de las operaciones transaccionales principales que residen en PostgreSQL.

## Entornos Disponibles

El equipo puede conectarse a esta base de datos de dos maneras: a través de la nube compartida o levantándola localmente mediante Docker.

### Opción 1: Entorno Cloud (MongoDB Atlas)

La base de datos ya se encuentra desplegada en MongoDB Atlas con los índices y datos de prueba cargados. No es necesario levantar contenedores locales para usarla. 

* **URI de conexión:** `mongodb+srv://tracking_service_user:fl7Evm9lczJvO8zN@arquisoftcluster.pmpyoih.mongodb.net/tracking_context?retryWrites=true&w=majority`
* **Nombre de la base de datos:** `tracking_context`
* **Colección principal:** `activity_events`

### Opción 2: Entorno Local (Docker)

Si requiere trabajar sin conexión a internet o necesita reiniciar la base de datos a su estado original para pruebas destructivas, puede levantarla localmente:

1. Si es la primera vez que ejecuta el proyecto o desea reiniciar los datos de prueba, limpie el entorno:
   `docker-compose down -v`
2. Inicie el contenedor:
   `docker-compose up -d`

* **URI de conexión local:** `mongodb://tracking_service_user:tracking_password_2026@127.0.0.1:27017/tracking_context?authSource=tracking_context`

---

## Datos de Prueba Iniciales (Mock Data)

La base de datos (tanto en Atlas como en local) se inicializa con sus respectivos índices de búsqueda y de 12 eventos de prueba. 

Estos registros incluyen explícitamente los **5 estados oficiales del ciclo de vida de un pedido**:
* `CREATED` (Creado)
* `PREPARING` (En preparación)
* `READY` (Listo para entrega)
* `DELIVERED` (Entregado)
* `CANCELLED` (Cancelado)

Estos estados están distribuidos en los siguientes **escenarios cronológicos** para facilitar las pruebas del Frontend y Backend:

1. **Configuración inicial:** Eventos de creación de restaurante, menú, y productos.
2. **Pedido completado:** El ciclo de vida íntegro de un pedido pasando por CREATED, PREPARING, READY y DELIVERED.
3. **Pedido en curso:** Un pedido activo que ha transicionado de CREATED a PREPARING.
4. **Pedido cancelado:** Un pedido que pasa de CREATED a CANCELLED con su respectivo motivo.

Para visualizar, filtrar y gestionar estos datos cronológicos en cualquiera de los entornos se recomienda el uso de **MongoDB Compass**.