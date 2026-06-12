#!/usr/bin/env bash
# simulate-failover.sh
# Demuestra el comportamiento de Auto-Healing (Part A) y Failover Hot Spare (Part B).
#
# Uso:
#   bash simulate-failover.sh apigateway   # Parte A: self-healing del gateway
#   bash simulate-failover.sh authservice  # Parte B: failover del hot spare
set -euo pipefail

TARGET="${1:-authservice}"
NS="clickmunch"

echo "======================================================="
echo " SIMULACIÓN DE FAILOVER — $TARGET"
echo "======================================================="
echo ""

echo "--- Estado ANTES del fallo ---"
kubectl get pods -n "$NS" -l "app=$TARGET" -o wide
echo ""

# Seleccionar el primer pod de la app
POD=$(kubectl get pods -n "$NS" -l "app=$TARGET" \
      --field-selector=status.phase=Running \
      -o jsonpath='{.items[0].metadata.name}')

echo "==> Eliminando pod '$POD' (simula fallo inesperado)..."
kubectl delete pod "$POD" -n "$NS"
echo ""

echo "--- Observando recuperación en tiempo real (Ctrl+C para salir) ---"
echo "    Kubernetes debe recrear el pod automáticamente."
echo ""
kubectl get pods -n "$NS" -l "app=$TARGET" --watch &
WATCH_PID=$!

# Esperar a que el deployment vuelva a tener todas las réplicas
kubectl rollout status deployment/"$TARGET" -n "$NS" --timeout=120s
kill $WATCH_PID 2>/dev/null || true

echo ""
echo "--- Estado DESPUÉS de la recuperación ---"
kubectl get pods -n "$NS" -l "app=$TARGET" -o wide
echo ""
echo "✓ Failover completado. El spare tomó control y Kubernetes restauró la réplica."

echo ""
echo "--- Prueba de conectividad post-failover ---"
if [[ "$TARGET" == "apigateway" ]]; then
  GW_URL=$(minikube service apigateway -n "$NS" --url 2>/dev/null || echo "http://$(minikube ip):30080")
  echo "==> GET $GW_URL/actuator/health"
  curl -s "$GW_URL/actuator/health" | python3 -m json.tool 2>/dev/null || \
  curl -s "$GW_URL/actuator/health"
fi
