# =============================================================================
# Cole Core API — Production Dockerfile (Multi-stage)
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/database/package.json packages/database/
COPY packages/domain-types/package.json packages/domain-types/
COPY packages/logger/package.json packages/logger/
COPY packages/ui-components/package.json packages/ui-components/
COPY services/core-api/package.json services/core-api/

# Install dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/database/ packages/database/
COPY packages/domain-types/ packages/domain-types/
COPY packages/logger/ packages/logger/
COPY packages/ui-components/ packages/ui-components/
COPY services/core-api/ services/core-api/

# Generate Prisma client and build packages
RUN cd packages/domain-types && pnpm build
RUN cd packages/logger && pnpm build
RUN cd packages/database && pnpm build
RUN cd services/core-api && pnpm build

# Stage 2: Production
FROM node:20-alpine AS production

# Security: Run as non-root
RUN addgroup -g 1001 -S cole && \
    adduser -S cole -u 1001 -G cole

WORKDIR /app

# Install pnpm for workspace resolution
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json packages/database/
COPY packages/domain-types/package.json packages/domain-types/
COPY packages/logger/package.json packages/logger/
COPY services/core-api/package.json services/core-api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=builder /app/packages/database/node_modules/@prisma ./packages/database/node_modules/@prisma
COPY --from=builder /app/packages/domain-types/dist ./packages/domain-types/dist
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist
COPY --from=builder /app/services/core-api/dist ./services/core-api/dist

# Generate Prisma client for production
RUN cd packages/database && pnpm prisma generate

# Security: Non-root user
USER cole

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

EXPOSE 4000

CMD ["node", "services/core-api/dist/main.js"]
