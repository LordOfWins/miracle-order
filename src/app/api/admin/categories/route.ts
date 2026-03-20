// src/app/api/admin/categories/route.ts
import { fail, success, unauthorized } from '@/lib/apiResponse'
import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCategorySchema } from '@/lib/schemas/admin'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const categories = await prisma.category.findMany({
      where: { adminId: auth.adminId },
      orderBy: { sortOrder: 'asc' },
    })

    return success(categories)
  } catch (error) {
    console.error('GET categories error:', error)
    return fail('카테고리 조회 실패', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const body = await request.json()
    const parsed = createCategorySchema.safeParse(body)
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message)
    }

    const { name } = parsed.data

    const maxSort = await prisma.category.findFirst({
      where: { adminId: auth.adminId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    const category = await prisma.category.create({
      data: {
        adminId: auth.adminId,
        name,
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      },
    })

    return success(category, 201)
  } catch (error) {
    console.error('POST category error:', error)
    return fail('카테고리 추가 실패', 500)
  }
}
