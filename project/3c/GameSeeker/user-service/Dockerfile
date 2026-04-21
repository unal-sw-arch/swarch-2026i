FROM node:22-alpine AS base

FROM base AS builder
RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*json tsconfig.json prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY src ./src

RUN npm run build && \
    cp -r src/generated dist/generated && \
    npm prune --production

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

COPY --from=builder /app/src/generated/prisma /app/dist/generated/prisma

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json


USER hono
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node /app/dist/src/app.js"]