# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GameSeeker is a microservices-based game price comparison platform. It scrapes prices from multiple game stores and provides a wishlist/user management system.

## Services

| Service | Language/Framework | Port |
|---|---|---|
| `user-service` | TypeScript / Hono / Prisma | 4000 |
| `scrapper-service` | Python / Flask | 5000 |
| `postgres` | PostgreSQL 15 | 5433 (ext) → 5432 (int) |
| `rabbitmq` | RabbitMQ 3 | 5672 (AMQP), 15672 (Management UI) |
| `gateway-service` | TypeScript / Hono | 8080 |
| `frontend-service` | TypeScript / Next.js 15 / Shadcn | 3000 |

## Commands

### Full Stack (Docker)
```bash
docker-compose up        # Start all services
docker-compose down      # Stop all services
```

### user-service (TypeScript/Hono)
```bash
cd user-service
npm run dev              # Development with hot-reload (tsx)
npm run build            # Compile TypeScript (tsc + tsc-alias)
npm start                # Run compiled output

npm run lint             # Check with Biome
npm run lint:fix         # Auto-fix with Biome
npm run format           # Format with Biome

# Prisma
npx prisma migrate dev   # Apply migrations (dev)
npx prisma generate      # Regenerate Prisma client
```

### scrapper-service (Python/Flask)
```bash
cd scrapper-service
python src/app.py        # Start Flask server (port 5000)
python src/main.py       # Run scraper tests/pipeline manually
```

### gateway-service (TypeScript/Hono)
```bash
cd gateway-service
npm run dev              # Development with hot-reload (tsx)
npm run build            # Compile TypeScript (tsup)
npm start                # Run compiled output
```

### frontend-service (Next.js 15)
```bash
cd frontend-service
npm run dev              # Development server (port 3000)
npm run build            # Production build
npm start                # Start production server
```

## Architecture

### Communication Pattern
- **HTTP/REST**: Scrapper exposes `GET /api/v1/games/search`, `/compare`, `/trending/<store>` endpoints
- **AMQP**: Scrapper publishes scraped prices to RabbitMQ queue `game_prices_queue`; user-service consumes updates
- **Frontend → Gateway**: `frontend-service` calls only `gateway-service:8080`; it never contacts downstream services directly
- **Gateway → Downstream**: `gateway-service` proxies requests to `user-service` and `scrapper-service`
- **Auth validation**: `gateway-service` calls `user-service /api/auth/session` before forwarding any protected route

### Layered Architecture (both services)
```
controllers → services → repositories
```
- `scrapper-service/src/repositories/scrapers/` — one file per store (steam, epic, gog, microsoft)
- `scrapper-service/src/repositories/brokers/` — `RabbitMQProducer` (prod) and `PrintBroker` (testing)

### user-service internals
- **Framework**: Hono (not Express)
- **Auth**: `better-auth` library (tables: User, Session, Account, Verification)
- **Wishlist**: 1:1 User→Wishlist, 1:N Wishlist→Game
- **Path alias**: `@/*` maps to `src/*`
- **Prisma schema**: split across `prisma/models/better-auth.prisma` and `prisma/models/wishlist.prisma`, merged via `prisma.config.ts`

### Environment Variables
Copy `.env.example` to `.env` in each service before running locally.

- `user-service`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `scrapper-service`: `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `QUEUE_NAME`
- `gateway-service`: `PORT`, `USER_SERVICE_URL`, `SCRAPPER_SERVICE_URL`
- `frontend-service`: `NEXT_PUBLIC_GATEWAY_URL`

## Design System

The `frontend-service` UI is built with **Shadcn/ui** components on top of **Tailwind CSS**.

- **Tailwind tokens** (colors, fonts, spacing): `frontend-service/tailwind.config.ts`
- **Component library**: Shadcn/ui — components live in `frontend-service/src/components/ui/`
- **Stitch project**: The visual design reference lives in the team's Stitch project. Use the `mcp__stitch__*` tools to inspect or generate screens when working on UI tasks.
