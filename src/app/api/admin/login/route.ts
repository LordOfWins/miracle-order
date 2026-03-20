// src/app/api/admin/login/route.ts
import { COOKIE_NAME, signToken, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed, retryAfter } = checkRateLimit(`login:${ip}`, {
      windowMs: 15 * 60 * 1000,  // 15분
      maxRequests: 5,             // 5회
    })
    const body = await request.json()
    const { loginId, password } = body

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `너무 많은 로그인 시도입니다 (${retryAfter}초 후 재시도)` },
        { status: 429 }
      )
    }
    const admin = await prisma.admin.findUnique({
      where: { loginId },
    })

    if (!admin || !verifyPassword(password, admin.password)) {
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }

    const token = await signToken({
      adminId: admin.id,
      loginId: admin.loginId,
    })

    const response = NextResponse.json({
      success: true,
      data: { name: admin.name },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24시간
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
