FROM node:22-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --quiet --no-audit --no-fund

FROM node:22-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app ./

EXPOSE 3001

CMD ["npm", "run", "start", "--", "-p", "3001"]
