FROM node:22-slim

# Instalación de librerías base (Caché de Docker)
RUN apt-get update && apt-get install -y openssl netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Primero las dependencias (Caché pesado)
COPY package*.json ./
RUN npm install --quiet --no-audit --no-fund

# El código y prisma
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Script de arranque instantáneo
CMD /bin/sh -c "until nc -z catalog-db 5432; do sleep 1; done && \
    npx prisma db push --accept-data-loss && \
    npx prisma db seed && \
    node dist/main"
