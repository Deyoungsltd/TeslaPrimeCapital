# TeslaPrimeCapital — DevOps & Container Infrastructure Architecture (`Phase 2`)

---

## 1. Docker Containerization Strategy & Multi-Stage Builds

To guarantee absolute parity across local development, staging, and production environments, the application is containerized utilizing optimized multi-stage Docker builds. This strategy ensures zero build-time secrets are leaked into production container layers and keeps image sizes minimal (< 250 MB).

### 1.1 Production Multi-Stage Blueprint (`deploy/docker/Dockerfile.next` & `Dockerfile.node`)
```dockerfile
# Stage 1: Dependency Resolution & Pruning
FROM node:20.14.0-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat openssl
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

# Stage 3: Minimal Production Runner (Non-Root User Enforcement)
FROM node:20.14.0-alpine3.20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3   CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/healthz || exit 1

CMD ["node", "server.js"]
```

---

## 2. Environment Separation & Docker Compose Topologies

The repository maintains three synchronized `docker-compose` topologies (`deploy/docker-compose.*.yml`):
- **Development Topology (`docker-compose.dev.yml`):** Spawns local PostgreSQL 16 (`port 5432`), local Redis 7 (`port 6379`), local Mailhog (mock email catcher on `port 8025`), and runs Next.js in hot-reload mode (`npm run dev`).
- **Staging Topology (`docker-compose.staging.yml`):** Mirrors production multi-stage container builds (`deps -> builder -> runner`), isolated within a private Docker bridge subnet (`172.19.0.0/16`), utilizing staging API keys (`Stripe Test`, `Resend Test`).
- **Production Topology (`docker-compose.prod.yml`):** Orchestrates high-availability production replicas behind **PgBouncer** connection pooling (`port 6432`) and Coolify reverse proxy (`Traefik/Nginx`) with automated container health monitoring.

---

## 3. Continuous Integration & Continuous Deployment (CI/CD) Pipeline

GitHub Actions workflows (`.github/workflows/ci-audit.yml` and `cd-deploy.yml`) govern all code merges:
```
[ Developer Push / Pull Request to `arena/019f8047-teslaprimecapital` / `main` ]
                               │
                               ▼
1. [ CI Audit Job ] ────► (Type-Check `tsc --noEmit` -> Lint `eslint` -> Security `npm audit` -> Vitest Unit Suite)
                               │
                ┌──────────────┴──────────────┐
                │ If ANY Step Fails           │ If 100% Passes
                ▼                             ▼
   [ Block PR & Alert Team ]     2. [ CD Trigger Job ] ────► (Coolify Git Webhook Trigger)
```
