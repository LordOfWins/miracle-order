// src/app/api/admin/categories/[id]/route.ts
import { fail, success, unauthorized } from '@/lib/apiResponse'
import { getAuthFromCookie } from '@/lib/auth'
import { deleteImageFile } from '@/lib/imageProcessor'
import { prisma } from '@/lib/prisma'
import { updateCategorySchema } from '@/lib/schemas/admin'
import { NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10)
  return isNaN(n) ? null : n
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const { id } = await params
    const categoryId = parseId(id)
    if (!categoryId) return fail('잘못된 카테고리 ID')

    const existing = await prisma.category.findFirst({
      where: { id: categoryId, adminId: auth.adminId },
    })
    if (!existing) return fail('카테고리를 찾을 수 없습니다', 404)

    const body = await request.json()
    const parsed = updateCategorySchema.safeParse(body)
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message)
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name: parsed.data.name },
    })

    return success(updated)
  } catch (error) {
    console.error('PATCH category error:', error)
    return fail('카테고리 수정 실패', 500)
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const { id } = await params
    const categoryId = parseId(id)
    if (!categoryId) return fail('잘못된 카테고리 ID')

    const existing = await prisma.category.findFirst({
      where: { id: categoryId, adminId: auth.adminId },
    })
    if (!existing) return fail('카테고리를 찾을 수 없습니다', 404)

    // 하위 제품의 이미지 파일을 먼저 삭제
    const products = await prisma.product.findMany({
      where: { categoryId, adminId: auth.adminId },
      select: { imageUrl: true },
    })

    // CASCADE로 DB 레코드는 알아서 지워지지만 파일은 수동 삭제 필요
    await Promise.all(
      products
        .filter((p) => p.imageUrl)
        .map((p) => deleteImageFile(p.imageUrl!))
    )

    await prisma.category.delete({ where: { id: categoryId } })

    return success(null)
  } catch (error) {
    console.error('DELETE category error:', error)
    return fail('카테고리 삭제 실패', 500)
  }
}
