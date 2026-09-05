# =============================================================================
# Cole Core API — Production Dockerfile (Multi-stage)
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy all repository files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY packages/ packages/
COPY services/ services/
COPY apps/ apps/

# Install all dependencies and build packages
RUN pnpm install --frozen-lockfile

ENV DATABASE_URL="postgresql://user:pass@localhost:5432/placeholder"
RUN pnpm --filter @cole/domain-types build
RUN pnpm --filter @cole/logger build
RUN pnpm --filter @cole/database build
RUN pnpm --filter @cole/core-api build

# Stage 2: Production
FROM node:20-alpine AS production

# Security: Run as non-root
RUN addgroup -g 1001 -S cole && \
    adduser -S cole -u 1001 -G cole

WORKDIR /app

# Copy package manifests and node_modules from builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/domain-types/package.json ./packages/domain-types/package.json
COPY --from=builder /app/packages/domain-types/dist ./packages/domain-types/dist
COPY --from=builder /app/packages/logger/package.json ./packages/logger/package.json
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist
COPY --from=builder /app/services/core-api/package.json ./services/core-api/package.json
COPY --from=builder /app/services/core-api/dist ./services/core-api/dist

# Security: Non-root user
USER cole

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

EXPOSE 4000

CMD ["node", "services/core-api/dist/main.js"]
