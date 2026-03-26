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
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
	CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java","-jar","/app/app.jar"]
