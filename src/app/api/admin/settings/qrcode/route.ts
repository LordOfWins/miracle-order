// ===== src/app/api/admin/settings/qrcode/route.ts =====
// [원인] toBuffer()는 node-canvas 네이티브 모듈 필요 → alpine에서 런타임 에러
// [수정] toDataURL()로 base64 PNG 생성 후 Buffer 디코딩

import { fail, unauthorized } from '@/lib/apiResponse'
import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET() {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) return unauthorized()

    const setting = await prisma.adminSetting.findUnique({
      where: { adminId: auth.adminId },
      select: { orderUrl: true },
    })

    if (!setting?.orderUrl) {
      return fail('주문서 URL이 설정되지 않았습니다', 404)
    }

    // toDataURL은 canvas 없이 순수 JS PNG 인코더로 동작
    const dataUrl = await QRCode.toDataURL(setting.orderUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    // data:image/png;base64,xxxx → base64 부분만 추출 → Buffer 변환
    const base64Data = dataUrl.split(',')[1]
    const pngBuffer = Buffer.from(base64Data, 'base64')

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(pngBuffer.byteLength),
        'Cache-Control': 'private, max-age=300',
        'Content-Disposition': 'inline; filename="order-qrcode.png"',
      },
    })
  } catch (error) {
    console.error('GET qrcode error:', error)
    return fail('QR 코드 생성 실패', 500)
  }
}

