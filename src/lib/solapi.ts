// src/lib/solapi.ts

import { getByteLength, splitByBytes } from '@/lib/bytes'
import { SolapiMessageService } from 'solapi'

const API_KEY = process.env.SOLAPI_API_KEY || ''
const API_SECRET = process.env.SOLAPI_API_SECRET || ''
const SENDER = process.env.SOLAPI_SENDER || ''

const messageService = new SolapiMessageService(API_KEY, API_SECRET)

// LMS 본문 최대 바이트 (2000바이트)
const LMS_MAX_BYTES = 2000
// SMS 최대 바이트 (90바이트)
const SMS_MAX_BYTES = 90

interface SendResult {
  success: boolean
  groupId?: string
  error?: string
  messageCount?: number
}

/**
 * 전화번호에서 하이픈 제거 (SOLAPI는 하이픈 없는 형식 필요)
 */
function cleanPhone(phone: string): string {
  return phone.replace(/-/g, '')
}

/**
 * 1회 재시도 포함 단건 발송
 */
async function sendWithRetry(params: {
  to: string
  from: string
  text: string
  subject?: string
  type?: 'SMS' | 'LMS'
}): Promise<{ success: boolean; groupId?: string; error?: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const sendParams: Record<string, unknown> = {
        to: params.to,
        from: params.from,
        text: params.text,
      }
      if (params.subject) {
        sendParams.subject = params.subject
      }
      if (params.type) {
        sendParams.type = params.type
      }

      const result = await messageService.send(sendParams as Parameters<typeof messageService.send>[0])
      return { success: true, groupId: (result as Record<string, unknown>).groupId as string | undefined }
    } catch (err: unknown) {
      console.error(`SOLAPI send attempt ${attempt + 1} failed:`, err)

      const errorMsg = err instanceof Error ? err.message : String(err)

      // 잔액 부족 / 인증 실패 / 권한 에러는 재시도해도 동일하므로 즉시 탈출
      const noRetryPatterns = ['NotEnoughBalance', 'Unauthorized', 'Forbidden', 'InvalidApiKey']
      const shouldSkipRetry = noRetryPatterns.some(p => errorMsg.includes(p))

      if (shouldSkipRetry || attempt === 1) {
        return { success: false, error: errorMsg }
      }
    }
  }
  return { success: false, error: 'Unknown error after retries' }
}

/**
 * 관리자용 SMS/LMS 발송 (2000바이트 초과 시 분할)
 */
export async function sendAdminSms(params: {
  to: string
  subject: string
  text: string
}): Promise<SendResult> {
  const to = cleanPhone(params.to)
  const from = cleanPhone(SENDER)
  const textBytes = getByteLength(params.text)

  // 90바이트 이하면 SMS로 보내지만 관리자 문자는 내용이 길어서 거의 LMS
  // 2000바이트 이하면 LMS 단건 발송
  if (textBytes <= LMS_MAX_BYTES) {
    const type = textBytes <= SMS_MAX_BYTES ? 'SMS' as const : 'LMS' as const
    const result = await sendWithRetry({
      to,
      from,
      text: params.text,
      subject: type === 'LMS' ? params.subject : undefined,
      type,
    })
    return {
      success: result.success,
      groupId: result.groupId,
      error: result.error,
      messageCount: 1,
    }
  }

  // 2000바이트 초과 -> 분할 발송
  const parts = splitByBytes(params.text, LMS_MAX_BYTES)
  const totalParts = parts.length
  let allSuccess = true
  let lastGroupId: string | undefined
  const errors: string[] = []

  for (let i = 0; i < totalParts; i++) {
    const partSubject = `${params.subject} (${i + 1}/${totalParts})`
    const result = await sendWithRetry({
      to,
      from,
      text: parts[i],
      subject: partSubject,
      type: 'LMS',
    })
    if (!result.success) {
      allSuccess = false
      errors.push(`파트${i + 1}: ${result.error}`)
    } else {
      lastGroupId = result.groupId
    }
  }

  return {
    success: allSuccess,
    groupId: lastGroupId,
    error: errors.length > 0 ? errors.join(' / ') : undefined,
    messageCount: totalParts,
  }
}

/**
 * 작성자용 SMS/LMS 발송 (90바이트 이하 SMS, 초과 시 LMS)
 */
export async function sendWriterSms(params: {
  to: string
  text: string
}): Promise<SendResult> {
  const to = cleanPhone(params.to)
  const from = cleanPhone(SENDER)
  const textBytes = getByteLength(params.text)

  const type = textBytes <= SMS_MAX_BYTES ? 'SMS' as const : 'LMS' as const
  const result = await sendWithRetry({
    to,
    from,
    text: params.text,
    subject: type === 'LMS' ? '미라클복지용구 주문확인' : undefined,
    type,
  })

  return {
    success: result.success,
    groupId: result.groupId,
    error: result.error,
    messageCount: 1,
  }
}
