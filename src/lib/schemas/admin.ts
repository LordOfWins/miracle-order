// ===== src/lib/schemas/admin.ts =====
// [원인] createProductJsonSchema에 imageUrl 필드가 없어서 JSON body로 전송 시 imageUrl이 strip됨
//        updateProductJsonSchema에도 imageUrl 필드가 없어서 PATCH 시 imageUrl이 strip됨
// [수정] 양쪽 스키마에 imageUrl 필드 추가

import { z } from 'zod/v4'

// ─── 카테고리 ───
export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '카테고리 이름을 입력해주세요')
    .max(100, '카테고리 이름은 100자 이내로 입력해주세요'),
})

export const updateCategorySchema = createCategorySchema

// ─── 제품 (JSON body) ───
export const createProductJsonSchema = z.object({
  categoryId: z.number().int().positive('카테고리를 선택해주세요'),
  name: z
    .string()
    .trim()
    .min(1, '제품명을 입력해주세요')
    .max(200, '제품명은 200자 이내로 입력해주세요'),
  price: z.number().int().min(0, '가격은 0 이상이어야 합니다').default(0),
  description: z.string().max(5000).nullable().optional(),
  note: z.string().max(5000).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
})

export const updateProductJsonSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  name: z
    .string()
    .trim()
    .min(1, '제품명을 입력해주세요')
    .max(200)
    .optional(),
  price: z.number().int().min(0).optional(),
  description: z.string().max(5000).nullable().optional(),
  note: z.string().max(5000).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  removeImage: z.boolean().optional(),
})

// ─── 순서 변경 ───
export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1, '정렬 데이터가 필요합니다'),
})

// ─── 설정 ───
export const updateSettingsSchema = z.object({
  receivePhone: z
    .string()
    .trim()
    .min(1, '수신번호를 입력해주세요')
    .regex(/^[\d-]+$/, '숫자와 하이픈만 입력 가능합니다')
    .refine(
      (v) => v.replace(/-/g, '').length >= 10,
      '올바른 전화번호를 입력해주세요'
    ),
  orderUrl: z.string().url('올바른 URL을 입력해주세요').optional(),
  noticeText: z.string().max(10000, '공지사항은 10000자 이내로 입력해주세요').optional(),
})
