// src/app/api/cron/cleanup/route.ts

import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 인증 (CRON_SECRET 환경변수 설정 시)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      return NextResponse.json(
        { success: false, error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    // 만료된 temp_image 레코드 조회
    const expiredImages = await prisma.tempImage.findMany({
      where: {
        expiresAt: { lt: now },
      },
    })

    if (expiredImages.length === 0) {
      return NextResponse.json({
        success: true,
        message: '삭제할 만료 파일 없음',
        deletedCount: 0,
      })
    }

    let deletedFiles = 0
    let deletedRecords = 0
    const errors: string[] = []

    // 파일 시스템에서 삭제
    for (const img of expiredImages) {
      try {
        const diskPath = join(process.cwd(), 'public', img.filePath)
        await unlink(diskPath)
        deletedFiles++
      } catch (err) {
        // 파일이 이미 없어도 DB 레코드는 삭제해야 함
        const errMsg = err instanceof Error ? err.message : String(err)
        errors.push(`파일 삭제 실패 (${img.fileName}): ${errMsg}`)
      }
    }

    // DB 레코드 일괄 삭제
    const deleteResult = await prisma.tempImage.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    })
    deletedRecords = deleteResult.count

    console.log(`[Cron Cleanup] 파일 ${deletedFiles}개 삭제 / DB ${deletedRecords}건 삭제`)

    return NextResponse.json({
      success: true,
      deletedFiles,
      deletedRecords,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json(
      { success: false, error: '정리 작업 실패' },
      { status: 500 }
    )
  }
}
