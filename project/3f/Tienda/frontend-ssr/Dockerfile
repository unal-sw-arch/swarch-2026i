FROM node:18-alpine
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_API_URL=http://localhost:3000   
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL     

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3001
CMD ["npx", "next", "dev", "-p", "3001", "-H", "0.0.0.0"]