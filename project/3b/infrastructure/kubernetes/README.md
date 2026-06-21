# Kubernetes Cluster Pattern - DELIUNAL

This folder contains the Kubernetes manifests required to demonstrate the
Cluster Pattern for the DELIUNAL project.

The selected component is `api-gateway` because it is stateless, exposes a
`/health` endpoint, and can be replicated safely. The Deployment starts with
2 replicas, is exposed through a Service, and can demonstrate self-healing and
manual scaling.

## Redundancy Pattern

Selected pattern: **Active Redundancy (Hot Spare)**.

The `api-gateway` runs with 2 active Pods at the same time. Both Pods use the
same container image, expose the same HTTP contract, and are selected by the
same Kubernetes Service. The Service balances traffic only across Pods that pass
the readiness probe, while the liveness probe lets Kubernetes restart unhealthy
instances.

This is active redundancy because the spare capacity is already running and
ready to serve requests. If one Pod is deleted or fails, the remaining Pod keeps
serving traffic while Kubernetes creates a replacement and restores the desired
replica count.

## Prerequisites

- Docker Desktop running.
- Kubernetes enabled in Docker Desktop.
- `kubectl` available in PowerShell.
- Current context pointing to Docker Desktop Kubernetes.

Check the context:

```powershell
kubectl config current-context
```

If needed, select Docker Desktop:

```powershell
kubectl config use-context docker-desktop
```

## 1. Build the Local Image

From the repository root:

```powershell
docker build -t deliunal-api-gateway:k8s ./services/api-gateway
```

The Deployment uses:

```yaml
image: deliunal-api-gateway:k8s
imagePullPolicy: IfNotPresent
```

This lets Docker Desktop Kubernetes use the locally built image.

## 2. Deploy to Kubernetes

Apply all manifests:

```powershell
kubectl apply -f infrastructure/kubernetes/
```

Wait for the Deployment:

```powershell
kubectl rollout status deployment/api-gateway -n deliunal
```

## 3. Verify Replicas and Service

Check the Deployment:

```powershell
kubectl get deployments -n deliunal
```

Expected result: `api-gateway` shows `2/2` ready replicas.

Check the Pods:

```powershell
kubectl get pods -n deliunal -l app=api-gateway
```

Expected result: 2 Pods in `Running` state.

Check the Service:

```powershell
kubectl get svc -n deliunal
```

The Service exposes the gateway through NodePort `30080`.

Confirm that the Service has multiple active endpoints:

```powershell
kubectl get endpoints api-gateway-service -n deliunal
```

Expected result: the endpoint list includes 2 Pod IPs for port `4000`.

Call the health endpoint:

```powershell
Invoke-WebRequest http://localhost:30080/health
```

Expected response includes:

```json
{
  "status": "ok"
}
```

## 4. Demonstrate Self-Healing

List the Pods:

```powershell
kubectl get pods -n deliunal -l app=api-gateway
```

Delete one Pod:

```powershell
kubectl delete pod <pod-name> -n deliunal
```

Watch Kubernetes recreate it automatically:

```powershell
kubectl get pods -n deliunal -l app=api-gateway -w
```

Expected result: Kubernetes creates a replacement Pod and the Deployment
returns to 2 ready replicas.

Confirm that the Service endpoints are restored:

```powershell
kubectl get endpoints api-gateway-service -n deliunal
```

Stop watching with `Ctrl+C`.

## 5. Demonstrate Scaling

Scale the gateway to 4 replicas:

```powershell
kubectl scale deployment api-gateway --replicas=4 -n deliunal
```

Verify the new replica count:

```powershell
kubectl get deployments -n deliunal
kubectl get pods -n deliunal -l app=api-gateway
```

Expected result: 4 Pods in `Running` state.

Optionally return to the required baseline:

```powershell
kubectl scale deployment api-gateway --replicas=2 -n deliunal
```

## 6. Cleanup

Remove the Kubernetes resources:

```powershell
kubectl delete -f infrastructure/kubernetes/
```

## Notes

- The gateway can reach backend services running on the host through
  `host.docker.internal`.
- To test proxied routes, run the backend stack separately with Docker Compose.
- The `/health` endpoint can be used to prove the gateway Deployment and
  Service are working even when the backend services are not running.
