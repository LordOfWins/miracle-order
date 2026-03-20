// src/types/api.ts

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface CategoryItem {
  id: number
  adminId: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProductItem {
  id: number
  categoryId: number
  adminId: number
  name: string
  price: number
  imageUrl: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminSettingItem {
  id: number
  adminId: number
  receivePhone: string
  orderUrl: string | null
  qrCodeUrl: string | null
  noticeText: string | null
}

export interface ReorderItem {
  id: number
  sortOrder: number
}
