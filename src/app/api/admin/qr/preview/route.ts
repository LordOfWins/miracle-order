// src/app/api/admin/qr/preview/route.ts

import { getAuthFromCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// QR코드 DataURL (미리보기용 JSON)
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

    const qrDataUrl = await QRCode.toDataURL(orderUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })

    return NextResponse.json({
      success: true,
      data: {
        orderUrl,
        qrDataUrl,
      },
    })
  } catch (error) {
    console.error('QR preview error:', error)
    return NextResponse.json(
      { success: false, error: 'QR 미리보기 생성 실패' },
      { status: 500 }
    )
  }
}
