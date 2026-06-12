# Edge — Secure Channel (TLS) + Network Segmentation

Este directorio contiene el **terminador TLS** (nginx) que implementa el
**Secure Channel Pattern** delante del API Gateway, y participa en la
**segmentación de red** definida en `docker-compose.yml`.

## 1. Generar el certificado (una sola vez)

```powershell
./infrastructure/edge/generate-cert.ps1
```

Esto crea `infrastructure/edge/certs/deliunal.crt` y `deliunal.key`
(certificado autofirmado para `localhost`, válido 1 año). La carpeta `certs/`
está en `.gitignore` — **no se versiona**.

> Si no tienes OpenSSL en el PATH, está incluido con Git para Windows en
> `C:\Program Files\Git\usr\bin\openssl.exe`.

## 2. Levantar el stack

```powershell
docker compose up -d
```

## 3. Probar el canal seguro

```powershell
# HTTPS (certificado autofirmado -> usar -k para aceptarlo)
curl.exe -k https://localhost/health

# HTTP redirige a HTTPS (301)
curl.exe -I http://localhost/health
```

## Segmentación de red

`docker-compose.yml` define tres redes aisladas:

| Red          | Miembros                                                        | Expuesta al host |
|--------------|----------------------------------------------------------------|------------------|
| `edge-net`   | nginx-tls, customer-app, restaurant-dashboard, api-gateway     | Sí (443/80, 3001, 5173) |
| `backend-net`| api-gateway + todos los microservicios + broker + cache        | No               |
| `data-net`   | cada microservicio + su base de datos                          | No               |

**Demostración del aislamiento:** las bases de datos y los servicios internos
ya **no publican puertos** al host. Un intento de conexión directa
(p.ej. `psql -h localhost -p 5433`) es rechazado; solo el borde TLS, los
frontends y el gateway son alcanzables desde fuera.
