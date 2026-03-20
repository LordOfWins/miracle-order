// [원인] 버튼에 min-h-0으로 글로벌 52px이 무시됨 + 드래그 핸들이 모바일에서 터치 영역 부족 + 수정/삭제 버튼이 한 줄에 못 들어감
// [수정] 모바일에서 카드형 2줄 레이아웃 + 터치 드래그 영역 52px 보장 + 버튼 min-height 복원

// src/components/admin/CategoryManager.tsx

'use client'

import { useAdminStore } from '@/store/admin'
import type { CategoryItem } from '@/types/api'
import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { useCallback, useEffect } from 'react'
import CategoryModal from './CategoryModal'

function SortableCategoryRow({
  category,
  index,
}: {
  category: CategoryItem
  index: number
}) {
  const { ref, isDragging } = useSortable({
    id: `cat-${category.id}`,
    index,
  })

  const { setEditingCategory, setCategoryModalOpen, removeCategory } =
    useAdminStore()

  const handleEdit = () => {
    setEditingCategory(category)
    setCategoryModalOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?\n하위 제품도 함께 삭제됩니다`))
      return

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        removeCategory(category.id)
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
      {/* 상단: 드래그 핸들 + 카테고리명 + 순번 */}
      <div className="flex items-center gap-3">
        <span
          className="cursor-grab active:cursor-grabbing text-gray-400 text-xl select-none flex items-center justify-center flex-shrink-0 touch-manipulation"
          style={{ minWidth: '52px', minHeight: '52px' }}
          aria-label="드래그하여 순서 변경"
          role="img"
        >
          ☰
        </span>
        <span className="flex-1 font-medium text-gray-800 text-lg truncate">
          {category.name}
        </span>
        <span className="text-base text-gray-400 flex-shrink-0">#{index + 1}</span>
      </div>

      {/* 하단: 수정/삭제 버튼 — 모바일에서 충분한 터치 영역 */}
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

export default function CategoryManager() {
  const {
    categories,
    setCategories,
    reorderCategories,
    categoryModalOpen,
    setCategoryModalOpen,
    setEditingCategory,
  } = useAdminStore()

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const result = await res.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch {
      console.error('카테고리 로딩 실패')
    }
  }, [setCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleDragEnd = async (event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>>[0]) => {
    if (event.canceled) return

    const { source } = event.operation
    if (!isSortable(source)) return

    const { initialIndex, index } = source.sortable
    if (initialIndex === index) return

    const newCategories = [...categories]
    const [moved] = newCategories.splice(initialIndex, 1)
    newCategories.splice(index, 0, moved)

    const reordered = newCategories.map((c, i) => ({ ...c, sortOrder: i }))
    reorderCategories(reordered)

    try {
      const res = await fetch('/api/admin/categories/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reordered.map((c) => ({ id: c.id, sortOrder: c.sortOrder })),
        }),
      })
      const result = await res.json()
      if (!result.success) {
        fetchCategories()
      }
    } catch {
      fetchCategories()
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setCategoryModalOpen(true)
  }

  return (
    <div>
      {/* 헤더: 모바일에서 세로 스택 */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg"
          style={{ minHeight: '52px' }}
        >
          + 카테고리 추가
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-lg">
          등록된 카테고리가 없습니다
        </div>
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="space-y-3">
            {categories.map((cat, index) => (
              <SortableCategoryRow
                key={cat.id}
                category={cat}
                index={index}
              />
            ))}
          </div>
        </DragDropProvider>
      )}

      {categoryModalOpen && <CategoryModal onSuccess={fetchCategories} />}
    </div>
  )
}
