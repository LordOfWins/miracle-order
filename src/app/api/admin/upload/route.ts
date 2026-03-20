// src/app/api/admin/upload/route.ts

import { getAuthFromCookie } from '@/lib/auth'
import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_WIDTH = 800

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일을 선택해주세요' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'JPG 또는 PNG 파일만 업로드 가능합니다' },
        { status: 400 }
      )
    }

    // 파일 크기 검증
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 5MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    // 디렉토리 생성
    await mkdir(UPLOAD_DIR, { recursive: true })

    // 파일 버퍼 읽기
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // sharp로 리사이즈 (최대 800px 너비)
    const resized = await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    // 고유 파일명 생성
    const fileName = `${uuidv4()}.jpg`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, resized)

    const imageUrl = `/uploads/${fileName}`

    return NextResponse.json(
      { success: true, data: { imageUrl } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: '파일 업로드 실패' },
      { status: 500 }
    )
  }
}
