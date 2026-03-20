// ===== src/app/api/admin/products/[id]/route.ts =====
// [원인] JSON body PATCH 시 parsed.data에서 imageUrl을 꺼내지 않아서 이미지 URL이 DB에 업데이트 안됨
// [수정] imageUrl을 parsed.data에서 추출하여 updateData에 반영

import { fail, success, unauthorized } from '@/lib/apiResponse'
import { getAuthFromCookie } from '@/lib/auth'
import { deleteImageFile, processAndSaveImage } from '@/lib/imageProcessor'
import { prisma } from '@/lib/prisma'
import { updateProductJsonSchema } from '@/lib/schemas/admin'
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
    const productId = parseId(id)
    if (!productId) return fail('잘못된 제품 ID')

    const existing = await prisma.product.findFirst({
      where: { id: productId, adminId: auth.adminId },
    })
    if (!existing) return fail('제품을 찾을 수 없습니다', 404)

    const contentType = request.headers.get('content-type') || ''

    let parsedFields: Record<string, unknown>
    let newImageFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      parsedFields = {}

      const nameVal = formData.get('name')
      if (nameVal) parsedFields.name = String(nameVal)

      const priceVal = formData.get('price')
      if (priceVal !== null && priceVal !== '') parsedFields.price = Number(priceVal)

      const categoryIdVal = formData.get('categoryId')
      if (categoryIdVal !== null && categoryIdVal !== '')
        parsedFields.categoryId = Number(categoryIdVal)

      const descVal = formData.get('description')
      if (descVal !== undefined && descVal !== null)
        parsedFields.description = descVal === '' ? null : String(descVal)

      const noteVal = formData.get('note')
      if (noteVal !== undefined && noteVal !== null)
        parsedFields.note = noteVal === '' ? null : String(noteVal)

      const removeImageVal = formData.get('removeImage')
      if (removeImageVal === 'true') parsedFields.removeImage = true

      const imageFile = formData.get('image') as File | null
      if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 5 * 1024 * 1024) {
          return fail('이미지 크기는 5MB 이하만 가능합니다')
        }
        newImageFile = imageFile
      }
    } else {
      parsedFields = await request.json()
    }

    const parsed = updateProductJsonSchema.safeParse(parsedFields)
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message)
    }

    const { categoryId, name, price, description, note, imageUrl, removeImage } = parsed.data

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = price
    if (description !== undefined) updateData.description = description
    if (note !== undefined) updateData.note = note

    if (categoryId !== undefined) {
      const cat = await prisma.category.findFirst({
        where: { id: categoryId, adminId: auth.adminId },
      })
      if (!cat) return fail('카테고리를 찾을 수 없습니다', 404)
      updateData.categoryId = categoryId
    }

    // 이미지 처리 우선순위: multipart 파일 > JSON imageUrl > removeImage
    if (newImageFile) {
      if (existing.imageUrl) {
        await deleteImageFile(existing.imageUrl)
      }
      updateData.imageUrl = await processAndSaveImage(newImageFile)
    } else if (removeImage) {
      if (existing.imageUrl) {
        await deleteImageFile(existing.imageUrl)
      }
      updateData.imageUrl = null
    } else if (imageUrl !== undefined) {
      // JSON body에서 imageUrl이 명시적으로 전달된 경우 (null 포함)
      if (imageUrl === null && existing.imageUrl) {
        await deleteImageFile(existing.imageUrl)
      }
      updateData.imageUrl = imageUrl
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    })

    return success(updated)
  } catch (error) {
    console.error('PATCH product error:', error)
    return fail('제품 수정 실패', 500)
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const { id } = await params
    const productId = parseId(id)
    if (!productId) return fail('잘못된 제품 ID')

    const existing = await prisma.product.findFirst({
      where: { id: productId, adminId: auth.adminId },
    })
    if (!existing) return fail('제품을 찾을 수 없습니다', 404)

    if (existing.imageUrl) {
      await deleteImageFile(existing.imageUrl)
    }

    await prisma.product.delete({ where: { id: productId } })

    return success(null)
  } catch (error) {
    console.error('DELETE product error:', error)
    return fail('제품 삭제 실패', 500)
  }
}

