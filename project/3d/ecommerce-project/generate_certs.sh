#!/bin/bash
# generate_certs.sh
# Generates a TLS certificate for the NGINX reverse proxy.
# Prefers mkcert (browser-trusted dev CA) over openssl self-signed.
#
# Usage:  bash generate_certs.sh

set -e

CERT_DIR="./api-gateway/certs"
mkdir -p "$CERT_DIR"

if command -v mkcert >/dev/null 2>&1; then
  mkcert -cert-file "$CERT_DIR/nginx.crt" \
         -key-file  "$CERT_DIR/nginx.key" \
         localhost 127.0.0.1 ::1
  echo ""
  echo "✅  Certificate generated (trusted by local CA):"
else
  # Fallback: self-signed cert — browser will show a security warning
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/nginx.key" \
    -out    "$CERT_DIR/nginx.crt" \
    -subj   "/C=CO/ST=Bogota/L=Bogota/O=Universidad Nacional de Colombia/CN=localhost"
  echo ""
  echo "⚠️   openssl self-signed cert generated (browser will warn — install mkcert for a trusted cert):"
fi

echo "    $CERT_DIR/nginx.crt"
echo "    $CERT_DIR/nginx.key"
echo ""
echo "Next steps:"
echo "  docker compose up --build   (or: docker compose restart api-gateway)"
echo "  Then access: https://localhost:8443"
