# Click & Munch — System Status

> Living status doc to keep the app working across PRs. Update the **Last verified**
> date and any changed sections whenever you touch infrastructure, secrets, or the
> run/test flow. Keep this in sync with `.github/copilot-instructions.md`.

**Last verified:** 2026-06-10 (post-merge) — full stack 19 containers `healthy`;
backend 112 tests green; WAF live-blocking SQLi/XSS/traversal at the gateway; the
in-app seeder auto-creates one approved user per role; both frontends typecheck
and serve.

---

## 1. Secrets & configuration (post security refactor)

All secrets are now externalized to environment variables. **No credentials are
committed to the repo.** Verify with:

```bash
git grep -nE "1245789630|ClickAndMunchSuperSecretKey|: mike|: secret" -- backend/ ':!**/build/**' ':!**/bin/**'
# (should return nothing in tracked source)
```

| Secret | Env var | Consumed by |
|---|---|---|
| PostgreSQL user/pass | `POSTGRES_USER` / `POSTGRES_PASSWORD` | all `*-db` containers + every JDBC service (`SPRING_DATASOURCE_USERNAME/PASSWORD`) |
| MongoDB user/pass | `MONGO_USER` / `MONGO_PASSWORD` | `menu-db`, MenuService (`SPRING_MONGODB_URI`) |
| RabbitMQ user/pass | `RABBITMQ_USER` / `RABBITMQ_PASSWORD` | `rabbitmq`, Order/Reservation/Notification services |
| JWT signing secret | `JWT_SECRET` | **AuthService** (signs) + **APIGateway** (validates) — must be identical |

### Where values live
- **`backend/.env`** — real local values. **Git-ignored.** Auto-loaded by `docker compose`.
- **`backend/.env.example`** — committed template with placeholders only.
- **`frontend/mobile/.env`** — local URLs only (no secrets); now git-ignored. Template: `frontend/mobile/.env.template`.

### JWT secret is injected, not hardcoded
- `backend/APIGateway/.../security/JwtTokenUtil.java` and
  `backend/AuthService/.../config/JwtTokenUtil.java` read the secret via
  constructor `@Value("${jwt.secret}")`.
- `jwt.secret` resolves from `${JWT_SECRET}` in `application.yaml` (gateway) and
  `application.yml` (auth). **No default** → the service fails fast if the env var
  is missing (intended; surfaces misconfiguration immediately).
- Test resources provide a throwaway dummy secret so unit tests run without real
  secrets: `backend/{APIGateway,AuthService}/src/test/resources/application.*`.

---

## 2. Run the system

```bash
# 0. One-time: create your local secrets file
cd backend && cp .env.example .env
#    then fill in values, e.g.:
#    POSTGRES_PASSWORD / MONGO_PASSWORD / RABBITMQ_PASSWORD -> openssl rand -hex 16
#    JWT_SECRET -> openssl rand -base64 48

# 1. Backend (docker compose auto-loads backend/.env)
cd backend && docker compose up --build -d
#    Reset DBs after changing DB credentials (volumes keep old creds otherwise):
#    docker compose down -v && docker compose up --build -d

# 2. Dashboard  -> http://localhost:5173
cd frontend/dashboard && npm install && npm run dev

# 3. Mobile     -> Expo (web on :8081, or scan QR)
cd frontend/mobile && npm install && npx expo start
```

- API Gateway (only public entry point): **http://localhost:8080**
- Internal services are reachable only inside the `appnet` Docker network.

---

## 3. Run the tests

```bash
# Backend Java services — most are pure Mockito unit tests (no env needed).
# Spring context tests (AuthService/GeoService/MenuService/APIGateway) need a
# running datastore + env. Source the local secrets first:
cd backend && set -a && source .env && set +a
# Map shared creds onto the Spring-specific vars used at test time:
export SPRING_DATASOURCE_USERNAME="$POSTGRES_USER" SPRING_DATASOURCE_PASSWORD="$POSTGRES_PASSWORD"
export SPRING_MONGODB_URI="mongodb://$MONGO_USER:$MONGO_PASSWORD@localhost:27018/menu_db?authSource=admin"
for s in OrderService GeoService RestaurantService RatingService ReservationService \
         AuthService MenuService NotificationService APIGateway; do
  (cd "$s" && ./gradlew test --console=plain)
done

# CheckoutService (Python / FastAPI). Note: pinned pydantic/fastapi fail to build
# wheels on Python 3.14 — use a venv with relaxed versions for local runs.
cd backend/CheckoutService && python3 -m venv .venv && source .venv/bin/activate \
  && pip install -U pip "pydantic>=2.9" "fastapi>=0.115" "httpx>=0.27" "uvicorn[standard]>=0.30" pytest \
  && python -m pytest tests/ -v
```

**Baseline counts (all green):** OrderService 27, MenuService 27, RestaurantService 13,
ReservationService 8, GeoService 7, RatingService 5, AuthService 5,
NotificationService 4, APIGateway 11 (incl. 10 WAF), CheckoutService 5 — **total 112**.

> CI note: provide the env vars above as CI secrets so context-loading tests pass.
> The frontends have no `test` script (lint only).

---

## 4. Test users (recreate after a `down -v`)

Volumes are wiped by `docker compose down -v`, which removes seeded users. There is
**no committed seed script** (removed for security). Recreate the per-role users with
inline calls through the gateway (replace `<PW>` with a password you choose):

### Preferred: automatic in-app seeding (no scripts)

Data preloading is built into the services and runs **only** when
`APP_SEED_ENABLED=true` (the dev `docker-compose.yml` sets this by default via
`backend/.env`). It is **idempotent** — existing rows are skipped — so it is safe
on every startup and never runs during tests or in production.

- **AuthService** (`config/DevDataSeeder.java`): creates one **APPROVED** user per
  role on startup. Password comes from `APP_SEED_PASSWORD` (default `Password123!`).
- **MenuService** (`config/MenuDataInitializer.java`): seeds demo menu categories +
  items per restaurant (guarded so re-runs are no-ops).

No manual steps are needed after `docker compose up`. To force a re-seed of users,
delete them first, then restart authservice:

```bash
cd backend && set -a && source .env && set +a
docker exec auth-db psql -U "$POSTGRES_USER" -d auth_db -c "DELETE FROM users WHERE username LIKE 'qa_%';"
docker compose restart authservice   # seeder recreates the 5 users (all APPROVED)
```

### Fallback: manual creation via the gateway

If seeding is disabled, recreate the per-role users with inline calls through the
gateway (replace `<PW>` with a password you choose):

```bash
GW=http://localhost:8080; PW='<PW>'
# CUSTOMER + ADMIN (auto-approved)
curl -s -X POST $GW/auth/register -H 'Content-Type: application/json' -d '{"name":"QA Customer","email":"qa.customer@clickmunch.test","username":"qa_customer","password":"'"$PW"'","role":"CUSTOMER","governmentId":"QA-1"}'
curl -s -X POST $GW/auth/register -H 'Content-Type: application/json' -d '{"name":"QA Admin","email":"qa.admin@clickmunch.test","username":"qa_admin","password":"'"$PW"'","role":"ADMIN","governmentId":"QA-2"}'
# RESTAURANT_MANAGER (pending approval)
curl -s -X POST $GW/auth/register -H 'Content-Type: application/json' -d '{"name":"QA Manager","email":"qa.manager@clickmunch.test","username":"qa_manager","password":"'"$PW"'","role":"RESTAURANT_MANAGER","governmentId":"QA-3"}'
# WAITER / CHEF (staff-invite -> register/staff)
WT=$(curl -s -X POST $GW/auth/staff-invite -H 'Content-Type: application/json' -d '{"restaurantId":1,"email":"qa.waiter@clickmunch.test","role":"WAITER"}' | grep -o '"data":"[^"]*"' | cut -d'"' -f4)
curl -s -X POST $GW/auth/register/staff -H 'Content-Type: application/json' -d '{"inviteToken":"'"$WT"'","name":"QA Waiter","username":"qa_waiter","password":"'"$PW"'","governmentId":"QA-4"}'
CT=$(curl -s -X POST $GW/auth/staff-invite -H 'Content-Type: application/json' -d '{"restaurantId":1,"email":"qa.chef@clickmunch.test","role":"CHEF"}' | grep -o '"data":"[^"]*"' | cut -d'"' -f4)
curl -s -X POST $GW/auth/register/staff -H 'Content-Type: application/json' -d '{"inviteToken":"'"$CT"'","name":"QA Chef","username":"qa_chef","password":"'"$PW"'","governmentId":"QA-5"}'
# Approve pending accounts (manager/waiter/chef). Simplest for local dev — update via DB:
#   cd backend && set -a && source .env && set +a
#   docker exec auth-db psql -U "$POSTGRES_USER" -d auth_db \
#     -c "UPDATE users SET approval_status='APPROVED' WHERE username LIKE 'qa_%';"
# Or via API with an ADMIN JWT: PUT $GW/auth/users/{id}/approve (Authorization: Bearer <admin token>)
```

> Note: `staff-invite` creates a pending placeholder user (username = email) plus a
> one-time token returned in `data`. Creating a second invite for the same email
> invalidates the previous token — capture and use each token immediately.
> `register` requires a `name` field (not `fullName`); WAITER/CHEF cannot self-register.

| Role | Username |
|---|---|
| CUSTOMER | `qa_customer` |
| RESTAURANT_MANAGER | `qa_manager` |
| WAITER | `qa_waiter` |
| CHEF | `qa_chef` |
| ADMIN | `qa_admin` |

Roles: `CUSTOMER`, `RESTAURANT_MANAGER`, `WAITER`, `CHEF`, `ADMIN`.
Approval flow: CUSTOMER/ADMIN auto-approved; RESTAURANT_MANAGER pending; WAITER/CHEF
via staff-invite then approval.

---

## 5. Services & ports

| Service | Port | Notes |
|---|---|---|
| API Gateway | 8080 | only public entry point |
| AuthService | 8081 | needs `JWT_SECRET` (= gateway's) |
| RestaurantService | 8082 | |
| GeoService | 8083 | internal only |
| MenuService | 8084 | MongoDB |
| OrderService | 8085 | RabbitMQ |
| ReservationService | 8086 | RabbitMQ |
| NotificationService | 8087 | RabbitMQ |
| RatingService | 8088 | |
| CheckoutService | 8089 | Python/FastAPI |

---

## 5b. WAF (Web Application Firewall) at the gateway

A lightweight application-layer WAF runs inside the API Gateway:
`APIGateway/.../security/WafFilter.java`, a `GlobalFilter` with
`HIGHEST_PRECEDENCE` so every request is screened **before** routing and before
the per-route JWT filter.

- **Blocks** (HTTP 403 `{"error":"Forbidden","message":"Request blocked by WAF"}`):
  SQL injection, XSS, and path-traversal signatures found in the request **path,
  query string, or `Referer`/`Origin`/`X-Forwarded-*` headers**.
- **Decodes up to two passes** to defeat single/double percent-encoding evasion.
- **Skips** CORS preflight (`OPTIONS`) so browser preflight is unaffected.
- **Does not scan request bodies** by design: bodies are JSON with legitimate
  free-text/passwords (false-positive risk), downstream SQL is parameterized
  (Spring Data), and responses are JSON-encoded.

### Why embedded vs. NGINX + ModSecurity?

The gateway is already the single public entry point, so the WAF lives there:
no extra container/image/network hop to deploy and secure, it integrates with the
existing reactive filter chain (runs ahead of JWT), and it is unit-testable
(`WafFilterTest`, 10 cases) with no sidecar. For defense-in-depth in a real
deployment, a network WAF (**NGINX + OWASP ModSecurity Core Rule Set**) can be
placed in front of the gateway later for deep body inspection — purely additive,
no application-code change required.

Quick check:

```bash
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:8080/menu?q=%3Cscript%3E"        # 403
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:8080/restaurant?id=5%20OR%201=1" # 403
```

---

## 6. Pre-PR checklist

- [ ] `git grep -nE "1245789630|ClickAndMunchSuperSecretKey|: mike|: secret" -- backend/ ':!**/build/**' ':!**/bin/**'` returns nothing.
- [ ] No `.env` files are tracked: `git ls-files | grep -E '\.env$'` returns nothing (only `*.example`/`*.template`).
- [ ] `cd backend && docker compose config --quiet` succeeds (env interpolation valid).
- [ ] Stack boots clean from empty volumes: `docker compose down -v && docker compose up --build -d` → all containers `healthy`.
- [ ] Backend test suites green (see Section 3); **112** baseline tests pass (107 Java + 5 Python).
- [ ] AuthService and APIGateway use the **same** `JWT_SECRET`: login through gateway returns a token, and that token on a protected route (`/restaurant`) is NOT rejected (missing/invalid tokens return 401).
- [ ] WAF blocks attacks at the gateway: `curl -s -o /dev/null -w '%{http_code}' "http://localhost:8080/menu?q=%3Cscript%3E"` returns `403`.

---

## 7. Known fixes / gotchas

- **OrderService fresh-volume startup** (fixed 2026-06-10): the legacy migration assumed
  pre-existing columns and broke on empty volumes (exposed once `down -v` was required
  to rotate DB credentials). Two fixes:
  - `OrderService/src/main/resources/schema.sql`: add `product_name` column before the
    `COALESCE(item_name, product_name, ...)` back-fill, then drop it.
  - `OrderService/.../config/LegacyOrderSchemaInitializer.java`: guard
    `applyOrderCompatibility()` on a **legacy-only** column (`restaurant_name`) instead
    of `customer_id` (which also exists in the current schema), so it never runs on a
    fresh DB.
- Changing DB credentials requires `docker compose down -v` — Postgres only applies
  `POSTGRES_USER/PASSWORD` on first init of an empty volume.
- **Data seeding** (`APP_SEED_ENABLED`, fixed 2026-06-10): a merged `MenuDataInitializer`
  used to run unconditionally and referenced a non-existent `Category.PLATO` constant
  (the enum value is `PLATO_FUERTE`), failing MenuService compilation and the
  `contextLoads` test. Now seeders are opt-in (`@ConditionalOnProperty`) and the
  enum references are corrected. Legacy `menu_db` rows with `category:"PLATO"` were
  migrated in place to `PLATO_FUERTE`.
- **`MenuItemRequest` DTO** gained a leading `categoryId` field in the merge (8 fields);
  `MenuServiceTest` was updated to the new constructor arity.
- **Stale `* 2.class` build artifacts**: a previous copy left duplicate
  `RestaurantControllerTest 2.class` files under `build/`, which Gradle tried to load as
  an invalid class name (`Test 2`) and aborted the test JVM. Fix: delete them
  (`find backend -path '*/build/*' -name '* 2.class' -delete`); a clean rebuild avoids it.
- **Frontends** typecheck with `npx tsc --noEmit` (both dashboard and mobile). Neither
  has a `test` npm script (lint only). Dashboard runs on :5173; Expo web on :8081 and
  Metro/QR on `exp://<LAN-IP>:8081`. Mobile API base is the gateway (`:8080`) via
  `EXPO_PUBLIC_GATEWAY_URL*` in `frontend/mobile/.env`.
