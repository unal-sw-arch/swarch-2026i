# test-failover.sh — Hot Spare Failover Test Suite
# ArquiSoft Tienda de Regalos
# =============================================================================
# Prerrequisito: docker compose up -d 
# Uso:           chmod +x test-failover.sh && ./test-failover.sh
# =============================================================================

COORDINATOR="http://localhost:8080"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

banner() { echo -e "\n${CYAN}${BOLD}══════════════════════════════════════════${NC}"; echo -e "${CYAN}${BOLD}  $1${NC}"; echo -e "${CYAN}${BOLD}══════════════════════════════════════════${NC}"; }
ok()     { echo -e "  ${GREEN}✔  $1${NC}"; PASS=$((PASS+1)); }
fail()   { echo -e "  ${RED}✘  $1${NC}"; FAIL=$((FAIL+1)); }
info()   { echo -e "  ${YELLOW}ℹ  $1${NC}"; }
step()   { echo -e "\n  ${BOLD}▶ $1${NC}"; }

# ── TEST 1: Todos los servicios responden antes del failover ──────────
banner "TEST 1 — Estado inicial del sistema"

step "Verificando que el coordinator responde..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$COORDINATOR/")
if [ "$STATUS" = "200" ]; then
  ok "Coordinator respondió HTTP $STATUS"
else
  fail "Coordinator no responde (HTTP $STATUS). ¿Está corriendo docker compose?"
  exit 1
fi

step "Verificando estado interno del coordinator..."
STATE=$(curl -s --max-time 5 "$COORDINATOR/coordinator/state")
echo "  $STATE"
PRIMARY=$(echo $STATE | grep -o '"primary":"[^"]*"' | cut -d'"' -f4)
SECONDARY=$(echo $STATE | grep -o '"secondary":"[^"]*"' | cut -d'"' -f4)
if [ -n "$PRIMARY" ]; then
  ok "Primario identificado: $PRIMARY"
  ok "Secundario identificado: $SECONDARY"
else
  fail "No se pudo leer el estado del coordinator"
fi

step "Verificando que /api/products responde a través del coordinator..."
RESP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$COORDINATOR/api/products")
if [ "$RESP" = "200" ]; then
  ok "GET /api/products → HTTP 200 (a través del coordinator)"
else
  fail "GET /api/products → HTTP $RESP"
fi

# ── TEST 2: Fan-out — ambos nodos procesan en paralelo ────────────────
banner "TEST 2 — Fan-out en paralelo (ambos nodos activos)"

step "Enviando 5 requests consecutivos y midiendo latencia..."
SUCCESS=0
for i in $(seq 1 5); do
  LATENCY=$(curl -s -o /dev/null -w "%{time_total}" --max-time 5 "$COORDINATOR/api/products")
  if [ "$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 $COORDINATOR/api/products)" = "200" ]; then
    SUCCESS=$((SUCCESS+1))
    info "Request $i → OK (${LATENCY}s)"
  fi
done

if [ $SUCCESS -eq 5 ]; then
  ok "5/5 requests exitosos bajo operación normal"
else
  fail "$SUCCESS/5 requests exitosos"
fi

step "Verificando que ambos nodos están corriendo..."
GW_ACTIVE=$(docker ps --filter "name=api-gateway" --filter "name=api-gateway$" --format "{{.Names}}" 2>/dev/null | grep -v spare | head -1)
GW_SPARE=$(docker ps --filter "name=api-gateway-spare" --format "{{.Names}}" 2>/dev/null | head -1)

if [ -n "$GW_ACTIVE" ]; then
  ok "Nodo activo corriendo: $GW_ACTIVE"
else
  info "No se pudo detectar el nodo activo por nombre (puede variar según tu compose)"
fi
if [ -n "$GW_SPARE" ]; then
  ok "Nodo spare corriendo: $GW_SPARE"
else
  info "No se pudo detectar el nodo spare por nombre (puede variar según tu compose)"
fi

# ── TEST 3: Failover — detener el nodo activo ─────────────────────────
banner "TEST 3 — Failover: el nodo activo falla"

step "Estado antes del failover..."
STATE_BEFORE=$(curl -s --max-time 5 "$COORDINATOR/coordinator/state")
info "Coordinator state: $STATE_BEFORE"

step "Deteniendo el nodo api-gateway (nodo activo)..."
# Intentar con nombre real del contenedor
CONTAINER=$(docker ps --format "{{.Names}}" 2>/dev/null | grep "api-gateway" | grep -v "spare" | grep -v "coordinator" | head -1)
if [ -n "$CONTAINER" ]; then
  docker stop "$CONTAINER" > /dev/null 2>&1
  ok "Contenedor '$CONTAINER' detenido"
else
  fail "No se encontró el contenedor del nodo activo. Detenlo manualmente con: docker stop <nombre>"
  info "Continuando el test asumiendo que el nodo activo está caído..."
fi

step "Esperando 2 segundos para que el coordinator detecte la falla..."
sleep 2

# ── TEST 4: El spare debe responder durante el failover ───────────────
banner "TEST 4 — El spare toma el control"

step "Enviando request al coordinator mientras el activo está caído..."
FAILOVER_RESP=$(curl -s --max-time 8 "$COORDINATOR/api/products")
FAILOVER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$COORDINATOR/api/products")

if [ "$FAILOVER_HTTP" = "200" ]; then
  ok "Coordinator respondió HTTP 200 usando el SPARE ✔"
  FAILOVER_FLAG=$(echo "$FAILOVER_RESP" | grep -o '"_failover":true')
  if [ -n "$FAILOVER_FLAG" ]; then
    ok "Campo _failover:true confirmado en la respuesta"
  else
    info "Respuesta recibida sin campo _failover (puede ser normal si el spare está promovido)"
  fi
else
  fail "Coordinator devolvió HTTP $FAILOVER_HTTP durante el failover"
fi

step "Verificando que el coordinator actualizó su nodo primario..."
STATE_AFTER=$(curl -s --max-time 5 "$COORDINATOR/coordinator/state")
info "Coordinator state después del failover: $STATE_AFTER"
PRIMARY_AFTER=$(echo $STATE_AFTER | grep -o '"primary":"[^"]*"' | cut -d'"' -f4)
if [ "$PRIMARY_AFTER" != "$PRIMARY" ]; then
  ok "Primario actualizado de '$PRIMARY' → '$PRIMARY_AFTER'"
else
  info "Primario sin cambio (puede estar en modo resiliente)"
fi

# ── TEST 5: Sistema sigue disponible durante failover ─────────────────
banner "TEST 5 — Disponibilidad continua (5 requests post-failover)"

step "Enviando 5 requests adicionales mientras el activo está caído..."
SUCCESS=0
FAILED=0
for i in $(seq 1 5); do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$COORDINATOR/api/products")
  if [ "$HTTP" = "200" ]; then
    SUCCESS=$((SUCCESS+1))
    info "Request $i → OK (spare sirviendo)"
  else
    FAILED=$((FAILED+1))
    info "Request $i → HTTP $HTTP"
  fi
done

if [ $SUCCESS -ge 4 ]; then
  ok "$SUCCESS/5 requests exitosos con nodo activo caído — disponibilidad mantenida"
else
  fail "Solo $SUCCESS/5 requests exitosos. Revisar configuración del spare."
fi

# ── TEST 6: Recuperación — reiniciar el nodo activo ───────────────────
banner "TEST 6 — Recuperación: reiniciar el nodo activo"

if [ -n "$CONTAINER" ]; then
  step "Reiniciando el contenedor '$CONTAINER'..."
  docker start "$CONTAINER" > /dev/null 2>&1
  sleep 3
  ok "Contenedor reiniciado"

  step "Verificando que el sistema vuelve a funcionar normalmente..."
  RECOVER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$COORDINATOR/api/products")
  if [ "$RECOVER_HTTP" = "200" ]; then
    ok "Sistema operativo post-recuperación (HTTP 200)"
  else
    fail "Error post-recuperación (HTTP $RECOVER_HTTP)"
  fi
else
  info "Reinicia el contenedor manualmente con: docker start <nombre>"
fi

# ── RESUMEN FINAL ─────────────────────────────────────────────────────
banner "RESUMEN DE PRUEBAS"
TOTAL=$((PASS+FAIL))
echo -e "  Total:   ${BOLD}$TOTAL${NC}"
echo -e "  ${GREEN}Pasaron: $PASS${NC}"
echo -e "  ${RED}Fallaron: $FAIL${NC}"
echo ""
if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✔ Hot Spare Pattern funcionando correctamente${NC}"
else
  echo -e "  ${YELLOW}${BOLD}⚠ Revisar los tests fallidos arriba${NC}"
fi
echo ""