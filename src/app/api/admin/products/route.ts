// ===== src/app/api/admin/products/route.ts =====
// [원인] JSON body로 제품 생성 시 parsed.data에서 imageUrl을 꺼내지 않아서 항상 null로 저장
// [수정] JSON 분기에서 imageUrl을 parsed.data에서 추출하여 DB에 저장

import { fail, success, unauthorized } from '@/lib/apiResponse'
import { getAuthFromCookie } from '@/lib/auth'
import { processAndSaveImage } from '@/lib/imageProcessor'
import { prisma } from '@/lib/prisma'
import { createProductJsonSchema } from '@/lib/schemas/admin'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const { searchParams } = new URL(request.url)
    const categoryIdRaw = searchParams.get('categoryId')

    const where: { adminId: number; categoryId?: number } = {
      adminId: auth.adminId,
    }

    if (categoryIdRaw) {
      const cid = parseInt(categoryIdRaw, 10)
      if (isNaN(cid)) return fail('잘못된 카테고리 ID')
      where.categoryId = cid
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return success(products)
  } catch (error) {
    console.error('GET products error:', error)
    return fail('제품 조회 실패', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const contentType = request.headers.get('content-type') || ''

    let categoryId: number
    let name: string
    let price: number
    let description: string | null = null
    let note: string | null = null
    let imageUrl: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      const jsonFields = {
        categoryId: Number(formData.get('categoryId')),
        name: String(formData.get('name') || ''),
        price: Number(formData.get('price') || 0),
        description: formData.get('description')
          ? String(formData.get('description'))
          : null,
        note: formData.get('note') ? String(formData.get('note')) : null,
      }

      const parsed = createProductJsonSchema.safeParse(jsonFields)
      if (!parsed.success) {
        return fail(parsed.error.issues[0].message)
      }

      categoryId = parsed.data.categoryId
      name = parsed.data.name
      price = parsed.data.price
      description = parsed.data.description ?? null
      note = parsed.data.note ?? null

      const imageFile = formData.get('image') as File | null
      if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 5 * 1024 * 1024) {
          return fail('이미지 크기는 5MB 이하만 가능합니다')
        }
        imageUrl = await processAndSaveImage(imageFile)
      }
    } else {
      const body = await request.json()
      const parsed = createProductJsonSchema.safeParse(body)
      if (!parsed.success) {
        return fail(parsed.error.issues[0].message)
      }

      categoryId = parsed.data.categoryId
      name = parsed.data.name
      price = parsed.data.price
      description = parsed.data.description ?? null
      note = parsed.data.note ?? null
      imageUrl = parsed.data.imageUrl ?? null  // ← 이 줄이 누락되어 있었음
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, adminId: auth.adminId },
    })
    if (!category) return fail('카테고리를 찾을 수 없습니다', 404)

    const maxSort = await prisma.product.findFirst({
      where: { categoryId, adminId: auth.adminId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    const product = await prisma.product.create({
      data: {
        categoryId,
        adminId: auth.adminId,
        name,
        price,
        description,
        note,
        imageUrl,
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      },
    })

    return success(product, 201)
  } catch (error) {
    console.error('POST product error:', error)
    return fail('제품 추가 실패', 500)
  }
}
