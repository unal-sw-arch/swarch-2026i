# Segunda Entrega — Estructura Arquitectónica Distribuida
**Curso:** Arquitectura de Software (Arquisoft)  
> **Entrega:** Segunda Entrega — Prototipo Distribuido  
> **Fecha:** 2026-04-20

---

## Equipo

**Nombre:** Grupo D

| # | Nombre completo |
|---|---|
| 1 | Sara Isabel Ospina Valderrama |
| 2 | Andrés Felipe Perdomo Uruburu |
| 3 | Juan David Castañeda Cárdenas |
| 4 | John Alejandro Pastor Sandoval |

---

## Sistema B2C

<h1 align="center">AICart</h1>

<p align="center">
  <img src="./AICart.png" width="400">
</p>

<p align="center">
  Plataforma de e-commerce moderna 🚀
</p>

**Descripción:**

Se propone el desarrollo de una plataforma de comercio electrónico tipo B2C (Business-to-Consumer) inteligente, que permite a los usuarios explorar un catálogo de productos multi-categoría, gestionar un carrito de compras y completar transacciones mediante una pasarela de pagos integrada.

La plataforma incorpora capacidades de inteligencia artificial generativa para mejorar la experiencia del usuario, incluyendo búsqueda inteligente de productos, recomendaciones personalizadas basadas en el historial de navegación, compras y tendencias del catálogo, así como un asistente conversacional que facilita la interacción y navegación dentro del sistema.

Adicionalmente, el sistema implementa mecanismos de moderación automatizada de reseñas con el fin de garantizar la calidad y pertinencia del contenido generado por los usuarios.

Para ello, se integra el modelo Google Gemini Flash como proveedor de servicios de IA generativa, permitiendo la incorporación de funcionalidades avanzadas sin requerir el entrenamiento de modelos propios.

---

## Requerimientos Funcionales

Los siguientes requerimientos funcionales definen el dominio y el alcance del sistema:

| ID | Descripción |
|---|---|
| RF-01 | El sistema debe permitir el registro de nuevos usuarios, inicio de sesión y gestión de perfiles individuales. |
| RF-02 | El sistema debe almacenar el historial de compras y las interacciones de los usuarios con los productos, incluyendo acciones como la visualización y la adquisición de productos. |
| RF-03 | El sistema debe permitir a los usuarios visualizar el catálogo completo de productos disponibles en la plataforma. |
| RF-04 | El sistema debe permitir a los usuarios gestionar su carrito de compras, incluyendo agregar productos, eliminar productos y modificar la cantidad de unidades antes de realizar la compra. |
| RF-05 | El sistema debe generar recomendaciones de productos personalizadas utilizando un sistema de inteligencia artificial que analice el historial de compras y las interacciones de los usuarios con los productos. |
| RF-06 | El sistema debe permitir a los usuarios publicar reseñas y calificaciones sobre los productos que hayan adquirido. |
| RF-07 | El sistema debe exponer un asistente conversacional de IA generativa que ayude al usuario a encontrar productos, resolver dudas y recibir recomendaciones en lenguaje natural. |
| RF-08 | El sistema debe permitir a los usuarios registrar y publicar productos dentro del catálogo de la plataforma, asignándolos a una categoría específica para su comercialización. |
| RF-09 | El sistema debe permitir a los usuarios visualizar las estadísticas de ventas realizadas, incluyendo información como número de productos vendidos, ingresos generados y productos más vendidos. |
| RF-10 | El sistema debe permitir a los usuarios completar el proceso de checkout para finalizar la compra de los productos seleccionados, ingresando la información de envío y seleccionando un método de pago disponible. |
| RF-11 | El sistema debe permitir a los usuarios buscar productos por nombre o categoría y aplicar filtros para refinar los resultados de búsqueda. |
| RF-12 | El sistema debe permitir la clasificación de productos en categorías para facilitar su organización y búsqueda dentro del catálogo. |

---
### Alcance Funcional del Prototipo (Segunda Entrega)

El prototipo presenta una **arquitectura de microservicios distribuida**, donde las responsabilidades del sistema se desacoplan en servicios independientes que se comunican mediante **HTTP (sincrónico)** y **eventos (asincrónico)**.

Se implementa un **flujo de extremo a extremo** que involucra múltiples servicios.

#### Flujo cubierto:

1. **Autenticación de usuario**  
   - El usuario inicia sesión a través del API Gateway  
   - El servicio de autenticación valida las credenciales contra su base de datos  
   - Se genera un **JWT** y se almacena en Redis  
   - El token es utilizado para autorizar futuras solicitudes a otros servicios  

2. **Gestión de usuarios**  
   - El usuario se registra a través del sistema de autenticación  
   - El servicio de autenticación crea las credenciales del usuario  
   - Se publica un evento en el broker de mensajería  
   - El servicio de usuarios consume este evento y crea el perfil del usuario en su base de datos  
   - La información del usuario se almacena en PostgreSQL (base de datos propia del servicio)   

3. **Gestión de catálogo de productos**  
   - El usuario autenticado accede al catálogo mediante el API Gateway  
   - El servicio de productos valida el JWT antes de procesar la solicitud  
   - Se permite la creación y consulta de productos  
   - Los productos se almacenan en su base de datos correspondiente  

4. **Publicación de reseñas de productos**  
   - Los usuarios autenticados pueden publicar reseñas sobre productos existentes  
   - El servicio de productos gestiona la creación y almacenamiento de reseñas  
   - Esta funcionalidad permite incorporar interacción entre usuarios dentro del sistema  

5. **Procesamiento inteligente (AI Service)**  


6. **Comunicación asincrónica basada en eventos**  
   - Los servicios publican eventos en un broker (RabbitMQ) ante acciones relevantes  
   - Otros servicios se suscriben a estos eventos y reaccionan de forma desacoplada  
   - Este mecanismo permite:
     - escalabilidad  
     - independencia entre servicios  
     - extensión futura del sistema  
---

## Requerimientos No Funcionales

| ID | Descripción | Criterio de verificación |
|---|---|---|
| RNF-01 | **Disponibilidad:** El sistema debe garantizar la continuidad de las funcionalidades principales ante fallos de componentes no críticos. | El sistema continúa permitiendo operaciones principales (navegación de catálogo, carrito y checkout) cuando un componente no crítico falla. |
| RNF-02 | **Arquitectura modular:** El sistema debe estar diseñado de manera modular, permitiendo la independencia y desacoplamiento de sus componentes. | Los componentes del sistema pueden ser desarrollados, desplegados y mantenidos de manera independiente sin afectar el funcionamiento global. |
| RNF-03 | **Integración de IA generativa:** El sistema debe integrar servicios de inteligencia artificial para funcionalidades como recomendaciones, búsqueda inteligente y asistencia conversacional. | El sistema genera recomendaciones y respuestas en lenguaje natural basadas en el contexto del usuario. |
| RNF-04 | **Despliegue:** El sistema debe permitir su despliegue de manera reproducible mediante un proceso automatizado. | El sistema puede ser desplegado en un entorno limpio siguiendo un procedimiento estandarizado sin configuraciones manuales complejas. |
| RNF-05 | **Seguridad:** El sistema debe garantizar la protección de los datos de los usuarios mediante mecanismos de autenticación y control de acceso. | Solo usuarios autenticados pueden acceder a funcionalidades protegidas del sistema y a sus datos asociados. |

### Requerimientos del Curso 

| ID | Requerimiento |
|---|---|
| C-RNF-01 | El sistema debe seguir una arquitectura distribuida |
| C-RNF-02 | El sistema debe incluir al menos dos componentes de presentación (uno de ellos: frontend web) |
| C-RNF-03 | El frontend web debe seguir una subarquitectura SSR (Server-Side Rendering) |
| C-RNF-04 | El sistema debe incluir al menos cuatro componentes de lógica |
| C-RNF-05 | El sistema debe incluir al menos un componente que permita la comunicación/orquestación entre los componentes de lógica |
| C-RNF-06 | El sistema debe incluir al menos cuatro componentes de datos (incluyendo bases de datos relacionales y NoSQL) |
| C-RNF-07 | El sistema debe incluir al menos un componente encargado de manejar procesos asincrónicos |
| C-RNF-08 | El sistema debe incluir un conjunto de conectores basados en HTTP |
| C-RNF-09 | El sistema debe estar construido usando al menos cuatro lenguajes de programación |
| C-RNF-10 | El despliegue del sistema debe ser orientado a contenedores |

---

## Estructuras Arquitectónicas

### Vista de Componentes y Conectores

![Vista de Componentes y Conectores](cc.svg)

#### Descripción de los elementos y relaciones Arquitectónicas 

El sistema se compone de múltiples elementos arquitectónicos organizados bajo un enfoque de microservicios, donde cada componente tiene una responsabilidad específica.

##### Componentes principales

- **Frontend (Web Application)**  
  Interfaz de usuario que permite la interacción con el sistema. Se comunica exclusivamente con el API Gateway mediante HTTP.

- **API Gateway**  
  Punto de entrada único al sistema. Se encarga de enrutar las solicitudes del cliente hacia los microservicios correspondientes.

- **Auth Service**  
  Responsable de la autenticación de usuarios. Gestiona credenciales, genera tokens JWT y administra sesiones mediante Redis.

- **User Service**  
  Encargado de la gestión de perfiles de usuario. Mantiene su propia base de datos y crea perfiles a partir de eventos generados por el servicio de autenticación.

- **Product Service**  
  Gestiona el catálogo de productos y las reseñas. Valida tokens JWT para autorizar las operaciones.

- **Order Service**  
  Responsable de la gestión de pedidos. Permite la creación y consulta de órdenes, valida la información de productos mediante el Product Service y publica eventos relacionados con el ciclo de vida de las órdenes.

- **AI Service**  
  Consume eventos del sistema para procesar información y generar funcionalidades inteligentes como recomendaciones y personalización.

- **Message Broker (RabbitMQ)**  
  Permite la comunicación asincrónica entre servicios mediante eventos.

- **Bases de datos (PostgreSQL)**  
  Cada microservicio mantiene su propia base de datos, garantizando independencia.

- **Redis**  
  Utilizado por el servicio de autenticación para la gestión de sesiones.

##### Relaciones entre componentes

- El frontend se comunica con los servicios a través del API Gateway mediante HTTP.
- El API Gateway enruta las solicitudes hacia los microservicios correspondientes.
- El Product Service y el Order Service pueden comunicarse sincrónicamente mediante HTTP.
- El Auth Service publica eventos (ej. `USER_REGISTERED`) que son consumidos por el User Service.
- El Order Service puede publicar eventos relacionados con pedidos (ej. `ORDER_CREATED`).
- El AI Service consume eventos generados por distintos servicios para procesar información del sistema.
- Cada microservicio accede únicamente a su propia base de datos.
- Redis es utilizado exclusivamente por el Auth Service.

#### Descripción de los Estilos y Patrones Arquitectónicos Utilizados

##### Estilos arquitectónicos

- **Arquitectura de microservicios**  
  El sistema está compuesto por múltiples servicios independientes con responsabilidades específicas.

- **Arquitectura orientada a eventos (Event-Driven Architecture)**  
  Se utiliza comunicación basada en eventos para permitir interacción asincrónica entre servicios.


##### Patrones arquitectónicos

- **API Gateway Pattern**  
  Se utiliza un API Gateway como punto de entrada único al sistema.

- **Message Broker Pattern**  
  Se emplea un broker de mensajería (RabbitMQ) para gestionar eventos entre servicios.

- **Database per Service Pattern**  
  Cada microservicio posee su propia base de datos.

- **Publish/Subscribe Pattern**  
  Los servicios publican eventos y otros se suscriben para reaccionar.

---
### Estructura de Despliegue

#### Vista de Despliegue

#### Descripción de elementos arquitectónicos y relaciones

- **Frontend**  
  Aplicación web que se ejecuta en un contenedor independiente. Se comunica con el sistema a través del API Gateway mediante HTTP.

- **API Gateway (Nginx)**  
  Actúa como punto de entrada único al sistema. Recibe las solicitudes del frontend y las redirige a los microservicios correspondientes.

- **Auth Service**  
  Servicio encargado de la autenticación. Se conecta a:
  - su base de datos PostgreSQL  
  - Redis para manejo de sesiones  
  - RabbitMQ para publicación de eventos  

- **User Service**  
  Gestiona la información de usuarios. Se conecta a:
  - su base de datos PostgreSQL  
  - RabbitMQ para consumo de eventos  

- **Product Service**  
  Maneja el catálogo de productos y reseñas. Se conecta a:
  - su base de datos PostgreSQL  
  - otros servicios mediante HTTP

- **Order Service**  
  Gestiona la creación y consulta de órdenes. Se conecta a:
  - su base de datos PostgreSQL  
  - el Product Service mediante HTTP para validación de productos  
  - RabbitMQ para publicación de eventos  

- **AI Service**  
  Consume eventos desde RabbitMQ para procesar información del sistema y generar funcionalidades inteligentes.

- **RabbitMQ**  
  Broker de mensajería que permite la comunicación asincrónica entre servicios mediante eventos.

- **Redis**  
  Sistema de almacenamiento en memoria utilizado por el Auth Service para la gestión de sesiones.

- **Bases de datos PostgreSQL**  
  Cada servicio (Auth, User, Product, Order) cuenta con su propia base de datos independiente, desplegada en contenedores separados.

#### Descripción de patrones arquitectónicos utilizados

- **Arquitectura basada en contenedores**  
  Todos los componentes del sistema se despliegan como contenedores independientes, lo que facilita el aislamiento, portabilidad y escalabilidad.

- **Microservices Deployment Pattern**  
  Cada servicio es desplegado de forma independiente, permitiendo actualizaciones y escalado sin afectar a otros componentes.

- **Database per Service**  
  Cada microservicio tiene su propia base de datos, evitando el acoplamiento a nivel de persistencia.

- **API Gateway Pattern**  
  Se utiliza un gateway para centralizar el acceso a los servicios y simplificar la comunicación con el cliente.

- **Message Broker Pattern**  
  RabbitMQ permite la comunicación asincrónica entre servicios mediante eventos.

---

### Estructura en Capas

#### Vista en Capas

#### Descripción de elementos arquitectónicos y relaciones

El sistema se divide en las siguientes capas:

- **Capa de Presentación (Presentation Layer)**  
  Incluye el frontend web, encargado de la interacción con el usuario. Esta capa envía solicitudes al sistema a través del API Gateway y presenta los resultados.

- **Capa de Entrada (API Gateway Layer)**  
  Representada por el API Gateway, que actúa como intermediario entre el frontend y los microservicios. Se encarga del enrutamiento de solicitudes, ocultando la complejidad interna del sistema.

- **Capa de Aplicación / Lógica de Negocio (Application Layer)**  
  Compuesta por los microservicios:
  - Auth Service  
  - User Service  
  - Product Service  
  - Order Service  
  - AI Service  
  Cada uno implementa lógica de negocio específica y opera de forma independiente.

- **Capa de Integración (Integration Layer)**  
  Incluye los mecanismos de comunicación entre servicios:
  - Comunicación síncrona mediante HTTP (REST)  
  - Comunicación asíncrona mediante eventos usando RabbitMQ  
  Esta capa permite la interacción entre servicios sin acoplamiento directo.

- **Capa de Datos (Data Layer)**  
  Compuesta por:
  - Bases de datos PostgreSQL independientes por servicio  
  - Redis como almacenamiento en memoria para sesiones  
  Cada microservicio accede únicamente a su propia fuente de datos.

##### Relaciones entre capas

- La capa de presentación se comunica exclusivamente con el API Gateway.
- El API Gateway enruta las solicitudes hacia la capa de aplicación.
- Los microservicios pueden comunicarse entre sí mediante HTTP cuando se requiere validación en tiempo real.
- La comunicación asincrónica entre servicios se realiza mediante el broker de mensajería.
- Cada servicio interactúa únicamente con su propia base de datos, evitando dependencias directas entre capas de datos.

#### Descripción de patrones arquitectónicos utilizados

- **Layered Architecture Pattern**  
  El sistema organiza sus responsabilidades en capas bien definidas, facilitando la separación de preocupaciones.

- **Separation of Concerns**  
  Cada capa tiene una responsabilidad específica (presentación, lógica, integración, datos), reduciendo el acoplamiento.

- **API Gateway Pattern**  
  Actúa como punto de entrada, separando la capa de presentación de la lógica de negocio.

- **Microservices Pattern**  
  Cada componente de la capa de aplicación es un servicio independiente.

- **Event-Driven Pattern**  
  La capa de integración soporta comunicación basada en eventos para procesos asincrónicos.

- **Database per Service Pattern**  
  Cada servicio gestiona su propia persistencia dentro de la capa

---

### Estructura de Descomposición

La descomposición del sistema se realizó basada en responsabilidades de negocio (business capabilities), donde cada microservicio encapsula un dominio funcional específico:
- Autenticación → Auth Service  
- Gestión de usuarios → User Service  
- Catálogo de productos → Product Service  
- Gestión de pedidos → Order Service  
- Procesamiento inteligente → AI Service  

#### Vista de Descomposición

#### Descripción de elementos arquitectónicos y relaciones

El sistema está compuesto por los siguientes microservicios:

- **Auth Service**  
  Responsable de la autenticación y gestión de credenciales. Genera tokens JWT y publica eventos relacionados con el registro de usuarios.

- **User Service**  
  Encargado de la gestión de perfiles de usuario. Consume eventos generados por el Auth Service (ej. `USER_REGISTERED`) para crear la información del usuario en su base de datos.

- **Product Service**  
  Gestiona el catálogo de productos y las reseñas. Permite la creación, consulta y administración de productos dentro del sistema.

- **Order Service**  
  Responsable de la gestión de pedidos. Coordina la creación de órdenes y se comunica con el Product Service para validar la información de productos.

- **AI Service**  
  Procesa eventos del sistema para generar funcionalidades inteligentes como recomendaciones y personalización.


#### Relaciones entre los componentes

- El **Auth Service** publica eventos que son consumidos por el **User Service**.
- El **Order Service** se comunica de forma síncrona con el **Product Service** para validar productos.
- Los distintos servicios publican eventos en el broker de mensajería.
- El **AI Service** consume eventos generados por múltiples servicios.
- Todos los servicios son independientes y no comparten bases de datos.
- La comunicación entre servicios puede ser:
  - **Síncrona (HTTP/REST)**  
  - **Asíncrona (eventos mediante RabbitMQ)**  
---
## Prototipo

### Instrucciones de Despliegue Local

**Prerequisitos:**
- Docker Desktop instalado y en ejecución
- Git

**Pasos:**

```bash
# 1. Clonar el repositorio
git clone https://github.com/jpastor1649/ecommerce-project.git
cd ecommerce-project

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env y completar con:
#  POSTGRES_USER=ecommerce_user
#  POSTGRES_PASSWORD=ecommerce_password
#  POSTGRES_DB=ecommerce_db

# 3. Levantar todos los servicios con un solo comando
docker compose up --build

# 4. Acceder a la aplicación
# Frontend:                    http://localhost:3000
# Documentación core-service:  http://localhost:8000/docs
```

**Servicios levantados por `docker compose up`:**

| Servicio | Puerto | Tecnología | Descripción |
|---|---|---|---|
| `frontend` | 3000 | React+ Vite 14 | Aplicación web |
| `core-service` | 8000 | FastAPI (Python) | API de lógica de negocio |
| `postgres` | 5432 | PostgreSQL 15 | Base de datos relacional |
| `redis` | 6379 | Redis | Caché NoSQL |

**Para detener todos los servicios:**
```bash
docker compose down
```

---

*Documento generado en la segunda entrega — Grupo D, Arquisoft.*

