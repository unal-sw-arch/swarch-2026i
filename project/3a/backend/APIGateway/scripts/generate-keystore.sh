#!/usr/bin/env sh
#
# Secure Channel (TLS) — self-signed certificate generator for the API Gateway.
#
# The gateway is the only public entry point of Click & Munch, so terminating
# TLS here encrypts every REST + STOMP/WebSocket byte exchanged with the web
# dashboard and the mobile app. This script mints a PKCS12 keystore with a
# self-signed certificate using `keytool` (bundled with the JDK/JRE).
#
# It runs automatically during `docker build` (see the Dockerfile) so every
# image ships with a working HTTPS endpoint, and it is re-runnable locally to
# produce a fresh certificate for a different deployment hostname.
#
# Reuse note: a self-signed certificate is bound to the hostnames/IPs listed in
# its Subject Alternative Name (SAN). The SAME certificate works for any client
# that reaches the gateway through one of those names. When you deploy to a new
# public hostname (e.g. api.clickmunch.com) you must mint a new certificate
# whose SAN includes that name — just re-run this script with CERT_CN/CERT_SAN
# set, or (recommended for production) mount a CA-issued keystore (Let's Encrypt)
# and point SSL_KEYSTORE at it instead.
#
# Override any of these via environment variables:
#   SSL_KEYSTORE           output path (a leading "file:" is stripped)
#                          default: certs/keystore.p12
#   SSL_KEYSTORE_PASSWORD  keystore/key password   default: changeit
#   SSL_KEY_ALIAS          key alias               default: apigateway
#   CERT_CN                certificate common name default: localhost
#   CERT_SAN               Subject Alt Names       default: dns:localhost,dns:apigateway,ip:127.0.0.1
#   CERT_VALIDITY_DAYS     validity in days        default: 825
#   CERT_FORCE             set to 1 to overwrite an existing keystore
#
set -eu

KEYSTORE="${SSL_KEYSTORE:-certs/keystore.p12}"
PASSWORD="${SSL_KEYSTORE_PASSWORD:-changeit}"
ALIAS="${SSL_KEY_ALIAS:-apigateway}"
CN="${CERT_CN:-localhost}"
SAN="${CERT_SAN:-dns:localhost,dns:apigateway,ip:127.0.0.1}"
VALIDITY="${CERT_VALIDITY_DAYS:-825}"

# Spring's server.ssl.key-store uses a "file:" resource prefix; keytool needs a
# plain filesystem path, so strip it if present.
KEYSTORE_PATH="${KEYSTORE#file:}"

if [ -f "$KEYSTORE_PATH" ] && [ "${CERT_FORCE:-0}" != "1" ]; then
  echo "[generate-keystore] $KEYSTORE_PATH already exists; skipping (set CERT_FORCE=1 to overwrite)."
  exit 0
fi

mkdir -p "$(dirname "$KEYSTORE_PATH")"

echo "[generate-keystore] Creating self-signed certificate"
echo "                    keystore = $KEYSTORE_PATH"
echo "                    alias    = $ALIAS"
echo "                    CN       = $CN"
echo "                    SAN      = $SAN"
echo "                    validity = ${VALIDITY} days"

keytool -genkeypair \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -sigalg SHA256withRSA \
  -validity "$VALIDITY" \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_PATH" \
  -storepass "$PASSWORD" \
  -keypass "$PASSWORD" \
  -dname "CN=$CN, OU=APIGateway, O=Click and Munch" \
  -ext "SAN=$SAN"

echo "[generate-keystore] Done."
