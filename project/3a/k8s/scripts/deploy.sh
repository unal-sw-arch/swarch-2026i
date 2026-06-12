#!/usr/bin/env bash
# deploy.sh
# Aplica todos los manifiestos de Kubernetes en el orden correcto.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> [1/6] Namespace"
kubectl apply -f "$K8S_DIR/namespace.yaml"

echo "==> [2/6] ConfigMap"
kubectl apply -f "$K8S_DIR/configmap.yaml"

echo "==> [3/6] Secret (desde .env)"
bash "$SCRIPT_DIR/create-secret.sh"

echo "==> [4/6] auth-db (PVC + StatefulSet + Service)"
kubectl apply -f "$K8S_DIR/auth-db/pvc.yaml"
kubectl apply -f "$K8S_DIR/auth-db/statefulset.yaml"
kubectl apply -f "$K8S_DIR/auth-db/service.yaml"

echo "==> Esperando que auth-db esté lista..."
kubectl rollout status statefulset/auth-db -n clickmunch --timeout=120s

echo "==> [5/6] AuthService (Deployment + Service + PDB)"
kubectl apply -f "$K8S_DIR/authservice/deployment.yaml"
kubectl apply -f "$K8S_DIR/authservice/service.yaml"
kubectl apply -f "$K8S_DIR/authservice/pdb.yaml"

echo "==> Esperando que AuthService esté listo..."
kubectl rollout status deployment/authservice -n clickmunch --timeout=180s

echo "==> [6/6] APIGateway (Deployment + Service)"
kubectl apply -f "$K8S_DIR/apigateway/deployment.yaml"
kubectl apply -f "$K8S_DIR/apigateway/service.yaml"

echo "==> Esperando que APIGateway esté listo..."
kubectl rollout status deployment/apigateway -n clickmunch --timeout=180s

echo ""
echo "✓ Despliegue completo. Estado del cluster:"
kubectl get pods,svc -n clickmunch
echo ""
echo "URL de acceso externo:"
minikube service apigateway -n clickmunch --url
