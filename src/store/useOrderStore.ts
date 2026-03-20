// src/store/useOrderStore.ts

'use client'

import type {
  OrderFormData,
  OrderSelectedProduct,
  PublicCategoryItem,
  PublicProductItem,
  TempUploadItem,
} from '@/types/order'
import { create } from 'zustand'

interface OrderStoreState {
  categories: PublicCategoryItem[]
  selectedCategoryId: number | null
  productMapByCategory: Record<number, PublicProductItem[]>
  selectedProductMap: Map<number, OrderSelectedProduct>
  formData: OrderFormData
  images: TempUploadItem[]
  isLoading: boolean
  error: string | null

  setCategories: (categories: PublicCategoryItem[]) => void
  setSelectedCategoryId: (categoryId: number | null) => void
  setProductsByCategory: (categoryId: number, products: PublicProductItem[]) => void
  toggleProduct: (product: OrderSelectedProduct) => void
  removeSelectedProduct: (productId: number) => void
  updateFormData: (payload: Partial<OrderFormData>) => void
  addImage: (image: TempUploadItem) => void
  removeImage: (imageId: string) => void
  setImages: (images: TempUploadItem[]) => void
  setLoading: (value: boolean) => void
  setError: (value: string | null) => void
  resetOrder: () => void
}

const initialFormData: OrderFormData = {
  adminId: 1,
  requestNote: '',
  centerName: '',
  writerPhone: '',
  recipientName: '',
  gender: '',
  copayType: '',
  contactPhone1: '',
  contactPhone2: '',
  roadAddress: '',
  detailAddress: '',
  zipCode: '',
  tempImageIds: [],
}

export const useOrderStore = create<OrderStoreState>((set) => ({
  categories: [],
  selectedCategoryId: null,
  productMapByCategory: {},
  selectedProductMap: new Map<number, OrderSelectedProduct>(),
  formData: initialFormData,
  images: [],
  isLoading: false,
  error: null,

  setCategories: (categories) =>
    set(() => ({
      categories,
      selectedCategoryId: categories.length > 0 ? categories[0].id : null,
    })),

  setSelectedCategoryId: (categoryId) =>
    set(() => ({
      selectedCategoryId: categoryId,
    })),

  setProductsByCategory: (categoryId, products) =>
    set((state) => ({
      productMapByCategory: {
        ...state.productMapByCategory,
        [categoryId]: products,
      },
    })),

  toggleProduct: (product) =>
    set((state) => {
      const nextMap = new Map(state.selectedProductMap)
      if (nextMap.has(product.id)) {
        nextMap.delete(product.id)
      } else {
        nextMap.set(product.id, product)
      }
      return {
        selectedProductMap: nextMap,
      }
    }),

  removeSelectedProduct: (productId) =>
    set((state) => {
      const nextMap = new Map(state.selectedProductMap)
      nextMap.delete(productId)
      return {
        selectedProductMap: nextMap,
      }
    }),

  updateFormData: (payload) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...payload,
      },
    })),

  addImage: (image) =>
    set((state) => {
      const nextImages = [...state.images, image].slice(0, 5)
      return {
        images: nextImages,
        formData: {
          ...state.formData,
          tempImageIds: nextImages.map((item) => item.id),
        },
      }
    }),

  removeImage: (imageId) =>
    set((state) => {
      const nextImages = state.images.filter((item) => item.id !== imageId)
      return {
        images: nextImages,
        formData: {
          ...state.formData,
          tempImageIds: nextImages.map((item) => item.id),
        },
      }
    }),

  setImages: (images) =>
    set((state) => ({
      images,
      formData: {
        ...state.formData,
        tempImageIds: images.map((item) => item.id),
      },
    })),

  setLoading: (value) =>
    set(() => ({
      isLoading: value,
    })),

  setError: (value) =>
    set(() => ({
      error: value,
    })),

  resetOrder: () =>
    set(() => ({
      selectedCategoryId: null,
      productMapByCategory: {},
      selectedProductMap: new Map<number, OrderSelectedProduct>(),
      formData: initialFormData,
      images: [],
      isLoading: false,
      error: null,
    })),
}))
