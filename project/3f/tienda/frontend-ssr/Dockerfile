FROM node:18-alpine

WORKDIR /app

# Desactivar telemetría y checks externos
ENV NEXT_TELEMETRY_DISABLED 1

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3001
CMD ["npx", "next", "dev", "-p", "3001", "-H", "0.0.0.0"]