// src/app/api/categories/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminIdParam = searchParams.get('adminId')

    if (!adminIdParam) {
      return NextResponse.json(
        { success: false, error: 'adminId가 필요합니다' },
        { status: 400 }
      )
    }

    const adminId = parseInt(adminIdParam, 10)

    if (Number.isNaN(adminId) || adminId <= 0) {
      return NextResponse.json(
        { success: false, error: 'adminId가 올바르지 않습니다' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: '관리자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const categories = await prisma.category.findMany({
      where: { adminId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, sortOrder: true },  // adminId 제외
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('GET public categories error:', error)
    return NextResponse.json(
      { success: false, error: '카테고리 조회 실패' },
      { status: 500 }
    )
  }
}
