// src/store/admin.ts

import type { AdminSettingItem, CategoryItem, ProductItem } from '@/types/api'
import { create } from 'zustand'

interface AdminState {
  // 카테고리
  categories: CategoryItem[]
  setCategories: (categories: CategoryItem[]) => void
  addCategory: (category: CategoryItem) => void
  updateCategory: (id: number, name: string) => void
  removeCategory: (id: number) => void
  reorderCategories: (categories: CategoryItem[]) => void

  // 제품
  selectedCategoryId: number | null
  setSelectedCategoryId: (id: number | null) => void
  products: ProductItem[]
  setProducts: (products: ProductItem[]) => void
  addProduct: (product: ProductItem) => void
  updateProduct: (id: number, data: Partial<ProductItem>) => void
  removeProduct: (id: number) => void
  reorderProducts: (products: ProductItem[]) => void

  // 설정
  setting: AdminSettingItem | null
  setSetting: (setting: AdminSettingItem) => void

  // 모달
  categoryModalOpen: boolean
  setCategoryModalOpen: (open: boolean) => void
  editingCategory: CategoryItem | null
  setEditingCategory: (category: CategoryItem | null) => void

  productModalOpen: boolean
  setProductModalOpen: (open: boolean) => void
  editingProduct: ProductItem | null
  setEditingProduct: (product: ProductItem | null) => void
}

export const useAdminStore = create<AdminState>((set) => ({
  // 카테고리
  categories: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, name } : c
      ),
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      selectedCategoryId:
        state.selectedCategoryId === id ? null : state.selectedCategoryId,
      products:
        state.selectedCategoryId === id ? [] : state.products,
    })),
  reorderCategories: (categories) => set({ categories }),

  // 제품
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  reorderProducts: (products) => set({ products }),

  // 설정
  setting: null,
  setSetting: (setting) => set({ setting }),

  // 모달
  categoryModalOpen: false,
  setCategoryModalOpen: (open) => set({ categoryModalOpen: open }),
  editingCategory: null,
  setEditingCategory: (category) => set({ editingCategory: category }),

  productModalOpen: false,
  setProductModalOpen: (open) => set({ productModalOpen: open }),
  editingProduct: null,
  setEditingProduct: (product) => set({ editingProduct: product }),
}))
