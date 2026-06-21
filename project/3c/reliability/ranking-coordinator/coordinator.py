"""
Ranking Hot-Spare Coordinator
=============================

Part B of Reliability Lab 6 — Active Redundancy (Hot Spare).

This is the failover detector + router that sits in front of the redundant
ranking-service nodes. Both nodes (active and spare) consume every price event
in parallel from a RabbitMQ fanout exchange and share one Redis, so their
leaderboards are always identical — the spare is "hot". This coordinator:

  * health-checks BOTH nodes continuously (fault detection),
  * routes leaderboard reads to the current primary,
  * promotes the spare the instant the active stops answering (failover),
  * fails back to the active when it recovers,
  * exposes /status with live failover metrics and per-node leaderboard sizes
    (evidence that no state is lost across a failover).

It is API-compatible with ranking-service (it forwards /api/v1/ranking/*), so
the gateway can point RANKING_SERVICE_URL at the coordinator with no other
change — making the hot spare a real, transparent contribution to the system.
"""
import asyncio
import os
import time
from typing import Optional

import httpx
from fastapi import FastAPI, Request, Response

# --- Configuration -----------------------------------------------------------
ACTIVE_URL = os.getenv("RANKING_ACTIVE_URL", "http://ranking-active:6001").rstrip("/")
SPARE_URL = os.getenv("RANKING_SPARE_URL", "http://ranking-spare:6001").rstrip("/")
HEALTH_PATH = os.getenv("RANKING_HEALTH_PATH", "/api/v1/ranking/health")
TOP_PATH = os.getenv("RANKING_TOP_PATH", "/api/v1/ranking/top")
HEALTH_INTERVAL = float(os.getenv("HEALTH_INTERVAL_SECONDS", "0.25"))
HEALTH_TIMEOUT = float(os.getenv("HEALTH_TIMEOUT_SECONDS", "0.4"))
FAIL_THRESHOLD = int(os.getenv("FAIL_THRESHOLD", "2"))
FAILBACK = os.getenv("FAILBACK", "true").lower() == "true"

NODES = {"active": ACTIVE_URL, "spare": SPARE_URL}

# --- Mutable runtime state ---------------------------------------------------
state = {
    "primary": "active",          # which node currently serves reads
    "healthy": {"active": False, "spare": False},
    "consecutive_failures": {"active": 0, "spare": 0},
    "last_healthy_at": {"active": 0.0, "spare": 0.0},
    "failover_count": 0,
    "last_event": None,           # human-readable last transition
    "last_failover_ms": None,     # detection latency of the last promotion
    "started_at": time.time(),
}

app = FastAPI(title="ranking-hot-spare-coordinator")
_client: Optional[httpx.AsyncClient] = None


async def _check(node: str) -> bool:
    """Return True if `node` answered its health endpoint with 2xx."""
    try:
        r = await _client.get(NODES[node] + HEALTH_PATH, timeout=HEALTH_TIMEOUT)
        return r.status_code < 300
    except Exception:
        return False


def _promote(target: str, reason: str) -> None:
    prev = state["primary"]
    if prev == target:
        return
    # Detection latency: time since the failing node was last seen healthy.
    failed = prev
    latency_ms = round((time.time() - state["last_healthy_at"][failed]) * 1000, 1)
    state["primary"] = target
    state["failover_count"] += 1
    state["last_failover_ms"] = latency_ms
    state["last_event"] = f"{reason}: primary {prev} -> {target} (detected in ~{latency_ms} ms)"
    print(f"[coordinator] {state['last_event']}", flush=True)


async def _monitor() -> None:
    """Continuously probe both nodes and (de)promote the primary."""
    while True:
        for node in NODES:
            ok = await _check(node)
            state["healthy"][node] = ok
            if ok:
                state["consecutive_failures"][node] = 0
                state["last_healthy_at"][node] = time.time()
            else:
                state["consecutive_failures"][node] += 1

        primary = state["primary"]
        spare = "spare" if primary == "active" else "active"
        primary_down = state["consecutive_failures"][primary] >= FAIL_THRESHOLD

        # Failover: primary is down but the spare is up -> promote the spare.
        if primary_down and state["healthy"][spare]:
            _promote(spare, "FAILOVER")
        # Failback: we are running on the spare, the original active is healthy
        # again, and failback is enabled -> return to the active node.
        elif FAILBACK and primary == "spare" and state["healthy"]["active"]:
            _promote("active", "FAILBACK")

        await asyncio.sleep(HEALTH_INTERVAL)


@app.on_event("startup")
async def _startup() -> None:
    global _client
    _client = httpx.AsyncClient()
    asyncio.create_task(_monitor())


@app.on_event("shutdown")
async def _shutdown() -> None:
    if _client:
        await _client.aclose()


@app.get("/health")
async def health():
    """Health of the coordinator itself."""
    return {"status": "ok", "service": "ranking-coordinator"}


async def _leaderboard_size(node: str) -> Optional[int]:
    """Number of ranked games a node currently serves (evidence of sync)."""
    try:
        r = await _client.get(NODES[node] + TOP_PATH, params={"limit": 50}, timeout=HEALTH_TIMEOUT)
        if r.status_code < 300:
            return r.json().get("count")
    except Exception:
        return None
    return None


@app.get("/status")
async def status():
    """Live view of the protection group + failover metrics."""
    sizes = {n: await _leaderboard_size(n) for n in NODES}
    return {
        "primary": state["primary"],
        "healthy": state["healthy"],
        "leaderboard_size": sizes,          # active vs spare — should match
        "failover_count": state["failover_count"],
        "last_failover_ms": state["last_failover_ms"],
        "last_event": state["last_event"],
        "failback_enabled": FAILBACK,
        "uptime_seconds": round(time.time() - state["started_at"], 1),
    }


@app.api_route("/api/v1/ranking/{path:path}", methods=["GET"])
async def proxy(path: str, request: Request):
    """Forward ranking reads to the current primary node."""
    primary = state["primary"]
    target = NODES[primary] + "/api/v1/ranking/" + path
    try:
        upstream = await _client.get(
            target, params=dict(request.query_params), timeout=2.0
        )
    except Exception:
        return Response(
            content='{"error":"ranking unavailable"}',
            status_code=503,
            media_type="application/json",
        )
    resp = Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "application/json"),
    )
    # Make the redundancy observable to callers / in evidence captures.
    resp.headers["X-Served-By"] = primary
    resp.headers["X-Failover-Count"] = str(state["failover_count"])
    return resp
