# 🧠 Planio — Prototype 1

## 👥 Team

**Name:** Group E  

**Members:**
- Jeronimo Bermudez Hernandez  
- Juan Sebastian Cabezas Mateus  
- Jenny Catherine Herrera Garzon  
- Sharick Yelixa Torres Monroy  
- Laura Sofia Vargas Rodriguez  

---

## 💻 Software System

### Name
**Planio**

### Logo
<p align="center">
  <img src="./images/LogoPlanio.png" width="200">
</p>


### Description
Planio es una aplicación web social diseñada para familias, amistades y grupos pequeños que desean organizar su vida diaria en un solo lugar.

Permite crear salas compartidas donde los miembros pueden:
- Gestionar tareas tipo Kanban (TODO / DONE)
- Registrar hábitos diarios grupales
- Visualizar actividad en tiempo real  
- Obtener recompensas mediante monedas  

Las monedas permiten personalizar avatares y decorar salas virtuales, fomentando la participación y colaboración.

---

## 🏗️ Architectural Structures

### 🔹 Component and Connector (C&C) View

![Architecture Diagram](./images/ArchitecturePlanio.png)

---

### 🔹 Architectural Styles

El sistema sigue una **arquitectura de microservicios**, en la cual la aplicación se divide en servicios pequeños, independientes y especializados.

Características principales:
- Despliegue independiente por servicio  
- Comunicación mediante HTTP REST y WebSocket  
- Persistencia desacoplada por servicio  

También se basa en principios de **SOA (Service-Oriented Architecture)**, permitiendo reutilización y desacoplamiento de funcionalidades.

---

### 🔹 Architectural Elements and Relations

#### 🧩 Componentes

- **Web UI**  
  Interfaz de usuario que corre en el navegador.  
  Se comunica con el backend mediante HTTP y WebSocket.

- **API Gateway**  
  Punto de entrada único al sistema.  
  Maneja autenticación (Google OAuth), generación de JWT y enrutamiento.

- **Activity Service**  
  Núcleo del sistema. Gestiona:
  - Salas  
  - Tareas  
  - Hábitos  
  - Monedas  
  - Historial de actividad  

- **Personalization Service**  
  Maneja:
  - Avatares  
  - Items  
  - Salas virtuales  

- **Notification Service**  
  Maneja notificaciones en tiempo real usando WebSocket.

- **Databases**
  - **PostgreSQL (Activity DB):** datos transaccionales  
  - **MongoDB (Personalization DB):** datos flexibles  

---

#### 🔗 Conectores

- **HTTP REST**
  - Comunicación síncrona entre servicios  

- **WebSocket**
  - Comunicación en tiempo real (notificaciones)  

---

#### ⚙️ Decisiones arquitectónicas clave

- API Gateway como punto único de entrada  
- Separación de bases de datos por servicio  
- Uso de transacciones ACID en el núcleo  
- WebSocket solo para notificaciones  
- Bajo acoplamiento entre servicios  

---

## 🚀 Prototype

### 🔧 Instructions to run locally

1. Clonar el repositorio:
- git clone https://github.com/unal-sw-arch/swarch-2026i

2. Entrar al repositorio:
- cd swarch-2026i

3. Cambiar a la rama del proyecto:
- git checkout prototype1_E_group_workbranch

4. Ir a la carpeta del sistema:
- cd ProyectoPlanio

5. Levantar los servicios con Docker:
- docker-compose up -d --build

6. Ejecutar el frontend:
- cd front
- npm install
- npm run dev

7. Abrir la aplicación en el navegador:
- http://localhost:5173/