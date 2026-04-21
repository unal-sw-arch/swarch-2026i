# =============================================================================
# Stage 1 — Builder
# Uses the official Go alpine image to compile the binary.
# =============================================================================
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Download and tidy dependencies (generates go.sum in-container).
COPY go.mod ./
RUN go mod tidy || true

# Copy source and do a full tidy + build.
COPY . .
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o kitchen-service .

# =============================================================================
# Stage 2 — Runner
# Final image: slim Alpine with only the compiled binary.
# =============================================================================
FROM alpine:3.19

# ca-certificates needed for any HTTPS calls; tzdata for consistent timestamps.
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/kitchen-service .

EXPOSE 8082

ENTRYPOINT ["./kitchen-service"]
