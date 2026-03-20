// src/lib/prisma.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createAdapter() {
  const url = process.env.DATABASE_URL
  if (url) {
    try {
      const parsed = new URL(url)
      return new PrismaMariaDb({
        host: parsed.hostname,
        port: parseInt(parsed.port || '3306', 10),
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace('/', ''),
        connectionLimit: 5,
      })
    } catch (e) {
      console.warn('DATABASE_URL 파싱 실패 - 개별 환경변수 사용:', e)
    }
  }

  return new PrismaMariaDb({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'miracle',
    password: process.env.DB_PASSWORD || 'miracle1234',
    database: process.env.DB_NAME || 'miracle_order',
    connectionLimit: 5,
  })
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
