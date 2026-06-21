#!/usr/bin/env bash
# simulate-failover.sh
# Demuestra el comportamiento de Auto-Healing (Part A), Failover Hot Spare (Part B),
# y Failover Cold Spare (Part C).
#
# Uso:
#   bash simulate-failover.sh apigateway            # Parte A: self-healing del gateway
#   bash simulate-failover.sh authservice           # Parte B: failover del hot spare
#   bash simulate-failover.sh notificationservice   # Parte C: failover del cold spare
set -euo pipefail

TARGET="${1:-authservice}"
NS="clickmunch"

echo "======================================================="
echo " SIMULACIÓN DE FAILOVER — $TARGET"
echo "======================================================="
echo ""

# ─── Identificar patrón de redundancia ───
REDUNDANCY_LABEL=$(kubectl get deployment "$TARGET" -n "$NS" \
  -o jsonpath='{.metadata.labels.redundancy}' 2>/dev/null || echo "unknown")
echo "Patrón de redundancia: $REDUNDANCY_LABEL"
echo ""

echo "--- Estado ANTES del fallo ---"
kubectl get pods -n "$NS" -l "app=$TARGET" -o wide
echo ""

# Seleccionar el primer pod de la app
POD=$(kubectl get pods -n "$NS" -l "app=$TARGET" \
      --field-selector=status.phase=Running \
      -o jsonpath='{.items[0].metadata.name}')

echo "==> Eliminando pod '$POD' (simula fallo inesperado)..."
DELETE_TIME=$(date +%s)
kubectl delete pod "$POD" -n "$NS"
echo ""

echo "--- Observando recuperación en tiempo real (Ctrl+C para salir) ---"
if [ "$REDUNDANCY_LABEL" = "cold-spare" ]; then
  echo "    COLD SPARE: El único pod fue eliminado."
  echo "    Kubernetes debe crear un nuevo pod (el spare frío se enciende)."
  echo "    Durante el arranque (~60-90 s), RabbitMQ retiene los mensajes."
else
  echo "    Kubernetes debe recrear el pod automáticamente."
fi
echo ""
kubectl get pods -n "$NS" -l "app=$TARGET" --watch &
WATCH_PID=$!

# Esperar a que el deployment vuelva a tener todas las réplicas
kubectl rollout status deployment/"$TARGET" -n "$NS" --timeout=180s
READY_TIME=$(date +%s)
kill $WATCH_PID 2>/dev/null || true

RTO=$((READY_TIME - DELETE_TIME))

echo ""
echo "--- Estado DESPUÉS de la recuperación ---"
kubectl get pods -n "$NS" -l "app=$TARGET" -o wide
echo ""
echo "✓ Failover completado en ${RTO} segundos."

if [ "$REDUNDANCY_LABEL" = "cold-spare" ]; then
  echo ""
  echo "─── Verificación Cold Spare ───"
  echo "RTO medido: ${RTO}s (objetivo: ≤ 90s)"
  echo "RPO: 0 (mensajes retenidos en RabbitMQ durante el downtime)"
  echo ""
  echo "--- Verificando que NotificationService está respondiendo ---"
  # Intentar acceder al health endpoint a través del pod recién creado
  NEW_POD=$(kubectl get pods -n "$NS" -l "app=$TARGET" \
    --field-selector=status.phase=Running \
    -o jsonpath='{.items[0].metadata.name}')
  kubectl exec "$NEW_POD" -n "$NS" -- \
    wget -qO- http://localhost:8087/actuator/health 2>/dev/null || \
    echo "(health check requiere que el pod esté completamente listo)"
fi

echo ""
echo "--- Prueba de conectividad post-failover ---"
if [[ "$TARGET" == "apigateway" ]]; then
  GW_URL=$(minikube service apigateway -n "$NS" --url 2>/dev/null || echo "http://$(minikube ip):30080")
  echo "==> GET $GW_URL/actuator/health"
  curl -s "$GW_URL/actuator/health" | python3 -m json.tool 2>/dev/null || \
  curl -s "$GW_URL/actuator/health"
fi
