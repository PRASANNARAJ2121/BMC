# BHARAT MOTOR CLUB — MULTI-STAGE PRODUCTION DOCKERFILE
# Node 22 Alpine Base with Next.js Standalone Runner

# ----------------------------------------------------
# 1. Base Image
# ----------------------------------------------------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ----------------------------------------------------
# 2. Dependencies
# ----------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ----------------------------------------------------
# 3. Builder
# ----------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ----------------------------------------------------
# 4. Production Runner
# ----------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create storage directory for uploaded private files & public assets
RUN mkdir -p /app/storage/private /app/storage/public
RUN chown -R nextjs:nodejs /app/storage

# Copy public assets & standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

USER nextjs

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]

