// ===== src/app/api/admin/qr/route.ts =====
// [원인 1] toBuffer()는 node-canvas 필요 → alpine 에러
// [원인 2] qrDataUrl(base64 PNG ~40KB)을 qr_code_url VarChar(500)에 넣어서 P2000 에러
// [수정] toDataURL로 PNG 생성 + DB에는 base64 저장하지 않고 orderUrl만 저장

import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function GET() {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const orderUrl = `${BASE_URL}/?a=${auth.adminId}`

    // toDataURL은 canvas 없이 순수 JS PNG 인코더로 동작
    const dataUrl = await QRCode.toDataURL(orderUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })

    // base64 → Buffer 변환
    const base64Data = dataUrl.split(',')[1]
    const pngBuffer = Buffer.from(base64Data, 'base64')

    // DB에는 orderUrl만 저장 (qrCodeUrl에 base64 넣으면 VarChar(500) 초과)
    await prisma.adminSetting.upsert({
      where: { adminId: auth.adminId },
      update: {
        orderUrl,
      },
      create: {
        adminId: auth.adminId,
        receivePhone: '',
        orderUrl,
      },
    })

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="miracle-order-qr-${auth.adminId}.png"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { success: false, error: 'QR 코드 생성 실패' },
      { status: 500 }
    )
  }
}
