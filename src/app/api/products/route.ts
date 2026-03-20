// src/app/api/products/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryIdParam = searchParams.get('categoryId')

    if (!categoryIdParam) {
      return NextResponse.json(
        { success: false, error: 'categoryId가 필요합니다' },
        { status: 400 }
      )
    }

    const categoryId = parseInt(categoryIdParam, 10)

    if (Number.isNaN(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { success: false, error: 'categoryId가 올바르지 않습니다' },
        { status: 400 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const products = await prisma.product.findMany({
      where: { categoryId },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('GET public products error:', error)
    return NextResponse.json(
      { success: false, error: '제품 조회 실패' },
      { status: 500 }
    )
  }
}
