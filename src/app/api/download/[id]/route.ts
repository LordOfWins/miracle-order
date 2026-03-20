// src/app/api/download/[id]/route.ts
import { fail } from '@/lib/apiResponse'
import { prisma } from '@/lib/prisma'
import { createHmac, timingSafeEqual } from 'crypto'
import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

const DOWNLOAD_SECRET =
  process.env.DOWNLOAD_SECRET || process.env.JWT_SECRET || ''

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch {
    return false
  }
}

function verifyDownloadToken(
  imageId: string,
  expiresAt: number,
  token: string
): boolean {
  if (Date.now() > expiresAt) return false
  const data = `${imageId}:${expiresAt}`
  const expected = createHmac('sha256', DOWNLOAD_SECRET)
    .update(data)
    .digest('hex')
  return safeCompare(expected, token)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const expires = Number(searchParams.get('expires'))
    const token = searchParams.get('token') || ''

    if (!id || typeof id !== 'string') {
      return fail('유효하지 않은 요청입니다', 400)
    }

    if (!expires || !token || !verifyDownloadToken(id, expires, token)) {
      return fail('유효하지 않은 다운로드 링크입니다', 403)
    }

    const tempImage = await prisma.tempImage.findUnique({
      where: { id },
    })

    if (!tempImage) {
      return fail('파일을 찾을 수 없습니다', 404)
    }

    // 만료 확인
    if (new Date() > tempImage.expiresAt) {
      return fail('파일이 만료되었습니다 (24시간 경과)', 410)
    }

    // 디스크에서 파일 읽기
    const diskPath = join(process.cwd(), 'public', tempImage.filePath)
    let fileBuffer: Buffer

    try {
      fileBuffer = await readFile(diskPath)
    } catch {
      return fail('파일을 읽을 수 없습니다', 404)
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': tempImage.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(tempImage.fileName)}"`,
        'Content-Length': String(fileBuffer.byteLength),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('GET download error:', error)
    return fail('파일 다운로드 실패', 500)
  }
}
