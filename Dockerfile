# ============================================================
# miracle-order Dockerfile
# Multi-stage | Standalone | Alpine | Node 22
# ============================================================

# ─── 1) DEPS ───
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ─── 2) BUILD ───
FROM node:22-alpine AS builder
WORKDIR /app

# 빌드 시 필요한 환경변수
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client 생성
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npx prisma generate

# Next.js standalone 빌드
RUN npm run build

# ─── 3) RUNNER ───
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# standalone 출력 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 업로드 디렉토리 (temp 이미지용)
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads && chmod 755 public/uploads

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
