// src/types/order.ts

export interface PublicCategoryItem {
  id: number
  adminId: number
  name: string
  sortOrder: number
}

export interface PublicProductItem {
  id: number
  categoryId: number
  adminId: number
  name: string
  price: number
  imageUrl: string | null
  description: string | null
  note: string | null
  sortOrder: number
}

export interface TempUploadItem {
  id: string
  imageUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface OrderFormData {
  adminId: number
  requestNote: string
  centerName: string
  writerPhone: string
  recipientName: string
  gender: '남' | '여' | ''
  copayType: '본부유' | '본부대체' | '본부50%할인' | ''
  contactPhone1: string
  contactPhone2: string
  roadAddress: string
  detailAddress: string
  zipCode: string
  tempImageIds: string[]
}

export interface OrderSubmitPayload extends OrderFormData {
  productIds: number[]
}

export interface OrderSelectedProduct {
  id: number
  categoryId: number
  adminId: number
  name: string
  price: number
  imageUrl: string | null
  description: string | null
  note: string | null
  sortOrder: number
}
