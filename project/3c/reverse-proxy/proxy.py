import os
import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [REVERSE-PROXY] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Reverse Proxy")

# Internal service URLs (accessible via the Docker network)
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://gateway-service:8080")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://frontend-service:3000")

# Simulated IP allowlist
ALLOWED_IPS = {"127.0.0.1", "localhost", "testclient"}

@app.middleware("http")
async def access_control(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"Incoming request: {request.method} {request.url.path} from {client_ip}")

    # Simulate IP-based access control (demo mode)
    # Check if IP starts with common docker network IPs or loopback
    is_allowed = (
        client_ip in ALLOWED_IPS 
        or client_ip.startswith("172.")  # Docker bridge network
        or client_ip.startswith("192.168.")
        or client_ip.startswith("10.")
    )
    if not is_allowed:
        logger.warning(f"Request from unlisted/external IP: {client_ip} - allowed in demo mode")

    response = await call_next(request)
    return response

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request):
    """
    Forward requests to either gateway-service or frontend-service depending on the path.
    """
    # Check if the request is for the API or health endpoints
    if path.startswith("api/") or path == "health" or path.startswith("health/"):
        target_url = f"{GATEWAY_URL}/{path}"
        service_name = "gateway-service"
    else:
        target_url = f"{FRONTEND_URL}/{path}"
        service_name = "frontend-service"

    headers = dict(request.headers)

    # Strip Host header so the target server handles it correctly
    headers.pop("host", None)

    # Add standard proxy headers
    client_ip = request.client.host if request.client else "127.0.0.1"
    headers["x-forwarded-for"] = client_ip
    headers["x-forwarded-proto"] = request.url.scheme

    # Capture query parameters
    query_params = dict(request.query_params)

    # Read body
    body = await request.body()

    # Forward the request using httpx
    async with httpx.AsyncClient() as client:
        try:
            backend_response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=query_params,
                timeout=60.0,
            )
        except httpx.ConnectError as e:
            logger.error(f"Failed to connect to {service_name} ({target_url}): {e}")
            raise HTTPException(status_code=502, detail=f"{service_name} unreachable")
        except Exception as e:
            logger.error(f"Error during proxy request to {service_name}: {e}")
            raise HTTPException(status_code=500, detail="Internal proxy error")

    # Filter out hop-by-hop headers
    response_headers = {}
    HOP_BY_HOP = {
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "te",
        "trailers",
        "transfer-encoding",
        "upgrade",
        "content-encoding",
        "content-length",
    }
    for key, val in backend_response.headers.items():
        if key.lower() not in HOP_BY_HOP:
            response_headers[key] = val

    # Stream response back
    async def generate_response():
        async for chunk in backend_response.aiter_bytes():
            yield chunk

    logger.info(f"Proxied {request.method} /{path} -> {service_name}. Response code: {backend_response.status_code}")

    return StreamingResponse(
        generate_response(),
        status_code=backend_response.status_code,
        headers=response_headers,
    )
