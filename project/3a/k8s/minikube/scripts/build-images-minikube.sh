#!/usr/bin/env bash
# build-images-minikube.sh
# Construye las imágenes Docker directamente dentro del daemon de Minikube,
# evitando la necesidad de un registry externo (imagePullPolicy: Never).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

echo "==> Apuntando Docker al daemon de Minikube..."
eval "$(minikube docker-env)"

echo "==> Construyendo imagen: clickmunch/apigateway:latest"
docker build -t clickmunch/apigateway:latest "$BACKEND_DIR/APIGateway"

echo "==> Construyendo imagen: clickmunch/authservice:latest"
docker build -t clickmunch/authservice:latest "$BACKEND_DIR/AuthService"

echo "==> Construyendo imagen: clickmunch/notificationservice:latest"
docker build -t clickmunch/notificationservice:latest "$BACKEND_DIR/NotificationService"

echo ""
echo "✓ Imágenes disponibles en el daemon de Minikube:"
docker images | grep clickmunch
