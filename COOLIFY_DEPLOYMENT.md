# TeslaPrimeCapital — Coolify Deployment & Docker Containerization Specification

---

## 1. Containerization Strategy & Multi-Stage Build Architecture

To guarantee absolute deployment reproducibility and minimal attack surface across self-hosted **Coolify** cloud environments, the application utilizes optimized, multi-stage **Docker builds**.

### 1.1 Multi-Stage Dockerfile Blueprint (Next.js & Node.js API)
```dockerfile
# Stage 1: Dependencies & Pruning
FROM node:20.14.0-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate

# Stage 2: Application Build Stage
FROM node:20.14.0-alpine3.20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Minimal Production Runner (Zero Build-Time Secrets Exposing)
FROM node:20.14.0-alpine3.20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## 2. Coolify Environment Orchestration & Zero-Downtime Rolling Deployments

**Coolify** manages the application cluster using automated Git push hooks tied to branch `arena/019f8047-teslaprimecapital` (for testing) and `main` (for production go-live):

### 2.1 Zero-Downtime Deployment Workflow
1. **Webhook Ingestion:** Coolify receives a GitHub commit event and spawns an isolated build container.
2. **Database Schema Verification:** During deployment, Coolify executes `npx prisma migrate deploy` using the direct master connection string (`DIRECT_URL`) to apply pending migrations without locking tables or dropping existing columns.
3. **Rolling Container Health Check:** Coolify spins up a new container replica alongside the currently running old container. It pings the liveness endpoint (`GET /api/v1/healthz`) every 5 seconds for up to 60 seconds.
4. **Proxy Cutover & Old Container Teardown:** Only after the new container returns `200 OK` does Coolify's built-in reverse proxy (`Traefik/Nginx`) gracefully cut over live incoming HTTP traffic to the new replica, subsequently sending a `SIGTERM` signal to gracefully drain and shut down the old container.

---

## 3. Environment Variable Security & Secret Vault

All configuration keys and API secrets **must** be stored inside Coolify's encrypted project environment console. Hardcoding credentials in source code or committing `.env` files directly into Git is explicitly prohibited by the Development Constitution.

### 3.1 Required Production Secrets Checklist
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://user:password@pgbouncer:6432/teslaprime?pgbouncer=true`
- `DIRECT_URL=postgresql://user:password@postgres-master:5432/teslaprime`
- `REDIS_URL=redis://redis-cluster:6379/0`
- `JWT_ACCESS_SECRET=crypto_secure_random_64_char_hex`
- `JWT_REFRESH_SECRET=crypto_secure_random_64_char_hex`
- `SESSION_MASTER_KEY=aes_256_gcm_master_encryption_key`
- `CLOUDINARY_CLOUD_NAME=teslaprime`
- `CLOUDINARY_API_KEY=********`
- `CLOUDINARY_API_SECRET=********`
- `RESEND_API_KEY=re_********`
