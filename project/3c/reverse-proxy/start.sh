#!/bin/sh
set -e

mkdir -p /app/certs

# Generate self-signed SSL/TLS certificate
if [ ! -f /app/certs/cert.pem ] || [ ! -f /app/certs/key.pem ]; then
    echo "[SSL] Generating self-signed certificate for localhost..."
    openssl req -x509 -newkey rsa:4096 -nodes \
        -out /app/certs/cert.pem \
        -keyout /app/certs/key.pem \
        -days 365 \
        -subj "/C=US/ST=State/L=City/O=GameSeeker/OU=Dev/CN=localhost"
fi

echo "[SSL] Starting reverse-proxy with HTTPS on port 8000..."
exec uvicorn proxy:app --host 0.0.0.0 --port 8000 --ssl-keyfile=/app/certs/key.pem --ssl-certfile=/app/certs/cert.pem
