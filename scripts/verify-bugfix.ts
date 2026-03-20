// ===== scripts/verify-bugfix.ts =====
// 버그 3건 수정 검증 자동화 스크립트
// 실행: npx tsx scripts/verify-bugfix.ts
// 필요: 서버가 localhost:3000에서 실행 중이어야 함 (npm run dev 또는 docker)
// 환경변수: TEST_LOGIN_ID, TEST_PASSWORD (없으면 기본값 사용)

import { readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'

// ─── 설정 ───
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3003'
const LOGIN_ID = process.env.TEST_LOGIN_ID || 'miracle'
const PASSWORD = process.env.TEST_PASSWORD || 'miracle1234!'

// ─── 유틸 ───
interface TestResult {
  name: string
  passed: boolean
  detail: string
  duration: number
}

const results: TestResult[] = []
let authCookie = ''
let testCategoryId: number | null = null
let testProductId: number | null = null
let uploadedImageUrl: string | null = null

function log(icon: string, msg: string) {
  const timestamp = new Date().toLocaleTimeString('ko-KR')
  console.log(`[${timestamp}] ${icon} ${msg}`)
}

function logSection(title: string) {
  console.log('')
  console.log('═'.repeat(60))
  console.log(`  ${title}`)
  console.log('═'.repeat(60))
}

async function runTest(
  name: string,
  fn: () => Promise<{ passed: boolean; detail: string }>
): Promise<boolean> {
  const start = Date.now()
  try {
    const { passed, detail } = await fn()
    const duration = Date.now() - start
    results.push({ name, passed, detail, duration })
    log(passed ? '✅' : '❌', `${name} (${duration}ms)`)
    if (!passed) log('  ', `  → ${detail}`)
    return passed
  } catch (err: unknown) {
    const duration = Date.now() - start
    const detail = err instanceof Error ? err.message : String(err)
    results.push({ name, passed: false, detail, duration })
    log('💥', `${name} — 예외 발생: ${detail} (${duration}ms)`)
    return false
  }
}

async function api(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BASE_URL}${path}`
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (authCookie) {
    headers['Cookie'] = authCookie
  }
  return fetch(url, { ...options, headers, redirect: 'manual' })
}

async function apiJson(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  const res = await api(path, { ...options, headers })
  const body = await res.json()
  return { status: res.status, body }
}

// ─── 테스트용 1x1 PNG 생성 (73바이트) ───
function createTestPng(): Buffer {
  // 최소 유효 PNG: 1x1 빨간 픽셀
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4' +
    'nGP4z8BQDwAEgAF/pooBPQAAAABJRU5ErkJggg=='
  return Buffer.from(base64, 'base64')
}

// ─── 테스트용 6MB 더미 파일 생성 ───
function createOversizedBuffer(): Buffer {
  return Buffer.alloc(6 * 1024 * 1024, 0xff)
}

// ═══════════════════════════════════════════════════════
//  0단계: 로그인
// ═══════════════════════════════════════════════════════

async function phase0_login(): Promise<boolean> {
  return runTest('0-1 관리자 로그인', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: LOGIN_ID, password: PASSWORD }),
      redirect: 'manual',
    })

    const setCookie = res.headers.get('set-cookie')
    if (!setCookie) {
      return { passed: false, detail: 'set-cookie 헤더 없음 — 로그인 실패' }
    }

    // miracle_token=xxx 추출
    const match = setCookie.match(/miracle_token=([^;]+)/)
    if (!match) {
      return { passed: false, detail: 'miracle_token 쿠키 없음' }
    }

    authCookie = `miracle_token=${match[1]}`
    const body = await res.json()

    return {
      passed: body.success === true,
      detail: body.success ? `로그인 성공: ${body.data?.name}` : `응답: ${JSON.stringify(body)}`,
    }
  })
}

// ═══════════════════════════════════════════════════════
//  1단계: 사전 데이터 준비 (테스트용 카테고리)
// ═══════════════════════════════════════════════════════

async function phase0_prepare(): Promise<boolean> {
  return runTest('0-2 테스트 카테고리 생성', async () => {
    const { status, body } = await apiJson('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name: `__TEST_BUGFIX_${Date.now()}` }),
    })

    if (!body.success) {
      return { passed: false, detail: `카테고리 생성 실패: ${JSON.stringify(body)}` }
    }

    testCategoryId = body.data.id
    return { passed: true, detail: `카테고리 ID: ${testCategoryId}` }
  })
}

// ═══════════════════════════════════════════════════════
//  버그1 테스트: 이미지 업로드
// ═══════════════════════════════════════════════════════

async function bug1_tests() {
  logSection('버그1: 제품 이미지 업로드')

  // 1-1: 이미지 업로드 API 단독 테스트
  await runTest('1-1 /api/admin/upload POST — 이미지 업로드', async () => {
    const png = createTestPng()
    const blob = new Blob([png], { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', blob, 'test.png')

    const res = await api('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const body = await res.json()

    if (!body.success || !body.data?.imageUrl) {
      return { passed: false, detail: `업로드 실패: ${JSON.stringify(body)}` }
    }

    uploadedImageUrl = body.data.imageUrl
    return { passed: true, detail: `imageUrl: ${uploadedImageUrl}` }
  })

  // 1-2: 제품 생성 (JSON + imageUrl)
  await runTest('1-2 제품 생성 (JSON body + imageUrl)', async () => {
    if (!testCategoryId || !uploadedImageUrl) {
      return { passed: false, detail: '사전 데이터 없음' }
    }

    const { status, body } = await apiJson('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: testCategoryId,
        name: '__TEST_PRODUCT_IMG',
        price: 10000,
        imageUrl: uploadedImageUrl,
      }),
    })

    if (!body.success) {
      return { passed: false, detail: `생성 실패: ${JSON.stringify(body)}` }
    }

    testProductId = body.data.id
    const savedUrl = body.data.imageUrl

    if (savedUrl !== uploadedImageUrl) {
      return {
        passed: false,
        detail: `imageUrl 불일치! 전송: ${uploadedImageUrl} → DB: ${savedUrl}`,
      }
    }

    return { passed: true, detail: `제품 ID: ${testProductId} / imageUrl 정상 저장` }
  })

  // 1-3: 제품 조회로 imageUrl 확인
  await runTest('1-3 제품 조회 시 imageUrl 존재 확인', async () => {
    if (!testCategoryId) {
      return { passed: false, detail: '카테고리 ID 없음' }
    }

    const { body } = await apiJson(`/api/admin/products?categoryId=${testCategoryId}`)
    if (!body.success) {
      return { passed: false, detail: `조회 실패: ${JSON.stringify(body)}` }
    }

    const product = body.data.find((p: any) => p.id === testProductId)
    if (!product) {
      return { passed: false, detail: '생성된 제품을 찾을 수 없음' }
    }

    if (!product.imageUrl) {
      return { passed: false, detail: 'imageUrl이 null — 버그1 미수정' }
    }

    return { passed: true, detail: `imageUrl: ${product.imageUrl}` }
  })

  // 1-4: 제품 수정 (PATCH JSON + imageUrl 변경)
  await runTest('1-4 제품 수정 — imageUrl 교체 (JSON PATCH)', async () => {
    if (!testProductId) {
      return { passed: false, detail: '제품 ID 없음' }
    }

    const newImageUrl = '/uploads/replaced-test-image.webp'

    const { body } = await apiJson(`/api/admin/products/${testProductId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        imageUrl: newImageUrl,
      }),
    })

    if (!body.success) {
      return { passed: false, detail: `수정 실패: ${JSON.stringify(body)}` }
    }

    if (body.data.imageUrl !== newImageUrl) {
      return {
        passed: false,
        detail: `imageUrl 불일치! 전송: ${newImageUrl} → DB: ${body.data.imageUrl}`,
      }
    }

    return { passed: true, detail: `imageUrl 교체 성공: ${body.data.imageUrl}` }
  })

  // 1-5: 제품 수정 — imageUrl을 null로 (이미지 삭제)
  await runTest('1-5 제품 수정 — imageUrl null (이미지 삭제)', async () => {
    if (!testProductId) {
      return { passed: false, detail: '제품 ID 없음' }
    }

    const { body } = await apiJson(`/api/admin/products/${testProductId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        imageUrl: null,
      }),
    })

    if (!body.success) {
      return { passed: false, detail: `수정 실패: ${JSON.stringify(body)}` }
    }

    if (body.data.imageUrl !== null) {
      return {
        passed: false,
        detail: `imageUrl이 null이 아님: ${body.data.imageUrl}`,
      }
    }

    return { passed: true, detail: 'imageUrl = null 정상 저장' }
  })

  // 1-6: 제품 생성 — 이미지 없이 (imageUrl 미전송)
  await runTest('1-6 제품 생성 — 이미지 없이 (정상 동작 확인)', async () => {
    if (!testCategoryId) {
      return { passed: false, detail: '카테고리 ID 없음' }
    }

    const { body } = await apiJson('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: testCategoryId,
        name: '__TEST_PRODUCT_NO_IMG',
        price: 5000,
      }),
    })

    if (!body.success) {
      return { passed: false, detail: `생성 실패: ${JSON.stringify(body)}` }
    }

    // 이미지 없는 제품도 나중에 정리
    return { passed: true, detail: `제품 ID: ${body.data.id} / imageUrl: ${body.data.imageUrl}` }
  })

  // 1-7: 5MB 초과 업로드 거부 확인
  await runTest('1-7 5MB 초과 이미지 업로드 거부', async () => {
    const oversized = createOversizedBuffer()
    const blob = new Blob([oversized], { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', blob, 'oversized.png')

    const res = await api('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const body = await res.json()

    if (body.success) {
      return { passed: false, detail: '5MB 초과인데 업로드가 성공함!' }
    }

    return { passed: true, detail: `거부 메시지: ${body.error}` }
  })

  // 1-8: multipart/form-data로 제품 생성 (직접 이미지 포함)
  await runTest('1-8 제품 생성 — multipart/form-data (이미지 직접 포함)', async () => {
    if (!testCategoryId) {
      return { passed: false, detail: '카테고리 ID 없음' }
    }

    const png = createTestPng()
    const blob = new Blob([png], { type: 'image/png' })
    const formData = new FormData()
    formData.append('categoryId', String(testCategoryId))
    formData.append('name', '__TEST_PRODUCT_MULTIPART')
    formData.append('price', '7777')
    formData.append('image', blob, 'multipart-test.png')

    const res = await api('/api/admin/products', {
      method: 'POST',
      body: formData,
    })
    const body = await res.json()

    if (!body.success) {
      return { passed: false, detail: `생성 실패: ${JSON.stringify(body)}` }
    }

    if (!body.data.imageUrl) {
      return { passed: false, detail: 'multipart 업로드인데 imageUrl이 null' }
    }

    return { passed: true, detail: `제품 ID: ${body.data.id} / imageUrl: ${body.data.imageUrl}` }
  })
}

// ═══════════════════════════════════════════════════════
//  버그2 테스트: 모달 외부 클릭 (코드 정적 분석)
// ═══════════════════════════════════════════════════════

async function bug2_tests() {
  logSection('버그2: 모달 외부 클릭 방지 (정적 코드 분석)')

  const modalFiles = [
    { path: 'src/components/admin/CategoryModal.tsx', name: 'CategoryModal' },
    { path: 'src/components/admin/ProductModal.tsx', name: 'ProductModal' },
  ]

  for (const { path, name } of modalFiles) {
    // 2-A: 백드롭 onClick 제거 확인
    await runTest(`2-A ${name} — 백드롭 onClick 제거됨`, async () => {
      let code: string
      try {
        code = readFileSync(join(process.cwd(), path), 'utf-8')
      } catch {
        return { passed: false, detail: `파일 읽기 실패: ${path}` }
      }

      // 최외곽 div에 onClick={handleBackdropClick}이 있으면 실패
      const hasBackdropClick = /onClick\s*=\s*\{handleBackdropClick\}/.test(code)

      if (hasBackdropClick) {
        return {
          passed: false,
          detail: 'handleBackdropClick이 백드롭 div에 바인딩되어 있음 — 외부 클릭 시 닫힘',
        }
      }

      return { passed: true, detail: '백드롭 onClick 핸들러 제거 확인' }
    })

    // 2-B: safeClose 또는 dirty check 존재 확인
    await runTest(`2-B ${name} — dirty check (confirm) 존재`, async () => {
      let code: string
      try {
        code = readFileSync(join(process.cwd(), path), 'utf-8')
      } catch {
        return { passed: false, detail: `파일 읽기 실패: ${path}` }
      }

      const hasConfirm = code.includes('window.confirm') || code.includes('confirm(')
      const hasDirtyCheck = code.includes('isDirty') || code.includes('imageChanged')

      if (!hasConfirm) {
        return { passed: false, detail: 'window.confirm 호출 없음 — 닫기 전 확인 미구현' }
      }

      if (!hasDirtyCheck) {
        return { passed: false, detail: 'isDirty 체크 없음 — 변경 감지 미구현' }
      }

      return { passed: true, detail: 'confirm + isDirty 체크 존재 확인' }
    })

    // 2-C: forceClose와 safeClose 분리 확인
    await runTest(`2-C ${name} — forceClose/safeClose 분리`, async () => {
      let code: string
      try {
        code = readFileSync(join(process.cwd(), path), 'utf-8')
      } catch {
        return { passed: false, detail: `파일 읽기 실패: ${path}` }
      }

      const hasForceClose = code.includes('forceClose')
      const hasSafeClose = code.includes('safeClose')

      if (!hasForceClose || !hasSafeClose) {
        return {
          passed: false,
          detail: `forceClose: ${hasForceClose} / safeClose: ${hasSafeClose}`,
        }
      }

      // submit 성공 시에는 forceClose를 호출해야 함 (confirm 없이)
      const submitUsesForceClose = /result\.success[\s\S]{0,200}forceClose/.test(code)

      if (!submitUsesForceClose) {
        return { passed: false, detail: 'submit 성공 후 forceClose 호출 패턴 미발견' }
      }

      return { passed: true, detail: 'submit→forceClose / 취소→safeClose 분리 확인' }
    })

    // 2-D: 취소 버튼이 safeClose를 호출하는지
    await runTest(`2-D ${name} — 취소 버튼 onClick=safeClose`, async () => {
      let code: string
      try {
        code = readFileSync(join(process.cwd(), path), 'utf-8')
      } catch {
        return { passed: false, detail: `파일 읽기 실패: ${path}` }
      }

      // onClick={safeClose} 패턴 또는 onClick={() => safeClose()} 패턴
      const cancelBtn = /type="button"[\s\S]{0,100}onClick\s*=\s*\{safeClose\}/.test(code)

      if (!cancelBtn) {
        return { passed: false, detail: '취소 버튼에 safeClose 바인딩 없음' }
      }

      return { passed: true, detail: '취소 버튼 → safeClose 확인' }
    })

    // 2-E: ESC 키가 safeClose를 호출하는지
    await runTest(`2-E ${name} — ESC 키 → safeClose`, async () => {
      let code: string
      try {
        code = readFileSync(join(process.cwd(), path), 'utf-8')
      } catch {
        return { passed: false, detail: `파일 읽기 실패: ${path}` }
      }

      const escSafe = /Escape[\s\S]{0,50}safeClose/.test(code)

      if (!escSafe) {
        return { passed: false, detail: 'ESC 키 핸들러가 safeClose를 호출하지 않음' }
      }

      return { passed: true, detail: 'ESC → safeClose 확인' }
    })
  }
}

// ═══════════════════════════════════════════════════════
//  버그3 테스트: QR코드 생성
// ═══════════════════════════════════════════════════════

async function bug3_tests() {
  logSection('버그3: QR코드 생성')

  // 3-0: orderUrl 설정
  await runTest('3-0 orderUrl 설정 (테스트 URL)', async () => {
    const { body } = await apiJson('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        receivePhone: '010-0000-0000',
        orderUrl: `${BASE_URL}/order/test`,
      }),
    })

    if (!body.success) {
      return { passed: false, detail: `설정 저장 실패: ${JSON.stringify(body)}` }
    }

    return { passed: true, detail: `orderUrl: ${body.data.orderUrl}` }
  })

  // 3-1: QR 코드 생성 API
  await runTest('3-1 GET /api/admin/settings/qrcode — PNG 반환', async () => {
    const res = await api('/api/admin/settings/qrcode')

    if (res.status !== 200) {
      const text = await res.text()
      return { passed: false, detail: `status: ${res.status} / body: ${text.slice(0, 200)}` }
    }

    const contentType = res.headers.get('content-type')
    if (!contentType?.includes('image/png')) {
      return { passed: false, detail: `Content-Type: ${contentType} (image/png 아님)` }
    }

    const buffer = Buffer.from(await res.arrayBuffer())

    // PNG 시그니처 확인 (89 50 4E 47)
    const pngSignature = buffer.slice(0, 4)
    const isPng =
      pngSignature[0] === 0x89 &&
      pngSignature[1] === 0x50 &&
      pngSignature[2] === 0x4e &&
      pngSignature[3] === 0x47

    if (!isPng) {
      return { passed: false, detail: `PNG 시그니처 불일치: ${pngSignature.toString('hex')}` }
    }

    const contentLength = res.headers.get('content-length')

    return {
      passed: true,
      detail: `PNG 정상 / size: ${contentLength || buffer.byteLength} bytes`,
    }
  })

  // 3-2: QR 이미지 저장 테스트 (로컬 검증용)
  await runTest('3-2 QR 이미지 파일 저장 및 검증', async () => {
    const res = await api('/api/admin/settings/qrcode')

    if (res.status !== 200) {
      return { passed: false, detail: `status: ${res.status}` }
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const testPath = join(process.cwd(), 'public', 'uploads', '__test_qr.png')

    writeFileSync(testPath, buffer)

    // 파일 크기 확인 (유효한 QR이면 최소 1KB 이상)
    if (buffer.byteLength < 1024) {
      return { passed: false, detail: `QR 이미지가 너무 작음: ${buffer.byteLength} bytes` }
    }

    // 정리
    try {
      unlinkSync(testPath)
    } catch {
      // 무시
    }

    return { passed: true, detail: `QR 이미지 크기: ${buffer.byteLength} bytes — 정상` }
  })

  // 3-3: orderUrl 없을 때 404 확인
  await runTest('3-3 orderUrl 미설정 시 404 반환', async () => {
    // 먼저 orderUrl을 비워봐야 하는데, 스키마상 url()이라 빈 문자열은 안 됨
    // 직접 DB를 건드리지 않으므로, 이 테스트는 코드 정적 분석으로 대체
    let code: string
    try {
      code = readFileSync(
        join(process.cwd(), 'src/app/api/admin/settings/qrcode/route.ts'),
        'utf-8'
      )
    } catch {
      return { passed: false, detail: '파일 읽기 실패' }
    }

    const checks404 = code.includes("'주문서 URL이 설정되지 않았습니다'") &&
      code.includes('404')

    if (!checks404) {
      return { passed: false, detail: 'orderUrl null 체크 로직 없음' }
    }

    return { passed: true, detail: 'orderUrl null → 404 분기 존재 확인' }
  })

  // 3-4: toBuffer 대신 toDataURL 사용 확인 (정적 분석)
  await runTest('3-4 QR route — toDataURL 사용 확인 (canvas 의존성 제거)', async () => {
    let code: string
    try {
      code = readFileSync(
        join(process.cwd(), 'src/app/api/admin/settings/qrcode/route.ts'),
        'utf-8'
      )
    } catch {
      return { passed: false, detail: '파일 읽기 실패' }
    }

    // 주석 라인 제거 후 실제 코드만 분석
    const codeWithoutComments = code
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('//'))
      .join('\n')

    const usesToBuffer = codeWithoutComments.includes('toBuffer')
    const usesToDataURL = codeWithoutComments.includes('toDataURL')

    if (usesToBuffer) {
      return {
        passed: false,
        detail: 'toBuffer 사용 중 — alpine에서 canvas 에러 발생 가능',
      }
    }

    if (!usesToDataURL) {
      return { passed: false, detail: 'toDataURL 사용하지 않음' }
    }

    // base64 디코딩 로직 확인
    const hasBase64Decode = codeWithoutComments.includes("'base64'") && codeWithoutComments.includes("split(',')")

    if (!hasBase64Decode) {
      return { passed: false, detail: 'base64 디코딩 로직 없음' }
    }

    return { passed: true, detail: 'toDataURL + base64 디코딩 패턴 확인' }
  })
}

// ═══════════════════════════════════════════════════════
//  스키마 검증 (정적 분석)
// ═══════════════════════════════════════════════════════

async function schema_tests() {
  logSection('스키마 검증 (정적 코드 분석)')

  await runTest('S-1 createProductJsonSchema에 imageUrl 필드 존재', async () => {
    let code: string
    try {
      code = readFileSync(
        join(process.cwd(), 'src/lib/schemas/admin.ts'),
        'utf-8'
      )
    } catch {
      return { passed: false, detail: '파일 읽기 실패' }
    }

    // createProductJsonSchema 블록 내에 imageUrl이 있는지
    const schemaBlock = code.split('createProductJsonSchema')[1]?.split('export')[0] || ''
    const hasImageUrl = schemaBlock.includes('imageUrl')

    if (!hasImageUrl) {
      return {
        passed: false,
        detail: 'createProductJsonSchema에 imageUrl 필드 없음 — 버그1 핵심 원인',
      }
    }

    return { passed: true, detail: 'imageUrl 필드 존재 확인' }
  })

  await runTest('S-2 updateProductJsonSchema에 imageUrl 필드 존재', async () => {
    let code: string
    try {
      code = readFileSync(
        join(process.cwd(), 'src/lib/schemas/admin.ts'),
        'utf-8'
      )
    } catch {
      return { passed: false, detail: '파일 읽기 실패' }
    }

    const schemaBlock = code.split('updateProductJsonSchema')[1]?.split('export')[0] || ''
    const hasImageUrl = schemaBlock.includes('imageUrl')

    if (!hasImageUrl) {
      return {
        passed: false,
        detail: 'updateProductJsonSchema에 imageUrl 필드 없음 — 버그1 핵심 원인',
      }
    }

    return { passed: true, detail: 'imageUrl 필드 존재 확인' }
  })

  await runTest('S-3 products/route.ts POST — imageUrl 추출 로직', async () => {
    let code: string
    try {
      code = readFileSync(
        join(process.cwd(), 'src/app/api/admin/products/route.ts'),
        'utf-8'
      )
    } catch {
      return { passed: false, detail: '파일 읽기 실패' }
    }

    // JSON 분기에서 imageUrl을 parsed.data에서 꺼내는지
    const hasImageUrlExtract =
      code.includes('parsed.data.imageUrl') ||
      code.includes('imageUrl = parsed.data.imageUrl')

    if (!hasImageUrlExtract) {
      return {
        passed: false,
        detail: 'POST JSON 분기에서 parsed.data.imageUrl 추출 로직 없음',
      }
    }

    return { passed: true, detail: 'imageUrl 추출 로직 존재 확인' }
  })

  await runTest('S-4 products/[id]/route.ts PATCH — imageUrl 처리 로직', async () => {
    let code: string
    try {
      code = readFileSync(
        join(process.cwd(), 'src/app/api/admin/products/[id]/route.ts'),
        'utf-8'
      )
    } catch {
      return { passed: false, detail: '파일 읽기 실패' }
    }

    // destructuring에서 imageUrl을 꺼내는지
    const hasImageUrlDestructure =
      /\{\s*[\s\S]*imageUrl[\s\S]*\}\s*=\s*parsed\.data/.test(code)

    if (!hasImageUrlDestructure) {
      return {
        passed: false,
        detail: 'PATCH parsed.data에서 imageUrl destructuring 없음',
      }
    }

    // imageUrl !== undefined 체크 로직
    const hasImageUrlUpdate = code.includes('imageUrl !== undefined')

    if (!hasImageUrlUpdate) {
      return { passed: false, detail: 'imageUrl !== undefined 체크 로직 없음' }
    }

    return { passed: true, detail: 'imageUrl destructuring + undefined 체크 존재' }
  })
}

// ═══════════════════════════════════════════════════════
//  정리 (테스트 데이터 삭제)
// ═══════════════════════════════════════════════════════

async function cleanup() {
  logSection('정리: 테스트 데이터 삭제')

  // 제품 삭제 (카테고리 삭제 시 cascade로 삭제되지만 명시적으로)
  if (testCategoryId) {
    await runTest('CLN-1 테스트 카테고리 삭제 (cascade)', async () => {
      const res = await api(`/api/admin/categories/${testCategoryId}`, {
        method: 'DELETE',
      })

      if (res.status === 200 || res.status === 204) {
        return { passed: true, detail: `카테고리 ${testCategoryId} 삭제 완료` }
      }

      const body = await res.json().catch(() => ({}))
      return { passed: false, detail: `삭제 실패: ${JSON.stringify(body)}` }
    })
  }
}

// ═══════════════════════════════════════════════════════
//  리포트
// ═══════════════════════════════════════════════════════

function printReport() {
  logSection('최종 리포트')

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length
  const totalTime = results.reduce((acc, r) => acc + r.duration, 0)

  console.log('')

  // 실패 항목만 상세 출력
  if (failed > 0) {
    console.log('❌ 실패 항목:')
    console.log('─'.repeat(60))
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  ${r.name}`)
      console.log(`    → ${r.detail}`)
      console.log('')
    }
  }

  // 전체 요약
  console.log('─'.repeat(60))
  console.log(`  전체: ${total} | ✅ 성공: ${passed} | ❌ 실패: ${failed} | ⏱ ${totalTime}ms`)
  console.log('─'.repeat(60))

  if (failed === 0) {
    console.log('')
    console.log('  🎉 모든 버그 수정 검증 통과!')
    console.log('')
  } else {
    console.log('')
    console.log(`  ⚠️  ${failed}건 실패 — 위 항목을 수정 후 재실행하세요`)
    console.log('')
  }

  // JSON 리포트 저장
  const reportPath = join(process.cwd(), 'bugfix-report.json')
  const report = {
    date: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: { total, passed, failed, totalTime },
    results: results.map((r) => ({
      name: r.name,
      passed: r.passed,
      detail: r.detail,
      duration: r.duration,
    })),
  }
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  log('📄', `리포트 저장: ${reportPath}`)

  // 실패 시 exit code 1
  process.exit(failed > 0 ? 1 : 0)
}

// ═══════════════════════════════════════════════════════
//  메인
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║     miracle-order 버그 수정 검증 자동화 스크립트       ║')
  console.log('║     버그1: 이미지 업로드 / 버그2: 모달 / 버그3: QR    ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')
  log('🔧', `대상 서버: ${BASE_URL}`)
  log('🔧', `로그인 ID: ${LOGIN_ID}`)
  console.log('')

  // 서버 연결 확인
  try {
    const healthCheck = await fetch(`${BASE_URL}`, { method: 'HEAD' }).catch(() => null)
    if (!healthCheck || healthCheck.status >= 500) {
      log('💥', `서버 응답 없음 — ${BASE_URL} 에서 서버가 실행 중인지 확인하세요`)
      log('  ', '  → npm run dev 또는 docker compose up 실행 후 재시도')
      process.exit(1)
    }
  } catch {
    log('💥', `서버 연결 실패: ${BASE_URL}`)
    process.exit(1)
  }

  // 0단계: 로그인 + 데이터 준비
  const loginOk = await phase0_login()
  if (!loginOk) {
    log('💥', '로그인 실패 — 테스트 중단')
    log('  ', '  → TEST_LOGIN_ID / TEST_PASSWORD 환경변수를 확인하세요')
    printReport()
    return
  }

  const prepareOk = await phase0_prepare()
  if (!prepareOk) {
    log('💥', '테스트 데이터 준비 실패 — 테스트 중단')
    printReport()
    return
  }

  // 스키마 정적 분석 (파일 존재 여부부터 확인)
  await schema_tests()

  // 버그별 테스트
  await bug1_tests()
  await bug2_tests()
  await bug3_tests()

  // 정리
  await cleanup()

  // 리포트
  printReport()
}

main().catch((err) => {
  console.error('스크립트 실행 오류:', err)
  process.exit(1)
})
