// src/lib/apiResponse.ts
import { NextResponse } from 'next/server'

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export function unauthorized() {
  return fail('인증이 필요합니다', 401)
}
