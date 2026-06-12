# Load Balancer — GameSeeker Scrapper Service

## What is it?

The **Load Balancer** distributes incoming HTTP requests across multiple instances of the
`scrapper-service`, preventing a single instance from becoming a bottleneck while others sit idle.

In GameSeeker, the scrapper is the most resource-intensive component: it runs web scraping
against Steam, GOG, Epic, and Microsoft in parallel. Running multiple balanced instances
enables horizontal scaling of that workload.

```
Client / Gateway
       │
       ▼
 ┌─────────────┐
 │ scrapper-lb │  ← Load Balancer (port 5010)
 └──────┬──────┘
        │ distributes according to the selected algorithm
   ┌────┼────┐
   ▼    ▼    ▼
 [s-1][s-2][s-3]  ← scrapper-service instances (internal port 5000)
```

## Available algorithms

| Algorithm         | Env value          | When to use                                                    |
|-------------------|--------------------|----------------------------------------------------------------|
| Round Robin       | `round_robin`      | Homogeneous instances, uniform request cost                    |
| Least Connections | `least_connections`| Variable-duration requests (scraping time varies by store)     |
| Weighted          | `weighted`         | Instances with different CPU/RAM capacity                      |

> **Recommendation for GameSeeker:** use `least_connections` — scraping Steam, GOG, Epic,
> and Microsoft can take very different amounts of time per request.

## File structure

```
performance-scalability/load-balancer/
├── balancer.py          # Load balancer logic (FastAPI + three strategy classes)
├── Dockerfile.balancer  # Docker image for the balancer only
├── docker-compose.yml   # 1 balancer + 3 scrapper instances (standalone)
├── requirements.txt     # Balancer dependencies (fastapi, uvicorn, httpx)
└── README.md
```

## Running standalone

```bash
cd performance-scalability/load-balancer

# Default: Round Robin
docker compose up --build

# Least Connections
LB_ALGORITHM=least_connections docker compose up --build

# Weighted Round Robin
LB_ALGORITHM=weighted docker compose up --build
```

## Available endpoints

| Endpoint                         | Description                                    |
|----------------------------------|------------------------------------------------|
| `GET /lb-status`                 | Balancer status and registered backends        |
| `GET /api/v1/games/health`       | Health check (proxied to the scrapper)         |
| `GET /api/v1/games/search?name=` | Game search across all stores (load balanced)  |
| `GET /api/v1/games/compare?name=`| Price comparison across stores (load balanced) |
| `POST /api/v1/games/compare/bulk`| Bulk price comparison (load balanced)          |

