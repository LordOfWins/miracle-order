// scripts/generate-icons.mjs
// 실행: node scripts/generate-icons.mjs
// icon-source.png가 있으면 그걸 사용, 없으면 자동 생성

import { access, mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ICONS_DIR = join(ROOT, 'public', 'icons')
const SOURCE = join(ICONS_DIR, 'icon-source.png')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]

// #2563EB = rgb(37, 99, 235)
const BRAND_COLOR = { r: 37, g: 99, b: 235 }

async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * icon-source.png가 없을 때 1024x1024 기본 아이콘 자동 생성
 * 파란 배경 + 흰색 "미" 텍스트 SVG
 */
async function createDefaultSource() {
  const size = 1024
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="180" ry="180" fill="#2563EB"/>
      <text
        x="50%" y="54%"
        font-family="sans-serif"
        font-size="520"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >미</text>
    </svg>
  `
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(SOURCE)

  console.log('[생성] icon-source.png (기본 아이콘 자동 생성)')
  console.log('       나중에 실제 로고로 교체 후 다시 실행하세요\n')
}

async function generate() {
  await mkdir(ICONS_DIR, { recursive: true })

  // 원본 없으면 자동 생성
  if (!(await fileExists(SOURCE))) {
    await createDefaultSource()
  } else {
    console.log('[확인] icon-source.png 발견\n')
  }

  // 일반 아이콘 (purpose: any)
  for (const size of SIZES) {
    const output = join(ICONS_DIR, `icon-${size}x${size}.png`)
    await sharp(SOURCE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(output)
    console.log(`[OK] icon-${size}x${size}.png`)
  }

  // 마스커블 아이콘 (purpose: maskable)
  for (const size of MASKABLE_SIZES) {
    const output = join(ICONS_DIR, `icon-maskable-${size}x${size}.png`)
    const innerSize = Math.round(size * 0.8)
    const padding = Math.round((size - innerSize) / 2)

    const resized = await sharp(SOURCE)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { ...BRAND_COLOR, alpha: 1 },
      })
      .toBuffer()

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { ...BRAND_COLOR, alpha: 1 },
      },
    })
      .composite([{ input: resized, left: padding, top: padding }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(output)

    console.log(`[OK] icon-maskable-${size}x${size}.png`)
  }

  console.log(`\n아이콘 생성 완료! (${SIZES.length + MASKABLE_SIZES.length}개)`)
  console.log(`출력 경로: ${ICONS_DIR}`)
}

generate().catch((err) => {
  console.error('아이콘 생성 실패:', err)
  process.exit(1)
})
