# 🧠 Planio — Prototype 2

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
Planio is a social web application designed for families, friends, and small groups who want to organize their daily activities in one place.

It allows users to create shared rooms where members can:
- Manage tasks using a Kanban-style board (TODO / DONE)
- Track daily group habits
- Communicate in real time via group chat
- View who completed their commitments
- Earn coins by completing tasks and habits

Coins can be used to customize avatars and decorate shared virtual rooms, encouraging collaboration and engagement. Each room also features gamification stats: a personal streak tracking consecutive days of completed habits, and a weekly podium showing the top 3 members by completed tasks.

---

## 🏗️ Architectural Structures

### 🔹 1. Component and Connector (C&C) View

![C&C Architecture Diagram](./images/ArchitecturePlanio.png)

#### Architectural Style

Planio follows a **Service-Oriented Architecture (SOA)**. The system is decomposed into independent services, each with well-defined responsibilities within its business domain, its own database, and deployed in an independent container. Services communicate via standard protocols: HTTP REST for synchronous operations and WebSocket for real-time communication.

#### Components

| Component | Type | Responsibility |
|---|---|---|
| Web UI | `«Client»` | Main user interface. Runs in the browser. Communicates with the backend via HTTP REST and maintains a persistent WebSocket connection with the Notification Service. |
| API Gateway | `«Orchestrator»` | Single entry point to the backend. Validates Firebase tokens, routes requests to the corresponding service, and handles WebSocket upgrades. No internal service is directly accessible from outside. |
| Activity Service | `«Service» REST` | Transactional core of the system. Manages rooms, members, tasks, habits, coins, and activity history. Notifies the Notification Service when a relevant event occurs. |
| Chat Service | `«Service» REST` | Manages group messaging. Persists messages and reactions in MongoDB. Notifies the Notification Service for real-time delivery. |
| Notification Service | `«Service» WebSocket` | Asynchronous real-time communication component. Has no business logic. Receives events from Activity Service and Chat Service via HTTP and retransmits them to connected clients via WebSocket, grouped by room. |
| Personalization Service | `«Service» REST` | Manages personalization: item catalog, user avatars, and virtual room state. Communicates with Activity Service to deduct coins on purchases. |
| Analytics Service | `«Service» REST` | Manages statistics and activity reports. Persists data in MongoDB. |
| Activity_db | `«SQL Database»` | PostgreSQL database. Stores all transactional data: users, rooms, members, tasks, habits, coins, and history. |
| Chat_db | `«Mongo Database»` | MongoDB database for Chat Service. Stores messages and reactions. |
| Personalization_db | `«Mongo Database»` | MongoDB database for Personalization Service. Stores item catalog, avatars, and virtual rooms. |
| Analytics_db | `«Mongo Database»` | MongoDB database for Analytics Service. Stores streak and podium data. |

#### Connectors

| Connector | Type | Description |
|---|---|---|
| HTTP REST | `«HTTP»` | Main system connector for synchronous operations. Used between: Web UI → API Gateway, API Gateway → all backend services, Activity Service → Notification Service, Chat Service → Notification Service, Personalization Service → Activity Service. |
| WebSocket | `«WebSocket»` | Persistent connection for asynchronous real-time communication between Web UI and Notification Service. |
| SQL | `«SQL»` | Connector between Activity Service and its PostgreSQL database. |
| Mongo | `«Mongo»` | Connector between each service and its corresponding MongoDB database. |

---

### 🔹 2. Deployment Structure

#### Deployment View

![Deployment Diagram](./images/DeploymentStructure.png)

#### Description of Architectural Elements and Relations

**Deployment nodes:**

- **`Planio_dev_environment`** `«device»` — Local physical machine acting as the sole host of the entire system. Specs: RAM 16.0 GB, CPU AMD Ryzen 7 6800H with Radeon Graphics, storage 954 GB, OS Linux. Contains all execution nodes of the system.

- **`Server Planio DEV`** `«execution environment»` — Execution node located in the DMZ Zone. Implemented as a Docker Compose service inside `Planio_dev_environment`. Hosts the containers accessible from outside: the web client and the backend entry point (API Gateway). It is the only node exposed to external traffic; access toward the internal zone is controlled by a logical firewall.

  Contains the following artifacts/containers:
  - `UI` — Serves the interface to the browser and mobile client via HTTP. Port: 80.
  - `API Gateway` — Single entry point to the backend. Validates Firebase tokens and routes to internal services. Port: 8000.

- **`Application & Database Server`** `«execution environment»` — Execution node located in the Internal Zone. Implemented as a Docker Compose service inside `Planio_dev_environment`. Hosts all backend business services and the two shared database infrastructure containers. Its containers do not expose ports to the host — they are only accessible from Server Planio DEV through `planio_network`.

  Contains the following artifacts/containers:
  - `Activity Service` — Transactional REST service. Port: 8001.
  - `Notification Service` — Real-time WebSocket event broadcast service. Port: 8002.
  - `Personalization Service` — Avatar and virtual room REST service. Port: 8003.
  - `Analytics Service` — Statistics REST service (streaks and weekly podium). Port: 8004.
  - `Chat Service` — Persistent group messaging WebSocket service. Port: 8005.
  - `MongoDB` — Shared MongoDB instance. Hosts three independent logical databases: `chat_db`, `personalization_db`, `analytics_db`. Port: 27017.
  - `PostgreSQL` — Shared PostgreSQL instance. Hosts the system's transactional database: `activity_db`. Port: 5432.

**Relations:**

- **`Client Browser / Client Mobile → UI`** `«HTTP»` — External clients access the frontend deployed on Server Planio DEV through port 80.
- **`UI → API Gateway`** `«HTTP»` — The UI sends all business operations to the API Gateway via HTTP REST. The gateway validates the Firebase token before routing to the corresponding service.
- **`UI → Notification Service`** `«WebSocket»` — The UI maintains a persistent WebSocket connection with the Notification Service to receive real-time events without polling.
- **`API Gateway → [Activity | Personalization | Analytics | Chat] Service`** `«HTTP / planio_network»` — The API Gateway routes incoming requests to the Application & Database Server services via HTTP over the internal Docker network `planio_network`. Services are not accessible from outside.
- **`Activity Service → Notification Service`** `«HTTP / planio_network»` — When a relevant event occurs (task created/moved/assigned, habit marked), Activity Service notifies Notification Service to retransmit it to WebSocket-connected clients.
- **`Chat Service → Notification Service`** `«HTTP / planio_network»` — When a message or reaction is created, Chat Service notifies Notification Service for real-time delivery to room members.
- **`Personalization Service → Activity Service`** `«HTTP / planio_network»` — When a user makes a purchase, Personalization Service calls Activity Service to verify and deduct the corresponding coins.
- **`Activity Service → PostgreSQL`** `«SQL / planio_network»` — Activity Service connects to the shared PostgreSQL instance and operates exclusively on the `activity_db` logical database.
- **`[Chat | Personalization | Analytics] Service → MongoDB`** `«Mongo / planio_network»` — Each service connects to the shared MongoDB instance and operates exclusively on its own logical database (`chat_db`, `personalization_db`, `analytics_db` respectively). No service accesses another's database.

#### Architectural Patterns Used

- **Container-based deployment** — Every system component (UI, API Gateway, five business services, MongoDB, and PostgreSQL) is deployed as an independent Docker container with its own filesystem, dependencies, and configuration. The orchestrator is Docker Compose, which declares all containers, images, environment variables, exposed ports, and network membership in a single `docker-compose.yml` file. This guarantees environment reproducibility: any team member can bring the full system up with a single command (`docker compose up --build`).

- **Single-host deployment** — In the development environment, all containers run on the same physical machine under a private Docker bridge network called `planio_network`. Services discover each other by container name (e.g. `activity-service`, `mongo`, `postgres`) without fixed IPs or external DNS. The DMZ / Internal Zone separation is logical and implemented through Docker Compose port configuration: only DMZ containers publish ports to the host.

- **Shared infrastructure** — PostgreSQL and MongoDB are single containers acting as shared infrastructure for multiple services. Each service operates on its own logical database (identified by database name within the same engine), maintaining the data isolation of the *Database per Service* pattern without needing a separate database instance per service. This significantly reduces resource consumption in the local development environment. In a production environment, each service could migrate to its own instance without changes to business logic code.

- **DMZ / Internal Zone segmentation** — The deployment segments containers into two logical network zones. The DMZ Zone exposes only the UI and the API Gateway (port 8000) to the host, which is the sole point of contact with the outside. The Internal Zone contains the business services and databases, whose ports are not published to the host: access is exclusively through `planio_network`. A logical firewall — represented by the absence of `ports` in Docker Compose for internal containers — controls access between zones.

---

### 🔹 3. Layered Structure

#### Layered View

![Layered Architecture Diagram](./images/LayerStructure.png)

#### Description of Architectural Elements and Relations

**Tier Client**
Contains the presentation components running on the user's device. Web UI is the main web client, accessible from the browser; Mobile UI is the mobile client. Both communicate with the orchestration layer via HTTP REST for synchronous operations.

**Tier Orchestration**
Contains a single component, the API Gateway, which acts as the entry point to the backend. Its responsibilities are validating Firebase tokens and routing HTTP requests to the corresponding service in the application layer. All external traffic passes through Firebase Auth, which appears as an external dependency outside the tier.

**Tier Application**
Contains the 5 business logic services, each deployed in its own independent container:
- **Activity** — Transactional core service managing rooms, tasks, habits, coins, and history.
- **Notification** — Asynchronous real-time event broker. Receives events and retransmits them to clients connected via WebSocket.
- **Chat** — Manages messages within rooms.
- **Personalization** — Manages avatar and virtual room customization per user.
- **Analytics** — Calculates and manages habit streak metrics and the weekly task leaderboard.

**Tier Persistency**
Contains the 4 databases, each owned by a service in the application layer:
- `Activity_db` — PostgreSQL database. Stores users, rooms, tasks, habits, coins, and history.
- `Personalization_db` — MongoDB database. Stores item catalog, avatar options per user, and room state.
- `Analytics_db` — MongoDB database. Stores streak counters and podium data.
- `Chat_db` — MongoDB database. Stores messages and reactions.

**Relations:**
- `Allow to use` — Each relation is unidirectional and descending. The Client tier uses the Orchestration tier, the Orchestration tier uses the Application tier, the Application tier uses the Persistency tier. No tier communicates upward.

#### Architectural Patterns Used

- **Layered Architecture** — The central structural pattern of the diagram. The system is organized in 4 tiers with strictly descending `Allow to use` relationships. Each tier can only depend on the one immediately below it, ensuring that changes in one level do not propagate to higher levels. This restriction makes the dependency flow predictable and unidirectional.

- **Strict Layering** — Applied in the relationships between tiers: no tier can skip a level to communicate directly with a non-adjacent one. The Client tier does not access the Application tier directly. This restriction centralizes access control and routing in the Orchestration tier.

- **Separation of concerns by tier** — Each tier has a delimited responsibility: the Client tier handles presentation exclusively, the Orchestration tier handles entry and access control, the Application tier handles business logic, and the Persistency tier handles storage.

---

### 🔹 4. Decomposition Structure

#### Decomposition View

![Decomposition Diagram](./images/DescompositionStructure.png)

> Link: [draw.io diagram](https://drive.google.com/file/d/1LBedT1lTU4V_ZwEFxW66ndi-kDfbh9QS/view?usp=drive_link) | [Explanation](https://drive.google.com/file/d/1JMDtk2uvojRevU3KefCAoqCaM4IwHhmo/view?usp=drive_link)

#### Description of Architectural Elements and Relations

The Planio system is decomposed into eight functional modules. Each module groups cohesive responsibilities within the same business domain. This decomposition is independent of the implementation — a module does not necessarily correspond to a single service or folder in the source code.

- **Identity Module** — Responsible for everything related to user identity. Divided into: Authentication (Google OAuth flow and Firebase token validation) and User Management (user registration and traceability).

- **Room Module** — Manages creation and administration of shared rooms. Room Management handles room creation, invitation codes, and joining. Member manages user membership within a room.

- **Activity Module** — Functional core of the system. Contains three closely related sub-modules: Tasks (Kanban board), Habits (daily shared habits with automatic daily reset), and Activity Log (history of all actions in a room). These are implemented in a single service due to the transactional consistency required between them.

- **Coins Module** — Manages the reward system. Personal Coins handles individual user coin balances for avatar item purchases. Room Coins handles the group balance per room for virtual room decoration.

- **Chat Module** — Manages real-time messaging within rooms. Messaging handles sending and persisting messages. Reactions manages emoji reaction toggles on messages. Both depend on the Notification Module for real-time delivery.

- **Personalization Module** — Manages all visual customization. Avatar allows each user to have a distinct avatar per room. Room Decoration manages items placed in the virtual room. Shop exposes the item catalog. Depends on Coins Module to verify and deduct coins on purchases.

- **Notification Module** — Responsible for asynchronous real-time communication. Has no business logic. Real-time maintains open WebSocket connections with clients grouped by room. Broadcasting receives events from Activity and Chat modules via HTTP and retransmits them to connected clients.

- **Analytics Module** — Manages statistics and gamification. Streak Tracker counts consecutive days a user has completed habits within a room. Leaderboard shows the top 3 members by tasks completed in the current week, resetting every Monday.

**Relations between modules:**
- `Identity → all modules` — All modules require the user to be authenticated to operate.
- `Activity → Notification` — Task, habit, or log events trigger real-time broadcast.
- `Activity → Coins` — Completing a task or habit automatically generates a coin transaction.
- `Chat → Notification` — New messages or reactions trigger real-time broadcast.
- `Personalization → Coins` — Purchases verify and deduct coins through the Coins module.
- `Analytics → Activity` — Analytics consumes the activity history generated by the Activity Module to build its reports.

---

## 🚀 Prototype

### 🔧 Instructions to run locally

#### 📱 Requirements

- **Docker** 20.10+ or Docker Desktop installed and running
- **Docker Compose** 1.29+
- **Git**
- **Node.js** 18+ (if running frontend locally)
- **Flutter** 3.11+ (if running mobile locally)
- **Dart** 3.11+

#### 🌐 Web (React)

1. Clone the repository:
```bash
git clone https://github.com/unal-sw-arch/swarch-2026i.git
```

2. Switch to the project branch:
```bash
git checkout -b prototype_3_group_E origin/prototype_3_group_E
```

3. Navigate to the project folder:
```bash
cd swarch-2026i/project/3e/ProyectoPlanio/
```

4. Configure frontend environment variables:
```bash
cd front
cp .env.example .env
```

Required credentials:
```env
VITE_FIREBASE_API_KEY="AIzaSyDKAwdoR7DF14gfmjxnit_H_Za_P_H4r1s"
VITE_FIREBASE_AUTH_DOMAIN="planio-social-todo.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="planio-social-todo"
VITE_FIREBASE_STORAGE_BUCKET="planio-social-todo.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="344212841097"
VITE_FIREBASE_APP_ID="3442128410971:344212841097:web:490b34f16a961cc85f5c58"
```

5. Start all services:
```bash
cd ..
docker compose up --build
```

6. Open the application in your browser:
- http://localhost:80/

#### 📱 Mobile (Flutter)

**Option 1: With Docker (Recommended)**
```bash
# From ProyectoPlanio folder
docker-compose up -d
```

**Option 2: Local Development**
```bash
cd mobile

# Install dependencies
flutter pub get
flutter pub run build_runner build

# Run on Windows (for quick UI development)
flutter run -d windows

# Or on Android emulator
flutter run -d emulator-5554
```

**Requirements for Mobile:**
- Flutter 3.11.5+
- Dart 3.11.5+
- Android Studio (for Android) or Xcode (for iOS)
- For production: Firebase configuration (see `mobile/README.md`)

---

### 📡 Available Services

| Service | URL / Port |
|---|---|
| Frontend | http://localhost |
| API Gateway | http://localhost:8000 |
| Activity Service | http://localhost:8001 |
| Notification Service | http://localhost:8002 |
| Personalization Service | http://localhost:8003 |
| Analytics Service | http://localhost:8004 |
| Chat Service | http://localhost:8005 |
| PostgreSQL | localhost:5432 |
| MongoDB | localhost:27017 |

### 🛑 Stop Commands

```bash
# Stop without deleting data:
docker compose down

# Stop and delete all data:
docker compose down -v
```

---

### 💻 Programming Languages Used

| Language | Used in |
|---|---|
| TypeScript | Frontend (React + Vite) |
| JavaScript (Node.js) | API Gateway, Activity Service, Chat Service, Notification Service, Personalization Service |
| Python | Analytics Service |
| SQL | PostgreSQL database schema |

---

### 📚 Documentation

- **Full deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Integration details**: [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
- **Mobile app setup**: [mobile/README.md](./mobile/README.md)
- **API Gateway**: [backend/gateway/README.md](./backend/gateway/README.md)
