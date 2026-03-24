# Primera Entrega — Prototipo Arquitectónico
**Curso:** Arquitectura de Software (Arquisoft)  
> **Entrega:** Primera Entrega — Prototipo Vertical  
> **Fecha:** 2026-03-23

---

## Equipo

**Nombre:** Grupo D

| # | Nombre completo |
|---|---|
| 1 | Sara Isabel Ospina Valderrama |
| 2 | Juan David Ruiz Guasca |
| 3 | Juan David Castañeda Cárdenas |
| 4 | John Alejandro Pastor Sandoval |
| 5 | Andrés Felipe Perdomo Uruburu |

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
### Alcance Funcional del Prototipo (Primera Entrega)

El prototipo demuestra un **corte vertical mínimo** del sistema: un flujo completo de extremo a extremo que atraviesa todas las capas arquitectónicas con la menor complejidad funcional posible.

**Flujo cubierto:**

1. **Inicio de sesión** (RF-01) — el usuario ingresa sus credenciales → `core-service` valida y emite JWT → sesión guardada en Redis
2. **Catálogo de productos** (RF-03) — el usuario navega el catálogo por categoría → `core-service` consulta PostgreSQL → `ai-service` agrega una recomendación simple basada en la categoría consultada (Gemini Flash)

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

| ID | Requerimiento | Cómo se satisface |
|---|---|---|
| C-RNF-01 | Arquitectura distribuida | Tres unidades desplegables independientes: `frontend` + `core-service` + `ai-service`, comunicadas por HTTP |
| C-RNF-02 | Al menos un componente de presentación (frontend web) | Next.js 14 App Router — desplegado en Vercel |
| C-RNF-03 | Al menos dos componentes de lógica | `core-service` y `ai-service` — microservicios Python independientes |
| C-RNF-04 | Al menos dos componentes de datos (relacional + NoSQL) | PostgreSQL 15 + pgvector (relacional) y Redis Cloud (NoSQL clave-valor) |
| C-RNF-05 | Al menos dos tipos distintos de conectores HTTP | ① REST JSON/HTTPS — frontend ↔ servicios backend  ② REST interno (httpx async) — core-service → ai-service |
| C-RNF-06 | Al menos dos lenguajes de programación | Python 3.12 (FastAPI) y TypeScript (Next.js 14) |
| C-RNF-07 | Despliegue orientado a contenedores | Todos los componentes en Docker — `docker compose up` despliega el sistema completo localmente |

---

## Estructuras Arquitectónicas

#### Vista de Componentes y Conectores

![Vista de Componentes y Conectores](./cc.svg)

---

#### Descripción de los Estilos Arquitectónicos Utilizados

Esta sección diferencia entre lo que **ya está implementado en el código del prototipo** y lo que se **plantea como arquitectura objetivo en la narrativa**.

**A. Estilos arquitectónicos usados actualmente (implementados)**

**1. Arquitectura cliente-servidor (SPA + API REST)**

La solución actual se implementa como:

- **Frontend SPA (React + Vite)** consumiendo endpoints HTTP.
- **Backend FastAPI** exponiendo rutas REST para autenticación y catálogo.

La comunicación principal es `frontend -> backend` vía JSON/HTTPS.

**2. Monolito modular por capas (en backend)**

Aunque hay separación interna por módulos (`routers`, `services`, `schemas`, `models`, `domain`), el backend se despliega hoy como **un único servicio**.

La organización en capas sigue esta dirección:

```
Routers/Presentación -> Servicios/Aplicación -> Dominio + Modelos/Persistencia
```

Esta estructura facilita evolución y mantenibilidad, pero todavía no representa microservicios independientes en ejecución.

**3. Enfoque parcial de Clean Architecture**

Se observan principios de Clean Architecture en el uso de Value Objects de dominio (por ejemplo email y password) y separación de responsabilidades. Sin embargo, en esta fase no hay una implementación completa de puertos/adaptadores para todos los módulos del sistema.

**B. Estilos arquitectónicos objetivo (según la narrativa del proyecto)**

**1. Arquitectura de microservicios**

La narrativa propone separar la plataforma en dos servicios de negocio desplegables de forma independiente:

- **`core-service`** — autenticación, catálogo, carrito, órdenes, pagos y reseñas.
- **`ai-service`** — asistente conversacional, recomendaciones, búsqueda semántica y moderación de contenido.

**2. Clean Architecture completa por servicio**

Cada microservicio seguiría explícitamente el modelo cebolla, con dependencias hacia adentro:

```
Presentación -> Aplicación -> Dominio <- Infraestructura
```

Incluye entidades y value objects puros, interfaces de repositorio en dominio y adaptadores concretos en infraestructura.

**3. Patrón BFF (Backend for Frontend)**

La narrativa plantea un frontend con BFF (Next.js) que agregue respuestas de `core-service` y `ai-service` del lado servidor, evitando exponer URLs internas directamente al navegador.

---

#### Descripción de Elementos y Relaciones Arquitectónicas

**A. Estado actual (prototipo implementado en código)**

| Elemento | Tipo | Tecnología | Responsabilidad |
|---|---|---|---|
| `Frontend Web` | Componente de presentación | React + Vite (JavaScript) | Renderiza la UI y consume endpoints del backend vía REST |
| `Backend API` (`core-service` en la narrativa) | Componente de lógica | Python 3.12, FastAPI | Auth, catálogo de productos, búsqueda, y sesión JWT con persistencia en Redis |
| `PostgreSQL (Docker)` | Componente de datos (relacional) | PostgreSQL 15 | Persistencia de usuarios, categorías y productos del prototipo |
| `Redis (Docker)` | Componente de datos (NoSQL clave-valor) | Redis 7 | Persistencia de sesiones activas (login/logout) y soporte de caché de corto plazo |
| `Conector REST` | Conector HTTP | JSON / HTTP | Comunicación frontend -> backend |

**Relaciones implementadas hoy:**

1. `Frontend Web` -> `Backend API`: login, registro, catálogo, búsqueda y logout.
2. `Backend API` -> `PostgreSQL`: lectura/escritura de entidades de negocio.
3. `Backend API` -> `Redis`: almacenamiento e invalidación de sesiones.

**B. Estado objetivo (narrativa arquitectónica del proyecto)**

| Elemento | Tipo | Tecnología | Responsabilidad |
|---|---|---|---|
| `Frontend BFF` | Componente de presentación | Next.js 14 + TypeScript | Agregar respuestas del backend en servidor y ocultar servicios internos al navegador |
| `core-service` | Componente de lógica | FastAPI | Auth, catálogo, carrito, órdenes, pagos y reseñas |
| `ai-service` | Componente de lógica | FastAPI + Gemini | Recomendaciones, búsqueda semántica, chatbot y moderación de contenido |
| `PostgreSQL + pgvector` | Componente de datos (relacional/vectorial) | PostgreSQL 15 + extensión pgvector | Persistencia transaccional y similitud semántica por embeddings |
| `Redis Cloud` | Componente de datos (NoSQL clave-valor) | Redis administrado | Sesiones, carritos, cache de consultas y rate limiting |
| `Conector REST interno` | Conector HTTP | JSON / HTTPS (httpx async) | Comunicación `core-service` <-> `ai-service` |

**Relaciones objetivo:**

1. `Frontend BFF` -> `core-service` y `ai-service`.
2. `core-service` -> `ai-service` para casos de IA de negocio.
3. Ambos servicios -> `PostgreSQL + pgvector` y `Redis Cloud` según su responsabilidad.
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

*Documento generado en la primer entrega — Grupo D, Arquisoft.*

