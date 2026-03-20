// src/lib/imageProcessor.ts
import { mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_WIDTH = 800
const QUALITY = 80

/** uploads 디렉토리 보장 */
async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true })
}

/**
 * FormData의 File → sharp 리사이즈(800px) → webp 변환 → public/uploads 저장
 * @returns 저장된 상대경로 (예: /uploads/xxxx.webp)
 */
export async function processAndSaveImage(file: File): Promise<string> {
  await ensureDir()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileName = `${uuidv4()}.webp`
  const filePath = join(UPLOAD_DIR, fileName)

  await sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(filePath)

  return `/uploads/${fileName}`
}

/**
 * 상대경로로 이미지 파일 삭제
 * 파일이 없어도 에러를 무시함
 */
export async function deleteImageFile(relativePath: string): Promise<void> {
  try {
    const fullPath = join(process.cwd(), 'public', relativePath)
    await unlink(fullPath)
  } catch {
    // 파일이 이미 없으면 무시
  }
}
