
// src/components/admin/ProductManager.tsx
'use client'
import { useAdminStore } from '@/store/admin'
import type { ProductItem } from '@/types/api'
import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import Image from 'next/image'
import { useCallback, useEffect } from 'react'
import ProductModal from './ProductModal'

function SortableProductRow({
  product,
  index,
}: {
  product: ProductItem
  index: number
}) {
  const { ref, isDragging } = useSortable({
    id: `prod-${product.id}`,
    index,
  })
  const { setEditingProduct, setProductModalOpen, removeProduct } =
    useAdminStore()

  const handleEdit = () => {
    setEditingProduct(product)
    setProductModalOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm(`"${product.name}" 제품을 삭제하시겠습니까?`)) return
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        removeProduct(product.id)
      } else {
        alert(result.error || '삭제 실패')
      }
    } catch {
      alert('네트워크 오류')
    }
  }

  return (
    <div
      ref={ref}
      className={`bg-white border border-gray-200 rounded-xl px-4 py-3 transition ${
        isDragging ? 'opacity-50 shadow-lg scale-[1.02]' : ''
      }`}
    >
      {/* 상단: 드래그 핸들 + 이미지 + 제품정보 + 순번 */}
      <div className="flex items-center gap-3">
        <span
          className="cursor-grab active:cursor-grabbing text-gray-400 text-xl select-none flex items-center justify-center flex-shrink-0 touch-manipulation"
          style={{ minWidth: '52px', minHeight: '52px' }}
        >
          ☰
        </span>

        {product.imageUrl ? (
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs">
            없음
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-lg truncate">{product.name}</p>
          <p className="text-base text-gray-500">
            {product.price > 0
              ? `${product.price.toLocaleString()}원`
              : '가격 미정'}
          </p>
        </div>

        <span className="text-base text-gray-400 flex-shrink-0">#{index + 1}</span>
      </div>

      {/* 하단: 수정/삭제 버튼 */}
      <div className="flex gap-2 mt-2 ml-[52px]">
        <button
          onClick={handleEdit}
          className="flex-1 px-4 py-2.5 text-base bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition font-medium"
          style={{ minHeight: '48px' }}
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-2.5 text-base bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium"
          style={{ minHeight: '48px' }}
        >
          삭제
        </button>
      </div>
    </div>
  )
}

export default function ProductManager() {
  const {
    categories,
    setCategories,
    selectedCategoryId,
    setSelectedCategoryId,
    products,
    setProducts,
    reorderProducts,
    productModalOpen,
    setProductModalOpen,
    setEditingProduct,
  } = useAdminStore()

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const result = await res.json()
      if (result.success) {
        setCategories(result.data)
        if (result.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(result.data[0].id)
        }
      }
    } catch {
      console.error('카테고리 로딩 실패')
    }
  }, [setCategories, setSelectedCategoryId, selectedCategoryId])

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProducts = useCallback(async () => {
    if (!selectedCategoryId) {
      setProducts([])
      return
    }
    try {
      const res = await fetch(
        `/api/admin/products?categoryId=${selectedCategoryId}`
      )
      const result = await res.json()
      if (result.success) {
        setProducts(result.data)
      }
    } catch {
      console.error('제품 로딩 실패')
    }
  }, [selectedCategoryId, setProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDragEnd = async ({
    canceled,
    operation,
  }: {
    canceled: boolean
    operation: { source: unknown }
  }) => {
    if (canceled) return
    const { source } = operation
    if (!isSortable(source as any)) return
    const { initialIndex, index } = (source as any).sortable
    if (initialIndex === index) return

    const newProducts = [...products]
    const [moved] = newProducts.splice(initialIndex, 1)
    newProducts.splice(index, 0, moved)

    const reordered = newProducts.map((p, i) => ({ ...p, sortOrder: i }))
    reorderProducts(reordered)

    try {
      const res = await fetch('/api/admin/products/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reordered.map((p) => ({ id: p.id, sortOrder: p.sortOrder })),
        }),
      })
      const result = await res.json()
      if (!result.success) {
        fetchProducts()
      }
    } catch {
      fetchProducts()
    }
  }

  const handleAdd = () => {
    if (!selectedCategoryId) {
      alert('카테고리를 먼저 선택해주세요')
      return
    }
    setEditingProduct(null)
    setProductModalOpen(true)
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">제품 관리</h1>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg"
          style={{ minHeight: '52px' }}
        >
          + 제품 추가
        </button>
      </div>

      {/*
        ★ 핵심 수정: 카테고리 탭
        - 모바일(md 미만): overflow-x-auto 가로 스크롤 (한 줄)
        - 데스크톱(md 이상): flex-wrap 줄바꿈 허용 (모든 탭 노출)
      */}
      <div
        className="flex gap-2 mb-6 pb-2 overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-x-visible md:pb-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl whitespace-nowrap transition text-lg font-medium ${
              selectedCategoryId === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{ minHeight: '52px' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {!selectedCategoryId ? (
        <div className="text-center py-16 text-gray-400 text-lg">
          카테고리를 선택해주세요
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-lg">
          등록된 제품이 없습니다
        </div>
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="space-y-3">
            {products.map((prod, index) => (
              <SortableProductRow
                key={prod.id}
                product={prod}
                index={index}
              />
            ))}
          </div>
        </DragDropProvider>
      )}

      {productModalOpen && (
        <ProductModal onSuccess={fetchProducts} />
      )}
    </div>
  )
}
