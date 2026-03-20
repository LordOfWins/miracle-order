// src/app/api/order/route.ts
import { generateDownloadToken } from '@/lib/downloadToken'
import { prisma } from '@/lib/prisma'
import { orderSchema } from '@/lib/schemas/order'
import { buildAdminSmsText, buildWriterSmsText } from '@/lib/smsBuilder'
import { sendAdminSms, sendWriterSms } from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstIssue?.message || '입력값이 올바르지 않습니다' },
        { status: 400 }
      )
    }

    const {
      adminId,
      productIds,
      requestNote,
      centerName,
      writerPhone,
      recipientName,
      gender,
      copayType,
      contactPhone1,
      contactPhone2,
      roadAddress,
      detailAddress,
      zipCode,
      tempImageIds,
    } = parsed.data

    // ─── 1) 관리자 + 설정 조회 ───
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { setting: true },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: '관리자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (!admin.setting?.receivePhone) {
      return NextResponse.json(
        { success: false, error: '관리자 수신번호가 설정되지 않았습니다' },
        { status: 400 }
      )
    }

    // ─── 2) 제품 조회 ───
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        adminId,
      },
      orderBy: { sortOrder: 'asc' },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: '선택한 제품 정보가 올바르지 않습니다' },
        { status: 400 }
      )
    }

    // ─── 3) 임시 이미지 유효성 검증 ───
    const validTempImages = tempImageIds.length
      ? await prisma.tempImage.findMany({
        where: {
          id: { in: tempImageIds },
          expiresAt: { gt: new Date() },
        },
      })
      : []

    if (validTempImages.length !== tempImageIds.length) {
      return NextResponse.json(
        { success: false, error: '첨부 이미지 중 만료되었거나 유효하지 않은 항목이 있습니다' },
        { status: 400 }
      )
    }

    // ─── 4) 다운로드 링크 생성 ───

    const downloadLinks = validTempImages.map((img) => {
      const expiresAt = img.expiresAt.getTime()
      const token = generateDownloadToken(img.id, expiresAt)
      return `${BASE_URL}/api/download/${img.id}?expires=${expiresAt}&token=${token}`
    })
    // ─── 5) SMS 본문 생성 ───
    const adminSmsText = buildAdminSmsText({
      centerName,
      writerPhone,
      recipientName,
      gender,
      copayType,
      contactPhone1,
      contactPhone2,
      roadAddress,
      detailAddress,
      zipCode,
      productNames: products.map((p) => p.name),
      requestNote,
      downloadLinks,
    })

    const writerSmsText = buildWriterSmsText({
      recipientName,
      productNames: products.map((p) => p.name),
      requestNote,
    })

    // ─── 6) 주문 DB 저장 ───
    const createdOrder = await prisma.order.create({
      data: {
        adminId,
        requestNote,
        centerName,
        writerPhone,
        recipientName,
        gender,
        ...({ copayType: copayType || null } as any),
        contactPhone1: contactPhone1 || null,
        contactPhone2: contactPhone2 || null,
        roadAddress: roadAddress || null,
        detailAddress: detailAddress || null,
        zipCode: zipCode || null,
        tempImageIds: tempImageIds.length > 0 ? JSON.stringify(tempImageIds) : null,
        smsStatus: 'PENDING',
        smsMessage: null,
        orderItems: {
          create: products.map((product) => ({
            productId: product.id,
            categoryId: product.categoryId,
            productName: product.name,
            price: product.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    })

    // ─── 7) SMS 발송 (부분 실패 허용) ───
    let adminSmsResult: { success: boolean; error?: string; messageCount?: number }
    let writerSmsResult: { success: boolean; error?: string }

    try {
      adminSmsResult = await sendAdminSms({
        to: admin.setting.receivePhone,
        subject: '미라클복지용구 주문접수',
        text: adminSmsText,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('Admin SMS send failed:', errorMsg)
      adminSmsResult = { success: false, error: errorMsg }
    }

    try {
      writerSmsResult = await sendWriterSms({
        to: writerPhone,
        text: writerSmsText,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('Writer SMS send failed:', errorMsg)
      writerSmsResult = { success: false, error: errorMsg }
    }

    // ─── 8) SMS 상태 업데이트 ───
    const bothSuccess = adminSmsResult.success && writerSmsResult.success
    const bothFailed = !adminSmsResult.success && !writerSmsResult.success

    let smsStatus: string
    const smsMessages: string[] = []

    if (bothSuccess) {
      smsStatus = 'SENT'
      smsMessages.push('관리자/작성자 발송 완료')
    } else if (bothFailed) {
      smsStatus = 'FAILED'
      if (adminSmsResult.error) smsMessages.push(`관리자: ${adminSmsResult.error}`)
      if (writerSmsResult.error) smsMessages.push(`작성자: ${writerSmsResult.error}`)
    } else {
      smsStatus = 'PARTIAL'
      if (!adminSmsResult.success) {
        smsMessages.push(`관리자 발송 실패: ${adminSmsResult.error}`)
      }
      if (!writerSmsResult.success) {
        smsMessages.push(`작성자 발송 실패: ${writerSmsResult.error}`)
      }
      if (adminSmsResult.success) smsMessages.push('관리자 발송 성공')
      if (writerSmsResult.success) smsMessages.push('작성자 발송 성공')
    }

    await prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        smsStatus,
        smsMessage: smsMessages.join(' | '),
      },
    })

    // ─── 9) 응답 ───
    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: createdOrder.id,
          smsStatus,
          adminSms: {
            success: adminSmsResult.success,
            messageCount: adminSmsResult.messageCount,
            error: adminSmsResult.error,
          },
          writerSms: {
            success: writerSmsResult.success,
            error: writerSmsResult.error,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST order error:', error)
    return NextResponse.json(
      { success: false, error: '주문 접수 실패' },
      { status: 500 }
    )
  }
}
