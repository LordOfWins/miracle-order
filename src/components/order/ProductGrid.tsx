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
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-3">
      <div className="aspect-square w-full rounded-xl bg-gray-200" />
      <div className="mt-2 h-5 w-3/4 rounded-lg bg-gray-200" />
      <div className="mt-1 h-5 w-1/2 rounded-lg bg-gray-200" />
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
        <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => {
            const checked = selectedProductIds.has(product.id)

            return (
              <label
                key={product.id}
                className={`relative block cursor-pointer rounded-2xl border bg-white p-3 transition outline-none focus-within:ring-4 focus-within:ring-blue-200 ${checked
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

                <span
                  className={`absolute top-2 right-2 z-10 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${checked
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700'
                    }`}
                  aria-hidden="true"
                >
                  {checked ? '선택됨' : '선택'}
                </span>

                <div className="flex flex-col">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 45vw, 280px"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-500">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  <p className="mt-2 truncate text-base font-bold leading-snug text-gray-900 md:text-lg">
                    {product.name}
                  </p>

                  <p className="mt-1 text-base font-semibold text-blue-700 md:text-lg">
                    {product.price > 0 ? formatPrice(product.price) : '가격 문의'}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      )}
    </section>
  )
}
