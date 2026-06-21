"""
Load Balancer Pattern — balancer.py

Adapted for the scrapper-service of GameSeeker.

Distributes incoming HTTP requests across multiple scrapper-service instances
using one of three algorithms, selectable via the LB_ALGORITHM environment variable:

  round_robin       — distributes requests sequentially across all instances
  least_connections — sends each request to the instance with the fewest active connections
  weighted          — distributes proportionally to each instance's assigned weight

Each algorithm is implemented as an independent strategy class
to make them easy to compare and swap at runtime.
"""

import os
import asyncio
import itertools
import logging
from collections import defaultdict
from typing import Protocol

import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s [LB-SCRAPPER] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="GameSeeker — Scrapper Load Balancer")

# Backend instances — hostnames resolved by Docker internal DNS
BACKENDS = [
    {"url": "http://scrapper-service-1:5000", "weight": 1},
    {"url": "http://scrapper-service-2:5000", "weight": 2},  # receives twice as many requests
    {"url": "http://scrapper-service-3:5000", "weight": 1},
]

# Read the desired algorithm from the environment (defaults to round_robin)
ALGORITHM = os.getenv("LB_ALGORITHM", "round_robin")

# ── Algorithm implementations ─────────────────────────────────────────────────

class LoadBalancingStrategy(Protocol):
    """Common interface that every load-balancing strategy must implement."""
    def next_backend(self) -> dict: ...


class RoundRobin:
    """
    Distributes requests sequentially across all backends.
    Best for homogeneous instances with uniform request cost.
    """

    def __init__(self, backends: list[dict]):
        self._cycle = itertools.cycle(backends)
        self._lock = asyncio.Lock()  # prevents race conditions under concurrent requests

    async def next_backend(self) -> dict:
        async with self._lock:
            return next(self._cycle)


class LeastConnections:
    """
    Sends each request to the backend with the fewest active connections.
    Recommended for GameSeeker because scraping different stores
    (Steam, GOG, Epic, Microsoft) can take very different amounts of time.
    """

    def __init__(self, backends: list[dict]):
        self._backends = backends
        self._connections: dict[str, int] = defaultdict(int)  # active connection counter per URL
        self._lock = asyncio.Lock()

    async def next_backend(self) -> dict:
        async with self._lock:
            # Pick the backend with the lowest active connection count
            return min(self._backends, key=lambda b: self._connections[b["url"]])

    def increment(self, url: str):
        """Registers that a new request has been dispatched to this backend."""
        self._connections[url] += 1

    def decrement(self, url: str):
        """Registers that a request to this backend has completed."""
        self._connections[url] = max(0, self._connections[url] - 1)


class WeightedRoundRobin:
    """
    Distributes requests proportionally to each backend's weight.
    Useful when some instances have more CPU/RAM than others.
    """

    def __init__(self, backends: list[dict]):
        # Expand each backend into the cycle proportional to its weight
        # e.g. weight=2 means the backend appears twice in the rotation
        expanded = []
        for b in backends:
            expanded.extend([b] * b.get("weight", 1))
        self._cycle = itertools.cycle(expanded)
        self._lock = asyncio.Lock()

    async def next_backend(self) -> dict:
        async with self._lock:
            return next(self._cycle)


# ── Strategy factory ──────────────────────────────────────────────────────────

def build_strategy(algorithm: str):
    """Instantiates the correct strategy based on the LB_ALGORITHM env var."""
    if algorithm == "round_robin":
        logger.info("Algorithm: Round Robin")
        return RoundRobin(BACKENDS)
    elif algorithm == "least_connections":
        logger.info("Algorithm: Least Connections")
        return LeastConnections(BACKENDS)
    elif algorithm == "weighted":
        logger.info("Algorithm: Weighted Round Robin (weights: 1-2-1)")
        return WeightedRoundRobin(BACKENDS)
    else:
        raise ValueError(
            f"Unknown algorithm: {algorithm!r}. "
            "Valid options: round_robin, least_connections, weighted."
        )


# Build the strategy once at startup
strategy = build_strategy(ALGORITHM)

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/lb-status")
async def lb_status():
    """Returns the current state of the load balancer and its registered backends."""
    return {
        "component": "GameSeeker Scrapper Load Balancer",
        "algorithm": ALGORITHM,
        "backends": [b["url"] for b in BACKENDS],
    }


@app.api_route("/", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(request: Request, path: str = ""):
    """
    Intercepts every incoming request and forwards it to the next
    backend selected by the active load-balancing strategy.
    """
    backend = await strategy.next_backend()
    target_url = f"{backend['url']}/{path}"

    # Forward all headers except 'host', which must match the target
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    body = await request.body()

    # Track active connections only when using LeastConnections
    if isinstance(strategy, LeastConnections):
        strategy.increment(backend["url"])

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=dict(request.query_params),
            )
        logger.info(
            f"[{ALGORITHM}] {request.method} /{path} → {backend['url']} → {resp.status_code}"
        )
        return JSONResponse(content=resp.json(), status_code=resp.status_code)
    except httpx.ConnectError:
        # Backend is down or unreachable
        logger.error(f"Backend unreachable: {backend['url']}")
        raise HTTPException(status_code=502, detail=f"Backend unreachable: {backend['url']}")
    finally:
        # Always decrement the counter when the request finishes (success or error)
        if isinstance(strategy, LeastConnections):
            strategy.decrement(backend["url"])
