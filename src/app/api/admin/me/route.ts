// src/app/api/admin/me/route.ts

import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { id: auth.adminId },
      select: { id: true, loginId: true, name: true },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: '관리자를 찾을 수 없습니다' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, data: admin })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { success: false, error: '인증 확인 실패' },
      { status: 500 }
    )
  }
}
