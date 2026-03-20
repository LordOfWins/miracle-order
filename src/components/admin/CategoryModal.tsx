// [원인] max-w-md 고정 모달이 모바일에서 좌우 여백이 너무 좁고 스크롤 불가 + 버튼 min-height 48px로 52px 기준 미달
// [수정] 모바일에서 풀스크린 모달 + 데스크톱에서 기존 중앙 모달 유지 + 버튼 52px

// src/components/admin/CategoryModal.tsx

'use client'

import { useAdminStore } from '@/store/admin'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해주세요').max(100),
})

type CategoryFormData = z.infer<typeof categorySchema>

export default function CategoryModal({
  onSuccess,
}: {
  onSuccess: () => void
}) {
  const {
    editingCategory,
    setCategoryModalOpen,
    setEditingCategory,
    addCategory,
    updateCategory,
  } = useAdminStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const isEdit = !!editingCategory

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: editingCategory?.name || '',
    },
  })

  const forceClose = useCallback(() => {
    setCategoryModalOpen(false)
    setEditingCategory(null)
  }, [setCategoryModalOpen, setEditingCategory])

  const safeClose = useCallback(() => {
    if (isDirty) {
      if (!window.confirm('작성 중인 내용이 사라집니다')) return
    }
    forceClose()
  }, [isDirty, forceClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') safeClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    // 모달 열렸을 때 body 스크롤 방지
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [safeClose])

  useEffect(() => {
    const firstInput = modalRef.current?.querySelector<HTMLInputElement>('input')
    firstInput?.focus()
  }, [])

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        if (result.success) {
          updateCategory(editingCategory.id, data.name)
          forceClose()
          onSuccess()
        } else {
          setError(result.error || '수정 실패')
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        if (result.success) {
          addCategory(result.data)
          forceClose()
          onSuccess()
        } else {
          setError(result.error || '추가 실패')
        }
      }
    } catch {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      {/*
        모바일: 하단에서 올라오는 바텀시트 (rounded-t + w-full + max-h)
        데스크톱: 기존 중앙 모달 (rounded-2xl + max-w-md)
      */}
      <div
        ref={modalRef}
        className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl md:max-w-md md:mx-4 shadow-xl"
      >
        {/* 모바일 드래그 핸들 인디케이터 */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-6">
          <h2 id="category-modal-title" className="text-xl font-bold mb-5">
            {isEdit ? '카테고리 수정' : '카테고리 추가'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="category-name" className="block text-lg font-medium text-gray-700 mb-1">
                카테고리 이름
              </label>
              <input
                id="category-name"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                placeholder="예: 수동휠체어"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'category-name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="category-name-error" className="mt-1 text-base text-red-500" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-base" role="alert">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={safeClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-lg font-medium"
                style={{ minHeight: '52px' }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition font-medium text-lg"
                style={{ minHeight: '52px' }}
              >
                {loading ? '처리 중...' : isEdit ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
