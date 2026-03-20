// src/lib/smsBuilder.ts

interface AdminSmsParams {
  centerName: string
  writerPhone: string
  recipientName: string
  gender: string
  copayType?: string | null
  contactPhone1?: string | null
  contactPhone2?: string | null
  roadAddress?: string | null
  detailAddress?: string | null
  zipCode?: string | null
  productNames: string[]
  requestNote?: string | null
  downloadLinks: string[]
}

interface WriterSmsParams {
  recipientName: string
  productNames: string[]
  requestNote?: string | null
}

/**
 * 관리자용 SMS 본문 생성
 * 순서: 기관명(5항)->작성자연락처(6항)->수급자(7항)->성별(8항)
 *      ->연락처1/2(9항)->주소(10항)->선택제품(3항)->세부요청(4항)->서류사진링크(11항)
 */
export function buildAdminSmsText(params: AdminSmsParams): string {
  const lines: string[] = []

  lines.push(`[미라클복지용구 주문접수]`)
  lines.push(``)
  lines.push(`기관명: ${params.centerName}`)
  lines.push(`작성자: ${params.writerPhone}`)
  lines.push(`수급자: ${params.recipientName}`)
  lines.push(`성별: ${params.gender}`)
  if (params.copayType) {
    lines.push(`본인부담금: ${params.copayType}`)
  }

  const phones: string[] = []
  if (params.contactPhone1) phones.push(params.contactPhone1)
  if (params.contactPhone2) phones.push(params.contactPhone2)
  if (phones.length > 0) {
    lines.push(`연락처: ${phones.join(' / ')}`)
  }

  if (params.roadAddress || params.detailAddress) {
    const addr = [params.roadAddress, params.detailAddress].filter(Boolean).join(' ')
    const zip = params.zipCode ? ` (${params.zipCode})` : ''
    lines.push(`주소: ${addr}${zip}`)
  }

  lines.push(``)
  lines.push(`[선택제품]`)
  params.productNames.forEach((name, idx) => {
    lines.push(`${idx + 1}. ${name}`)
  })

  if (params.requestNote) {
    lines.push(``)
    lines.push(`[세부요청]`)
    lines.push(params.requestNote)
  }

  if (params.downloadLinks.length > 0) {
    lines.push(``)
    lines.push(`[서류사진]`)
    params.downloadLinks.forEach((link, idx) => {
      lines.push(`${idx + 1}. ${link}`)
    })
  }

  return lines.join('\n')
}

/**
 * 작성자용 SMS 본문 생성
 * 순서: 수급자(7항)->선택제품(3항)->세부요청(4항)->"주문이 완료 되었습니다"
 */
export function buildWriterSmsText(params: WriterSmsParams): string {
  const lines: string[] = []

  lines.push(`[미라클복지용구]`)
  lines.push(`수급자: ${params.recipientName}`)
  lines.push(`제품: ${params.productNames.join(', ')}`)

  if (params.requestNote) {
    lines.push(`요청: ${params.requestNote}`)
  }

  lines.push(`주문이 완료 되었습니다`)

  return lines.join('\n')
}
