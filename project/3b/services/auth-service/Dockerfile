FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PostgreSQL and netcat for health checks
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Environment variables (Defaults)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8000

EXPOSE 8000

# Script robusto: Espera a que el puerto de la DB esté abierto antes de iniciar Uvicorn
CMD /bin/sh -c "until nc -z auth-db 5432; do echo 'Auth DB no lista, esperando...'; sleep 2; done && uvicorn main:app --host 0.0.0.0 --port 8000"
