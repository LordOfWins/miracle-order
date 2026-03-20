// src/lib/bytes.ts

/**
 * EUC-KR 기준 바이트 수 계산
 * 한글/한자/전각문자: 2바이트 / 영문/숫자/기본특수문자: 1바이트
 */
export function getByteLength(str: string): number {
  let byte = 0
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code <= 0x7f) {
      byte += 1
    } else if (code <= 0x7ff) {
      // 대부분의 한글 아님 (라틴확장 등) -> EUC-KR 기준 2바이트 처리
      byte += 2
    } else {
      // 한글, 한자, 전각 등 -> 2바이트
      byte += 2
    }
  }
  return byte
}

/**
 * LMS 2000바이트 제한에 맞춰 문자열 분할
 * subject(제목)는 각 파트에 동일하게 사용
 */
export function splitByBytes(str: string, maxBytes: number): string[] {
  const parts: string[] = []
  let current = ''
  let currentBytes = 0

  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const charCode = str.charCodeAt(i)
    const charBytes = charCode <= 0x7f ? 1 : 2

    if (currentBytes + charBytes > maxBytes) {
      parts.push(current)
      current = char
      currentBytes = charBytes
    } else {
      current += char
      currentBytes += charBytes
    }
  }

  if (current.length > 0) {
    parts.push(current)
  }

  return parts
}
