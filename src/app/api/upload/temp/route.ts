// src/app/api/upload/temp/route.ts
import { validateMagicBytes } from '@/lib/fileValidation'

import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'temp')
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_WIDTH = 1200

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일을 선택해주세요' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'JPG 또는 PNG 파일만 업로드 가능합니다' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 5MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { success: false, error: '파일 형식이 올바르지 않습니다' },
        { status: 400 }
      )
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const fileName = `${uuidv4()}.${ext}`
    const diskPath = join(UPLOAD_DIR, fileName)
    const publicPath = `/uploads/temp/${fileName}`

    let outputBuffer: Buffer

    if (ext === 'png') {
      outputBuffer = await sharp(buffer)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer()
    } else {
      outputBuffer = await sharp(buffer)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
    }

    await writeFile(diskPath, outputBuffer)

    const saved = await prisma.tempImage.create({
      data: {
        fileName,
        filePath: publicPath,
        fileSize: outputBuffer.byteLength,
        mimeType: ext === 'png' ? 'image/png' : 'image/jpeg',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: saved.id,
          imageUrl: saved.filePath,
          fileName: saved.fileName,
          fileSize: saved.fileSize,
          mimeType: saved.mimeType,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST temp upload error:', error)
    return NextResponse.json(
      { success: false, error: '임시 이미지 업로드 실패' },
      { status: 500 }
    )
  }
}
