// src/app/api/admin/settings/route.ts
// [변경사항] noticeText 처리/업서트 데이터 구성 보완
import { fail, success, unauthorized } from '@/lib/apiResponse'
import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateSettingsSchema } from '@/lib/schemas/admin'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    let setting = await prisma.adminSetting.findUnique({
      where: { adminId: auth.adminId },
    })

    if (!setting) {
      const admin = await prisma.admin.findUnique({
        where: { id: auth.adminId },
        select: { phone: true },
      })

      setting = await prisma.adminSetting.create({
        data: {
          adminId: auth.adminId,
          receivePhone: admin?.phone || '',
        },
      })
    }

    return success(setting)
  } catch (error) {
    console.error('GET settings error:', error)
    return fail('설정 조회 실패', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const body = await request.json()
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message)
    }

    const { receivePhone, orderUrl, noticeText } = parsed.data
    const cleaned = receivePhone.replace(/[^0-9-]/g, '')

    const resolvedNotice =
      noticeText !== undefined ? (noticeText.trim() === '' ? null : noticeText) : undefined

    const updateData: { receivePhone: string; orderUrl?: string; noticeText?: string | null } = {
      receivePhone: cleaned,
    }

    if (orderUrl !== undefined) {
      updateData.orderUrl = orderUrl
    }
    if (resolvedNotice !== undefined) {
      ;(updateData as any).noticeText = resolvedNotice
    }

    const updated = await prisma.adminSetting.upsert({
      where: { adminId: auth.adminId },
      update: updateData,
      create: {
        adminId: auth.adminId,
        receivePhone: cleaned,
        orderUrl: orderUrl || null,
        ...({ noticeText: resolvedNotice ?? null } as any),
      },
    })

    return success(updated)
  } catch (error) {
    console.error('PATCH settings error:', error)
    return fail('설정 저장 실패', 500)
  }
}
