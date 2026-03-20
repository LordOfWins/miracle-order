// [원인] 제품명(영문+괄호)이 한 단어로 인식되어 줄바꿈 없이 확장 → "선택" 뱃지가 카드 밖으로 밀림
// [수정] 제품명에 break-all 적용 + "선택" 뱃지를 제품명과 분리된 고정 영역으로 변경

// src/components/order/ProductGrid.tsx

'use client'

import { formatPrice } from '@/lib/format'
import type { PublicProductItem } from '@/types/order'
import Image from 'next/image'
import { useCallback } from 'react'

interface ProductGridProps {
  categoryId: number | null
  products: PublicProductItem[]
  selectedProductIds: Set<number>
  onToggle: (product: PublicProductItem) => void
  isLoading: boolean
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex gap-4">
        <div className="h-28 w-28 flex-shrink-0 rounded-xl bg-gray-200" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="h-6 w-3/4 rounded-lg bg-gray-200" />
            <div className="h-7 w-16 rounded-full bg-gray-200" />
          </div>
          <div className="h-6 w-1/2 rounded-lg bg-gray-200" />
          <div className="h-5 w-full rounded-lg bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

export default function ProductGrid({
  categoryId,
  products,
  selectedProductIds,
  onToggle,
  isLoading,
}: ProductGridProps) {
  const handleToggle = useCallback(
    (product: PublicProductItem) => {
      onToggle(product)
    },
    [onToggle],
  )

  return (
    <section
      aria-labelledby="product-section-title"
      id={categoryId ? `category-panel-${categoryId}` : undefined}
      role={categoryId ? 'tabpanel' : undefined}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 id="product-section-title" className="text-xl font-bold text-gray-900">
          제품 선택
        </h2>
        <span className="text-base font-medium text-gray-600">
          복수 선택 가능
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center text-lg text-gray-600">
          이 카테고리에 등록된 제품이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map((product) => {
            const checked = selectedProductIds.has(product.id)

            return (
              <label
                key={product.id}
                className={`block cursor-pointer rounded-2xl border bg-white p-4 transition outline-none focus-within:ring-4 focus-within:ring-blue-200 ${checked
                    ? 'border-blue-700 ring-2 ring-blue-700'
                    : 'border-gray-300 hover:border-blue-400'
                  }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => handleToggle(product)}
                  aria-label={`${product.name} 선택`}
                />

                <div className="flex gap-4">
                  {/* 이미지: 고정 크기 */}
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base font-medium text-gray-500">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/*
                    ★ 핵심 수정: 텍스트 영역
                    - min-w-0 + flex-1: 부모 flex에서 텍스트가 넘치지 않게 제한
                    - overflow-hidden: 혹시 모를 넘침 방지
                  */}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    {/*
                      ★ 핵심 수정: 제품명 + 선택 뱃지 행
                      - gap-2로 줄이고 items-start 유지
                      - 제품명: break-all로 영문+괄호 강제 줄바꿈
                      - 뱃지: flex-shrink-0 + 고정 너비로 절대 밀리지 않음
                    */}
                    <div className="mb-2 flex items-start gap-2">
                      <p className="flex-1 break-all text-xl font-bold leading-snug text-gray-900">
                        {product.name}
                      </p>
                      <span
                        className={`mt-0.5 flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-base font-bold ${checked
                            ? 'bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                        aria-hidden="true"
                      >
                        {checked ? '선택됨' : '선택'}
                      </span>
                    </div>

                    <p className="text-xl font-semibold text-blue-700">
                      {product.price > 0 ? formatPrice(product.price) : '가격 문의'}
                    </p>

                    {product.note ? (
                      <p className="mt-2 line-clamp-2 break-all text-base leading-7 text-gray-600">
                        {product.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      )}
    </section>
  )
}
