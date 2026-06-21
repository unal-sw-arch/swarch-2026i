# k8s — Manifests del Cluster Pattern (Lab 6)

Manifiestos de Kubernetes para desplegar el `auth-service` en clúster (Minikube).

| Archivo | Contenido |
|---|---|
| `auth-deployment.yaml` | Deployment del `auth-service` con **2 réplicas** |
| `auth-service.yaml` | Service tipo **NodePort** expuesto en `:30801` |
| `auth-postgres.yaml` | PostgreSQL 16 + Redis 7 internos del clúster |

## Uso rápido

```bash
# desde la raíz del repo, con Minikube activo
kubectl apply -f k8s/auth-postgres.yaml
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl get pods
```

📚 **Documentación completa del Lab 6** (vista arquitectónica, guía Minikube paso a paso, pruebas de resiliencia y escalado): [docs/lab6/README.md](../docs/lab6/README.md)
