# syntax=docker/dockerfile:1
# Multi-stage build producing a minimal Next.js standalone image.

FROM node:22-bookworm-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---- deps: install all dependencies (dev deps are needed to build) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- builder: generate types + compile the standalone output ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined at build time. The placeholder PAYLOAD_SECRET /
# DATABASE_URL only satisfy payload.config's fail-fast check — the database is
# never contacted during the build (generateStaticParams falls back to []).
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    PAYLOAD_SECRET=build-placeholder \
    DATABASE_URL=postgres://placeholder:placeholder@localhost:5432/placeholder
# payload-types.ts is gitignored; regenerate it from the config (no DB needed).
RUN pnpm run generate:types
RUN pnpm build

# ---- runner: minimal production image ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Uploads directory (Payload Media staticDir) — backed by a named volume.
RUN mkdir -p /app/media && chown -R nextjs:nodejs /app/media
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
