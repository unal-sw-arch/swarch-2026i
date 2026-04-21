# ================================================================
# Stage 1 — Build
# ================================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copia solo el pom.xml primero para resolver dependencias en capa separada.
# Si el código cambia pero pom.xml no, esta capa se reutiliza del cache.
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copia el código fuente y compila
COPY src ./src
RUN mvn package -DskipTests -q

# ================================================================
# Stage 2 — Runtime
# ================================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

# Copia solo el JAR generado — sin Maven, sin fuentes, sin dependencias de build
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "-c", "until nc -z order-db 5432; do echo 'Order DB not ready, waiting...'; sleep 2; done && java -jar app.jar"]
