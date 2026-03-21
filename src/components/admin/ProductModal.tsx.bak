// [원인] CategoryModal과 동일 — 모바일에서 모달이 좁고 스크롤 안 됨 + 이미지 업로드 영역이 모바일에서 넘침
// [수정] 모바일 바텀시트 + 데스크톱 중앙 모달 + 이미지 영역 비율 조정 + body 스크롤 잠금

// src/components/admin/ProductModal.tsx

'use client'

import { useAdminStore } from '@/store/admin'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, '제품명을 입력해주세요').max(200),
  price: z.coerce.number().min(0, '가격은 0 이상이어야 합니다'),
})

type ProductFormData = z.infer<typeof productSchema>

export default function ProductModal({
  onSuccess,
}: {
  onSuccess: () => void
}) {
  const {
    editingProduct,
    selectedCategoryId,
    setProductModalOpen,
    setEditingProduct,
    addProduct,
    updateProduct,
  } = useAdminStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(
    editingProduct?.imageUrl || null
  )
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const initialImageUrl = useRef(editingProduct?.imageUrl || null)

  const isEdit = !!editingProduct

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: editingProduct?.name || '',
      price: editingProduct?.price || 0,
    },
  })

  const forceClose = useCallback(() => {
    setProductModalOpen(false)
    setEditingProduct(null)
  }, [setProductModalOpen, setEditingProduct])

  const safeClose = useCallback(() => {
    const imageChanged = imageUrl !== initialImageUrl.current
    if (isDirty || imageChanged) {
      if (!window.confirm('작성 중인 내용이 사라집니다')) return
    }
    forceClose()
  }, [isDirty, imageUrl, forceClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') safeClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [safeClose])

  useEffect(() => {
    const firstInput = modalRef.current?.querySelector<HTMLInputElement>('input[type="text"]')
    firstInput?.focus()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()

      if (result.success) {
        setImageUrl(result.data.imageUrl)
      } else {
        setError(result.error || '업로드 실패')
      }
    } catch {
      setError('이미지 업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    setImageUrl(null)
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            imageUrl,
          }),
        })
        const result = await res.json()
        if (result.success) {
          updateProduct(editingProduct.id, {
            name: data.name,
            price: data.price,
            imageUrl,
          })
          forceClose()
          onSuccess()
        } else {
          setError(result.error || '수정 실패')
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: selectedCategoryId,
            ...data,
            imageUrl,
          }),
        })
        const result = await res.json()
        if (result.success) {
          addProduct(result.data)
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
      aria-labelledby="product-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-h-[95vh] overflow-y-auto rounded-t-2xl md:rounded-2xl md:max-w-md md:mx-4 shadow-xl"
      >
        {/* 모바일 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-6">
          <h2 id="product-modal-title" className="text-xl font-bold mb-5">
            {isEdit ? '제품 수정' : '제품 추가'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* 이미지 업로드 */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                제품 이미지
              </label>
              {imageUrl ? (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-2">
                  <Image
                    src={imageUrl}
                    alt="제품 이미지"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-red-600 focus-visible:ring-4 focus-visible:ring-red-200"
                    style={{ minHeight: '48px' }}
                    aria-label="이미지 삭제"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="w-full aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition focus-visible:ring-4 focus-visible:ring-blue-200 outline-none"
                  aria-label="클릭하여 제품 이미지 업로드"
                >
                  {uploading ? (
                    <span className="text-gray-500 text-lg">업로드 중...</span>
                  ) : (
                    <>
                      <span className="text-3xl text-gray-300 mb-2" aria-hidden="true">📷</span>
                      <span className="text-lg text-gray-400">
                        클릭하여 이미지 업로드
                      </span>
                      <span className="text-base text-gray-300 mt-1">
                        JPG/PNG 5MB 이하
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageUpload}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            {/* 제품명 */}
            <div>
              <label htmlFor="product-name" className="block text-lg font-medium text-gray-700 mb-1">
                제품명
              </label>
              <input
                id="product-name"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                placeholder="예: 미카코리아 MIKI-M"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'product-name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="product-name-error" className="mt-1 text-base text-red-500" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* 가격 */}
            <div>
              <label htmlFor="product-price" className="block text-lg font-medium text-gray-700 mb-1">
                가격 (원)
              </label>
              <input
                id="product-price"
                type="number"
                inputMode="numeric"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                placeholder="0"
                min={0}
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? 'product-price-error' : undefined}
                {...register('price')}
              />
              {errors.price && (
                <p id="product-price-error" className="mt-1 text-base text-red-500" role="alert">
                  {errors.price.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-base" role="alert">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2 pb-safe">
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
                disabled={loading || uploading}
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
