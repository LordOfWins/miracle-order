// src/app/api/admin/logout/route.ts

import { COOKIE_NAME } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
