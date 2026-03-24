# 🛒 E-commerce Inteligente — Grupo D
## El README.md presente es el del proyecto general, el del primer prototipo se encuentra en [Artifact](docs/Artifact.md)

[![Lint](https://github.com/jpastor1649/ecommerce-project/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/jpastor1649/ecommerce-project/actions/workflows/lint.yml)
[![Tests](https://github.com/jpastor1649/ecommerce-project/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/jpastor1649/ecommerce-project/actions/workflows/test.yml)
[![Docker Build](https://github.com/jpastor1649/ecommerce-project/actions/workflows/docker.yml/badge.svg?branch=main)](https://github.com/jpastor1649/ecommerce-project/actions/workflows/docker.yml)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Next.js%2014-3178C6.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cloud-DC382D.svg)](https://redis.io/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-Flash-4285F4.svg)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Plataforma de comercio electrónico B2C inteligente para el mercado colombiano** que permite a los usuarios explorar un catálogo multi-categoría, gestionar un carrito de compras, completar compras con métodos de pago locales (PSE, Nequi, tarjetas) y recibir recomendaciones personalizadas a través de un asistente conversacional con IA generativa (Google Gemini Flash).

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Instalación Local](#-instalación-local)
- [Requerimientos](#-requerimientos)
- [Contribución](#-contribución)
- [Equipo](#-equipo)

---

## ✨ Características Principales

### 🛍️ E-commerce Core
- Registro e inicio de sesión de usuarios con JWT
- Catálogo de productos multi-categoría con filtros y búsqueda
- Carrito de compras persistente (Redis)
- Checkout completo con pasarela Wompi Colombia (PSE · Nequi · Tarjetas)
- Historial de órdenes y gestión de perfiles
- Reseñas y calificaciones de productos

### 🤖 IA Generativa (Google Gemini Flash)
- **Asistente conversacional**: chatbot que ayuda al usuario a encontrar productos y resolver dudas en lenguaje natural
- **Recomendaciones personalizadas**: sugerencias basadas en el historial del usuario y comportamiento de usuarios similares
- **Búsqueda semántica**: búsqueda vectorial con `pgvector` y embeddings (`text-embedding-004`)
- **Moderación automática**: revisión de reseñas con LLM — sin entrenamiento propio de modelos

### 🏗️ Arquitectura Distribuida (Clean Architecture)
- **`core-service`** (Python / FastAPI): autenticación, catálogo, carrito, órdenes, pagos, reseñas
- **`ai-service`** (Python / FastAPI): chatbot Gemini, recomendaciones, búsqueda semántica, moderación
- **`frontend`** (TypeScript / Next.js 14): BFF + UI — renderizado en servidor, sin exposición de URLs internas
- Dos bases de datos: PostgreSQL 15 + pgvector (relacional) y Redis Cloud (NoSQL clave-valor)

### 🔄 CI/CD Pipeline (GitHub Actions)
- ✅ **lint.yml**: Validación de código (Black, isort, Flake8 / ESLint)
- ✅ **test.yml**: Tests unitarios + cobertura ≥75%
- ✅ **docker.yml**: Build y validación de imágenes Docker

---

## 🏛️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN                                │
│  Next.js 14 App Router (BFF) — TypeScript                      │
│  Catálogo · Carrito · Checkout · Órdenes · Chatbot IA          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ ① REST JSON/HTTPS
          ┌────────────────┴───────────────┐
          ▼                                ▼
┌─────────────────┐              ┌──────────────────┐
│  core-service   │──② httpx ──▶│   ai-service     │
│  Python / FastAPI│              │  Python / FastAPI │
│  Auth · Productos│              │  Gemini · Recomen.│
│  Órdenes · Pagos │              │  Búsq. Semántica  │
└────────┬────────┘              └────────┬─────────┘
         │                                │
    ┌────┴────────────────────────────────┘
    ▼                  ▼
┌──────────────┐  ┌──────────────┐
│ PostgreSQL 15 │  │ Redis Cloud  │
│ + pgvector   │  │ (NoSQL cache)│
└──────────────┘  └──────────────┘
```

**Estilos arquitectónicos:**
- **Microservicios** — `core-service` y `ai-service` son desplegables independientes
- **Clean Architecture** — cada servicio sigue el modelo cebolla (Dominio → Aplicación → Infraestructura → Presentación)
- **BFF (Backend for Frontend)** — Next.js agrega respuestas de ambos servicios antes de renderizar
- **Patrones**: Repository, Dependency Injection, Strategy, Observer (Event Bus)

---

## 📁 Estructura del Proyecto

```
ecommerce-project/
│
├── README.md
├── LICENSE
├── .env.example
├── docker-compose.yml
│
├── .github/
│   ├── agents/
│   └── workflows/
│       ├── lint.yml
│       ├── test.yml
│       └── docker.yml
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pyproject.toml
│   ├── src/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config/
│   │   │   ├── dependencies/
│   │   │   ├── database.py
│   │   │   └── seeds.py
│   │   ├── domain/
│   │   │   └── value_objects/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   └── tests/
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── assets/
│       └── components/
│
└── docs/
  ├── entrega1.md
  ├── architecture/
  └── exports/
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Docker Desktop** instalado y en ejecución
- **Git**
- **Python 3.12.x**

### Con Docker Compose (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/jpastor1649/ecommerce-project.git
cd ecommerce-project

# 2. Configurar variables de entorno
cp .env.example .env
# Windows PowerShell:
# Copy-Item .env.example .env

# 3. Levantar todos los servicios con un solo comando
docker compose up --build

# 4. Acceder a la aplicación
# API backend:                http://localhost:8000
# API backend (Swagger):      http://localhost:8000/docs
# API Health                  http://localhost:8000/health
```

**Servicios levantados:**

| Servicio | Puerto | Descripción |
|---|---|---|
| `backend` | 8000 | API FastAPI |
| `postgres` | 5432 | PostgreSQL 15 |
| `redis` | 6379 | Redis — caché NoSQL |

```bash
# Para detener
docker compose down
```

---

## 💻 Instalación Local (Desarrollo)

### Opcion A: Docker Compose (recomendada para cualquier PC)

1. Clona el repositorio:

```bash
git clone https://github.com/jpastor1649/ecommerce-project.git
cd ecommerce-project
```

2. Crea archivo de variables:

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

3. Levanta servicios:

```bash
docker compose up --build
```

Si tu Docker usa binario legacy:

```bash
docker-compose up --build
```

Para detener y eliminar contenedores:

```bash
docker compose down
```

4. Accesos locales:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Opcion B: Sin Docker

Requiere Python 3.12+, Node 20+, PostgreSQL y Redis ejecutandose localmente.

### Backend

```bash
cd backend
python -m venv .venv
```

Activa el entorno virtual:

Windows (PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Instala dependencias y ejecuta:

```bash
pip install --upgrade pip
pip install .
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```

**Detener servicios (opción sin Docker):**
- Cierra las terminales donde estén corriendo `uvicorn` y `npm run dev` (Ctrl + C).

---

## 📋 Requerimientos

### Requerimientos Funcionales

| ID | Descripción |
|---|---|
| RF-01 | Registro de usuarios, inicio de sesión y gestión de perfiles |
| RF-02 | Historial de compras y preferencias para personalización |
| RF-03 | Catálogo con búsqueda por nombre/categoría y filtros |
| RF-04 | Carrito de compras y proceso de checkout |
| RF-05 | Recomendaciones de productos mediante IA generativa |
| RF-06 | Reseñas y calificaciones de productos |
| RF-07 | Asistente conversacional IA para encontrar productos y recibir recomendaciones |

### Requerimientos No Funcionales

| ID | Descripción | Solución |
|---|---|---|
| RNF-01 | Disponibilidad — arquitectura resiliente a fallos | Microservicios independientes en contenedores |
| RNF-02 | Separación de responsabilidades por dominio | `core-service` y `ai-service` — dominios aislados |
| RNF-03 | IA generativa vía API externa sin entrenamiento propio | Google Gemini Flash API |
| RNF-04 | Catálogo categorizado | Tabla `categories` en PostgreSQL + filtros en frontend |
| RNF-05 | Despliegue local con un solo comando | `docker compose up --build` |
| RNF-06 | Al menos dos lenguajes de programación | Python 3.12 (FastAPI) + TypeScript (Next.js 14) |

### ✅ Cobertura de Requerimientos — Primera Entrega

#### Funcionales (RF)

| ID | Estado en Entrega 1 | Evidencia resumida |
|---|---|---|
| RF-01 | ✅ Implementado | Registro e inicio de sesión con JWT en backend y formularios de login/register en frontend |
| RF-02 | ⏳ Pendiente | No se implementa historial de compras ni preferencias en esta entrega |
| RF-03 | ✅ Implementado | Catálogo con búsqueda y filtros por categoría |
| RF-04 | ⏳ Pendiente | Carrito y checkout no incluidos en esta fase |
| RF-05 | ⏳ Pendiente | Recomendaciones IA no implementadas en el MVP actual |
| RF-06 | ⏳ Pendiente | Reseñas y calificaciones no incluidas en esta fase |
| RF-07 | ⏳ Pendiente | Asistente conversacional IA no implementado aún |

#### No Funcionales (RNF)

| ID | Estado en Entrega 1 | Evidencia resumida |
|---|---|---|
| RNF-01 | 🟡 Parcial | Arquitectura por servicios con contenedores (backend, postgres, redis); faltan escenarios avanzados de resiliencia |
| RNF-02 | ✅ Implementado | Separación por capas y dominios en backend (routers, services, schemas, models) |
| RNF-03 | ⏳ Pendiente | Integración productiva de IA generativa no habilitada en esta entrega |
| RNF-04 | ✅ Implementado | Modelo de categorías + endpoints y filtro en frontend |
| RNF-05 | ✅ Implementado | Arranque local con `docker compose up --build` |
| RNF-06 | ✅ Implementado | Backend en Python y frontend en JavaScript |

> Nota: Esta tabla refleja el alcance real del MVP en la primera entrega y sirve como línea base para las siguientes iteraciones.

---

## 🤝 Contribución

### 📌 Estrategia de Ramas (Git Flow Simplificado)

Usamos un modelo de branching que separa **desarrollo** de **producción:**

```
┌─────────────────────────────────────────────────────────────┐
│ RAMA: main                                                  │
│ ✅ Producción lista para deploy                            │
│ 📌 Solo versiones/releases completados (MVP validados)    │
│ 🔒 Protegida - requiere PR reviewado + CI pass            │
└─────────────────────────────────────────────────────────────┘
                            ↑
                    (merge cuando MVP completo)
                            │
┌─────────────────────────────────────────────────────────────┐
│ RAMA: develop                                               │
│ 🔄 Integración continua de features                        │
│ ✨ Rama "maestra" de desarrollo                            │
│ 🧪 Aquí se prueban todas las features antes de producción  │
└─────────────────────────────────────────────────────────────┘
       ↑                    ↑                    ↑
       │                    │                    │
  feature/auth          feature/products    feature/ui
  feature/payments      feature/cart        bugfix/auth-token
```

### 🚀 Flujo de Trabajo: Paso a Paso

#### 1️⃣ **Crear una Feature**

```bash
# Asegúrate estar sincronizado con develop
git checkout develop
git pull origin develop

# Crea una rama para tu feature
# Formato: feature/nombre-corto o bugfix/nombre-corto
git checkout -b feature/agregar-filtro-productos

# O para bugs:
git checkout -b bugfix/arreglar-login
```

#### 2️⃣ **Desarrollar localmente**

```bash
# Levanta los servicios (Docker Compose - Opción A)
docker compose up --build -d

# O instalación manual (Opción B)
cd backend
.venv\Scripts\Activate.ps1
uvicorn src.main:app --reload

# Haz cambios en el código...
# El servidor se recarga automáticamente (--reload)
```

#### 3️⃣ **Ejecuta tests y validaciones**

```bash
# Tests unitarios
cd backend
pytest tests/ -v

# Con cobertura
pytest tests/ --cov=src --cov-report=html

# Linting (verificar estilo de código)
black src/  # Formatea automáticamente
pylint src/
```

#### 4️⃣ **Commit con formato convencional**

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para claridad:

```bash
# Formato: type(scope): mensaje

git add .

# Feature nueva
git commit -m "feat(products): agregar filtro por categoría"

# Bug fix
git commit -m "fix(auth): resolver token expirado incorrectamente"

# Mejora o refactor
git commit -m "refactor(database): optimizar query de productos"

# Documentación
git commit -m "docs(readme): agregar instalación con Docker"
```

**Tipos válidos:** `feat` | `fix` | `refactor` | `docs` | `test` | `style` | `chore`

#### 5️⃣ **Push y abrir Pull Request**

```bash
# Sube tu rama
git push -u origin feature/agregar-filtro-productos

# Luego:
# 1. Ve a GitHub → tu fork/repo
# 2. Haz click en "Compare & Pull Request"
# 3. Asegúrate que:
#    ✅ Base branch: develop 
#    ✅ Head branch: feature/tu-rama
# 4. Escribe descripción clara del cambio
# 5. Clic en "Create Pull Request"
```

**Descripción del PR:**
```markdown
## Descripción
Agrega filtro de productos por categoría en el endpoint `/products`

## Cambios
- ✨ Nuevo parámetro `category` en GET /products
- 🧪 Tests para filtro con 3+ casos
- 📝 Docs actualizada en Swagger

## Testing
- [x] Tests pasando (`pytest`)
- [x] Linting limpio (`black`, `pylint`)
- [x] Manual testing en `http://localhost:8000/docs`

Fixes #123 (número del issue, si aplica)
```

#### 6️⃣ **Code Review y Merge**

El PR pasará automáticamente:
- ✅ **lint.yml** — verifica formato y estilo (`black --check`, `pylint`)
- ✅ **test.yml** — ejecuta tests (`pytest`)
- ✅ **docker.yml** — valida build de imagen Docker

Si todo pasa:
1. Un mantainer revisa el código
2. Se aprueba el PR
3. **Merges a develop** (lista para siguiente release)

---

### ✅ Checklist antes de hacer Push

```bash
# 1. Tests están pasando
cd backend && pytest tests/ --cov=src
✅ Pass

# 2. Código está formateado
black src/
✅ OK

# 3. Sin errores de linting
pylint src/
✅ OK

# 4. Sin cambios sin commitear
git status
✅ clean

# 5. Commits con mensaje claro
git log --oneline -3
✅ feat(products): agregar filtro
✅ test(products): casos de filtro
✅ docs(readme): actualizar ejemplos
```

---

### 🚨 Reglas Importantes

| Regla | Detalles |
|-------|----------|
| **main → producción únicamente** | Solo merges cuando hay MVP completado y testeable |
| **develop → rama de integración** | Todos los features se mergen aquí primero |
| **NO commits directos a main/develop** | Siempre via Pull Request |
| **Nombra ramas claramente** | `feature/xxx`, `bugfix/xxx`, `docs/xxx` |
| **Tests obligatorios** | CI falla si tests no pasan (bloquea el merge) |
| **Squash opcional** | Si tu rama tiene 5+ commits, considera squash antes de merge |

---

### 📚 Ejemplo Completo (Real)

```bash
# 1. Crear rama desde main actualizada
git checkout main && git pull origin main
git checkout -b feature/descripcion-corta

# 2. Hacer cambios y validar
cd backend && pytest
cd ../frontend && npm run lint

# 3. Guardar cambios
git add .
git commit -m "feat(scope): descripcion corta"

# 4. Subir rama
git push -u origin feature/descripcion-corta
```

---

### ✅ Status Checks Automáticos (CI/CD)

Cuando haces **push o abres un PR**, GitHub ejecuta automáticamente estos checks:

#### 1️⃣ **Lint** (`lint.yml`)

```yaml
Ejecuta:
  - black --check src/        # Verifica formato PEP8
  - pylint src/               # Revisa errores y posibles mejoras

Falla si:
  ❌ Código mal formateado
  ❌ Variables sin usar
  ❌ Imports innecesarios

Fix rápido (en tu máquina):
  cd backend
  black src/                  # Formatea automáticamente
  git add . && git commit --amend --no-edit && git push --force
```

#### 2️⃣ **Tests** (`test.yml`)

```yaml
Ejecuta:
  - pytest tests/              # Tests unitarios
  - --cov=src                  # Calcula cobertura

Falla si:
  ❌ Un test no pasa
  ❌ Errores en fixtures

Variables de entorno (automáticas en CI):
  DATABASE_URL: postgresql+asyncpg://test:test@localhost/test
  JWT_SECRET: test-secret-key
  GEMINI_API_KEY: (vacía para tests)
```

#### 3️⃣ **Docker Build** (`docker.yml`)

```yaml
Ejecuta (solo en main):
  - docker build -t ecommerce-backend:latest backend/

Falla si:
  ❌ Dockerfile tiene errores
  ❌ Missing dependencies
```

#### Status en el PR

Después de hacer push, verás en tu PR:

```
✅ All checks passed
  ✓ Lint (pylint + black)
  ✓ Tests (pytest)
  ✓ Docker Build (si es main)
  
→ PR puede ser mergeado
```

Si falla:
```
❌ Some checks failed
  ✗ Lint:  Variables sin usar en src/services/auth_service.py:42
  → click "Details" para ver log completo
  → Arregla localamente y haz git push
```

---
---

## 👥 Equipo

**Proyecto Académico — Arquisoft 2026**

| # | Nombre Completo |
|---|---|
| 1 | Sara Isabel Ospina Valderrama |
| 2 | Juan David Ruiz Guasca |
| 3 | Juan David Castañeda Cárdenas |
| 4 | John Alejandro Pastor Sandoval |
| 5 | Andrés Felipe Perdomo Uruburu |

---

## 📚 Documentación Adicional

- **[docs/entrega1.md](docs/entrega1.md)**: Documento de primera entrega — requisitos y arquitectura completa
- **[docs/architecture/](docs/architecture/)**: Diagramas C4 (PlantUML) y vista C&C
- **API Docs (local)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📊 Estado del Proyecto

| Componente | Estado |
|---|---|
| CI/CD Pipeline | ![passing](https://img.shields.io/badge/status-en%20progreso-yellow) |
| core-service | ![wip](https://img.shields.io/badge/status-en%20progreso-yellow) |
| ai-service | ![wip](https://img.shields.io/badge/status-en%20progreso-yellow) |
| Frontend | ![wip](https://img.shields.io/badge/status-en%20progreso-yellow) |
| Diagramas arquitectónicos | ![done](https://img.shields.io/badge/status-completado-brightgreen) |
| Documento entrega1 | ![done](https://img.shields.io/badge/status-completado-brightgreen) |

---

## 📜 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Ver [LICENSE](LICENSE) para detalles.

---

<div align="center">
  <p>Construido con ❤️ por el Grupo D</p>
  <p>Arquitectura de Software — UNAL 2026</p>
</div>
