#!/usr/bin/env bash
# deploy.sh
# Aplica todos los manifiestos de Kubernetes en el orden correcto.
# Incluye: Namespace → ConfigMap → Secret → auth-db → AuthService →
#          RabbitMQ → notification-db → NotificationService (Cold Spare) →
#          APIGateway
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> [1/9] Namespace"
oc apply -f "$K8S_DIR/namespace.yaml"

echo "==> [2/9] ConfigMap"
oc apply -f "$K8S_DIR/configmap.yaml"

echo "==> [3/9] Secret (desde .env)"
bash "$SCRIPT_DIR/create-secret.sh"

echo "==> [4/9] auth-db (PVC + StatefulSet + Service)"
oc apply -f "$K8S_DIR/auth-db/pvc.yaml"
oc apply -f "$K8S_DIR/auth-db/statefulset.yaml"
oc apply -f "$K8S_DIR/auth-db/service.yaml"

echo "==> Esperando que auth-db esté lista..."
oc rollout status statefulset/auth-db -n clickmunch --timeout=120s

echo "==> [5/9] AuthService (Deployment + Service + PDB)"
oc apply -f "$K8S_DIR/authservice/deployment.yaml"
oc apply -f "$K8S_DIR/authservice/service.yaml"
oc apply -f "$K8S_DIR/authservice/pdb.yaml"

echo "==> Esperando que AuthService esté listo..."
oc rollout status deployment/authservice -n clickmunch --timeout=180s

echo "==> [6/9] RabbitMQ (Deployment + Service)"
oc apply -f "$K8S_DIR/rabbitmq/deployment.yaml"
oc apply -f "$K8S_DIR/rabbitmq/service.yaml"

echo "==> Esperando que RabbitMQ esté listo..."
oc rollout status deployment/rabbitmq -n clickmunch --timeout=120s

echo "==> [7/9] notification-db (PVC + StatefulSet + Service)"
oc apply -f "$K8S_DIR/notification-db/pvc.yaml"
oc apply -f "$K8S_DIR/notification-db/statefulset.yaml"
oc apply -f "$K8S_DIR/notification-db/service.yaml"

echo "==> Esperando que notification-db esté lista..."
oc rollout status statefulset/notification-db -n clickmunch --timeout=120s

echo "==> [8/9] NotificationService — Cold Spare (Deployment + Service + PDB)"
oc apply -f "$K8S_DIR/notificationservice/deployment.yaml"
oc apply -f "$K8S_DIR/notificationservice/service.yaml"
oc apply -f "$K8S_DIR/notificationservice/pdb.yaml"

echo "==> Esperando que NotificationService esté listo..."
oc rollout status deployment/notificationservice -n clickmunch --timeout=180s

echo "==> [9/9] APIGateway (Deployment + Service)"
oc apply -f "$K8S_DIR/apigateway/deployment.yaml"
oc apply -f "$K8S_DIR/apigateway/service.yaml"

echo "==> Esperando que APIGateway esté listo..."
oc rollout status deployment/apigateway -n clickmunch --timeout=180s

echo ""
echo "✓ Despliegue completo. Estado del cluster:"
oc get pods,svc -n clickmunch
echo ""
echo "==> Exponiendo APIGateway al exterior (OpenShift Route)"
oc expose svc/apigateway -n clickmunch 2>/dev/null || true
echo "URL de acceso externo:"
oc get route apigateway -n clickmunch -o jsonpath='{"http://"}{.spec.host}{"\n"}'
