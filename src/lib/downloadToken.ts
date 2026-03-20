// src/lib/downloadToken.ts (신규 파일)
import { createHmac } from 'crypto'

const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET || process.env.JWT_SECRET || ''

export function generateDownloadToken(imageId: string, expiresAt: number): string {
  const data = `${imageId}:${expiresAt}`
  return createHmac('sha256', DOWNLOAD_SECRET).update(data).digest('hex')
}

export function verifyDownloadToken(
  imageId: string,
  expiresAt: number,
  token: string
): boolean {
  if (Date.now() > expiresAt) return false
  const expected = generateDownloadToken(imageId, expiresAt)
  return token === expected
}
