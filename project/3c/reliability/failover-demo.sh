#!/usr/bin/env bash
# =============================================================================
# Part B — Active Redundancy (Hot Spare) failover demo / evidence capture
#
# Assumes the stack is already up:
#   docker compose -f reliability/docker-compose.reliability.yml up --build -d
#
# Demonstrates: active + spare are synchronized -> kill active -> coordinator
# promotes the spare in ms with zero leaderboard loss -> revive active -> failback.
# =============================================================================
set -uo pipefail

C=http://localhost:6010
jqf() { python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))"; }

step() { printf '\n\033[1;36m== %s ==\033[0m\n' "$1"; }

step "0. Wait for the coordinator to see both nodes healthy"
for _ in $(seq 1 60); do
  ok=$(curl -s "$C/status" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['healthy']['active'] and d['healthy']['spare'])" 2>/dev/null || echo False)
  [ "$ok" = "True" ] && break
  sleep 2
done

step "1. Steady state — both nodes hot and synchronized"
curl -s "$C/status" | jqf

step "2. A few leaderboard reads (note X-Served-By header)"
for _ in 1 2 3; do
  curl -s -D - "$C/api/v1/ranking/top?limit=5" -o /dev/null | grep -i -E "x-served-by|x-failover"
done

step "3. Record pre-failover leaderboard (served by ACTIVE)"
curl -s "$C/api/v1/ranking/top?limit=5" | jqf

step "4. >>> FAULT INJECTION: stop the active node <<<"
docker stop ranking-active

step "5. Watch the coordinator promote the spare"
for _ in $(seq 1 40); do
  primary=$(curl -s "$C/status" | python3 -c "import sys,json;print(json.load(sys.stdin)['primary'])" 2>/dev/null)
  echo "primary = $primary"
  [ "$primary" = "spare" ] && break
  sleep 0.25
done
curl -s "$C/status" | jqf

step "6. Reads continue — now served by SPARE, same data (zero loss)"
for _ in 1 2 3; do
  curl -s -D - "$C/api/v1/ranking/top?limit=5" -o /dev/null | grep -i -E "x-served-by"
done
curl -s "$C/api/v1/ranking/top?limit=5" | jqf

step "7. Recovery: restart the active node -> failback"
docker start ranking-active
for _ in $(seq 1 60); do
  primary=$(curl -s "$C/status" | python3 -c "import sys,json;print(json.load(sys.stdin)['primary'])" 2>/dev/null)
  [ "$primary" = "active" ] && break
  sleep 0.5
done
curl -s "$C/status" | jqf

step "Done."
