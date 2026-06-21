#!/usr/bin/env bash
# =============================================================================
# Part A — Cluster Pattern demo / evidence capture (minikube)
#
# Brings up a local Kubernetes cluster, builds the gateway image straight into
# minikube's Docker daemon, deploys it with 2 replicas behind a Service, and
# then demonstrates the two required behaviours:
#
#   1. Self-healing — delete a Pod and watch Kubernetes recreate it.
#   2. Scaling      — change the replica count and watch the cluster adjust.
#
# Run:  bash k8s/demo.sh
# =============================================================================
set -euo pipefail

CLUSTER=swarch-cluster
IMAGE=gameseeker/gateway-service:lab6
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

step() { printf '\n\033[1;36m== %s ==\033[0m\n' "$1"; }

step "1. Start local cluster (minikube)"
minikube status -p "$CLUSTER" >/dev/null 2>&1 || minikube start -p "$CLUSTER"
kubectl config use-context "$CLUSTER"

step "2. Build the gateway image into minikube's Docker daemon"
# shellcheck disable=SC2046
eval "$(minikube -p "$CLUSTER" docker-env)"
docker build -t "$IMAGE" "$ROOT/gateway-service"
eval "$(minikube -p "$CLUSTER" docker-env -u)"

step "3. Apply the manifests"
kubectl apply -f "$ROOT/k8s/gateway-deployment.yaml"
kubectl apply -f "$ROOT/k8s/gateway-service.yaml"
kubectl rollout status deployment/gateway-service --timeout=120s

step "4. Verify the deployment (Pods + Service)"
kubectl get pods -l app=gateway-service -o wide
kubectl get svc gateway-service

step "5. Self-healing — delete one Pod, watch it come back"
VICTIM=$(kubectl get pods -l app=gateway-service -o jsonpath='{.items[0].metadata.name}')
echo "Deleting Pod: $VICTIM"
kubectl delete pod "$VICTIM"
echo "--- desired replica count is restored automatically ---"
sleep 4
kubectl get pods -l app=gateway-service

step "6. Scaling — scale up to 4, then back to 2"
kubectl scale deployment/gateway-service --replicas=4
kubectl rollout status deployment/gateway-service --timeout=120s
kubectl get pods -l app=gateway-service
kubectl scale deployment/gateway-service --replicas=2
kubectl get pods -l app=gateway-service

step "Done. Open the load-balanced Service with:"
echo "  minikube -p $CLUSTER service gateway-service --url"
echo "  # then: curl <url>/health  (note the changing \"instance\" Pod name)"
