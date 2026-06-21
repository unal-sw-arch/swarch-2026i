#!/usr/bin/env bash
# create-secret.sh
# Lee backend/.env y crea el Secret de Kubernetes a partir de los valores reales.
# Usar este script en lugar de aplicar secret.yaml con valores hardcodeados.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/../../backend" && pwd)/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: No se encontró backend/.env — crea el archivo primero." >&2
  exit 1
fi

# Cargar variables del .env
set -o allexport
# shellcheck source=/dev/null
source "$ENV_FILE"
set +o allexport

echo "==> Creando/actualizando Secret 'clickmunch-secrets' en namespace clickmunch..."
kubectl create secret generic clickmunch-secrets \
  --namespace clickmunch \
  --from-literal=POSTGRES_USER="$POSTGRES_USER" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✓ Secret creado correctamente."
