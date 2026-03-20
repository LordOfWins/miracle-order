// src/app/api/admin/categories/reorder/route.ts
// [변경사항] apiResponse + reorderSchema import 누락 수정
import { fail, success, unauthorized } from '@/lib/apiResponse'
import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reorderSchema } from '@/lib/schemas/admin'
import { NextRequest } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message)
    }

    const { items } = parsed.data

    await prisma.$transaction(
      items.map((item) =>
        prisma.category.updateMany({
          where: { id: item.id, adminId: auth.adminId },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return success(null)
  } catch (error) {
    console.error('Reorder categories error:', error)
    return fail('순서 변경 실패', 500)
  }
}
