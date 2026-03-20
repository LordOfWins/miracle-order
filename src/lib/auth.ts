// src/lib/auth.ts
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET_RAW = process.env.JWT_SECRET
if (!JWT_SECRET_RAW) {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다')
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW)

const COOKIE_NAME = 'miracle_token'
const EXPIRATION = '24h'

export interface JwtPayload {
  adminId: number
  loginId: string
  iat?: number
  exp?: number
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pw, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const hashBuffer = Buffer.from(hash, 'hex')
  const pwBuffer = scryptSync(pw, salt, 64)
  return timingSafeEqual(hashBuffer, pwBuffer)
}

export async function signToken(payload: {
  adminId: number
  loginId: string
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

export async function getAuthFromCookie(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export { COOKIE_NAME }
