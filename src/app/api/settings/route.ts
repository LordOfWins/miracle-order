import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminIdRaw = searchParams.get('adminId')
    const adminId = Number(adminIdRaw || 1)

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return NextResponse.json(
        { success: false, error: 'adminId가 올바르지 않습니다' },
        { status: 400 }
      )
    }

    const setting = await prisma.adminSetting.findUnique({
      where: { adminId },
      select: { noticeText: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        noticeText: setting?.noticeText ?? null,
      },
    })
  } catch (error) {
    console.error('GET public settings error:', error)
    return NextResponse.json(
      { success: false, error: '설정 조회 실패' },
      { status: 500 }
    )
  }
}

