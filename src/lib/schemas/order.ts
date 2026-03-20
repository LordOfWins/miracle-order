// src/lib/schemas/order.ts

import { z } from 'zod'

const phoneRegex = /^010-\d{4}-\d{4}$/

export const tempImageIdSchema = z.string().uuid()

export const orderSchema = z.object({
  adminId: z
    .number({ error: '관리자 정보가 올바르지 않습니다' })
    .int()
    .positive(),
  productIds: z
    .array(z.number().int().positive())
    .min(1, '제품을 1개 이상 선택해주세요'),
  requestNote: z
    .string()
    .max(1000, '세부 요청사항은 1000자 이하로 입력해주세요')
    .optional()
    .default(''),
  centerName: z
    .string()
    .trim()
    .min(1, '기관명 또는 센터명을 입력해주세요')
    .max(150, '기관명 또는 센터명은 150자 이하로 입력해주세요'),
  writerPhone: z
    .string()
    .regex(phoneRegex, '작성자 연락처를 올바르게 입력해주세요'),
  recipientName: z
    .string()
    .trim()
    .min(1, '수급자 성함을 입력해주세요')
    .max(50, '수급자 성함은 50자 이하로 입력해주세요'),
  gender: z.enum(['남', '여'], {
    error: '성별을 선택해주세요',
  }),
  copayType: z
    .enum(['본부유', '본부대체', '본부50%할인'], {
      error: '본인부담금 여부를 확인해주세요',
    })
    .optional()
    .nullable()
    .default(null),
  contactPhone1: z
    .union([z.literal(''), z.string().regex(phoneRegex, '연락처1 형식이 올바르지 않습니다')])
    .optional()
    .default(''),
  contactPhone2: z
    .union([z.literal(''), z.string().regex(phoneRegex, '연락처2 형식이 올바르지 않습니다')])
    .optional()
    .default(''),
  roadAddress: z
    .string()
    .max(255, '도로명주소는 255자 이하로 입력해주세요')
    .optional()
    .default(''),
  detailAddress: z
    .string()
    .max(255, '상세주소는 255자 이하로 입력해주세요')
    .optional()
    .default(''),
  zipCode: z
    .string()
    .max(10, '우편번호 형식이 올바르지 않습니다')
    .optional()
    .default(''),
  tempImageIds: z
    .array(tempImageIdSchema)
    .max(5, '이미지는 최대 5장까지 첨부할 수 있습니다')
    .optional()
    .default([]),
})

export type OrderSchemaInput = z.infer<typeof orderSchema>
