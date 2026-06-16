# Build stage (Java 21 LTS)
FROM gradle:8.14.0-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle clean bootJar

# Run stage (Java 21 LTS)
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/build/libs/*.jar app.jar

# --- Secure Channel (TLS) -------------------------------------------------
# Generate a self-signed PKCS12 keystore at build time so the gateway serves
# HTTPS out of the box (keytool ships with the JRE). The keystore is created
# under /app/certs and protected with the well-known dev password "changeit"
# (a throwaway value for a throwaway self-signed cert — NOT a real secret, so
# it is passed inline and never persisted as an ARG/ENV). At runtime the
# password is supplied via the SSL_KEYSTORE_PASSWORD environment variable
# (docker-compose / .env), which must match the build password.
#
# For production, mount a CA-issued keystore (e.g. Let's Encrypt) and override
# SSL_KEYSTORE / SSL_KEYSTORE_PASSWORD / SSL_KEY_ALIAS — the baked-in cert is
# then ignored.
ENV SSL_KEYSTORE=file:/app/certs/keystore.p12
COPY scripts/generate-keystore.sh /usr/local/bin/generate-keystore.sh
RUN chmod +x /usr/local/bin/generate-keystore.sh \
    && SSL_KEYSTORE=/app/certs/keystore.p12 \
       SSL_KEYSTORE_PASSWORD=changeit \
       SSL_KEY_ALIAS=apigateway \
       CERT_CN=localhost \
       CERT_SAN="dns:localhost,dns:apigateway,ip:127.0.0.1" \
       CERT_VALIDITY_DAYS=825 \
       /usr/local/bin/generate-keystore.sh

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
	CMD wget --no-check-certificate -qO- https://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java","-jar","/app/app.jar"]
